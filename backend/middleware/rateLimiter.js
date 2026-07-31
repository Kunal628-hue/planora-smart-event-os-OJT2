/**
 * Tiered Rate Limiting Middleware for Planora Backend
 * - Auth Routes: Per-IP & Per-Account rate limiting with exponential backoff
 * - Public Routes: Moderate rate limits
 * - Authenticated User Actions: Looser rate limits
 * - Fully configurable via environment variables or getRateLimitConfig()
 */

import { getRateLimitConfig } from "../config/rateLimitConfig.js";

// In-Memory Stores
const ipStore = new Map();        // key: ip -> { count, firstSeen, lastSeen, attempts }
const accountStore = new Map();   // key: accountIdentifier -> { count, firstSeen, lastSeen, attempts }
const publicStore = new Map();    // key: ip -> { count, resetTime }
const authenticatedStore = new Map(); // key: userKey -> { count, resetTime }

// Automated Memory Cleanup Interval (Garbage Collection every 5 minutes)
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000;
const cleanupTimer = setInterval(() => {
  const now = Date.now();
  const config = getRateLimitConfig();

  // Cleanup IP Store
  for (const [key, data] of ipStore.entries()) {
    if (now - data.lastSeen > config.auth.ipWindowMs) {
      ipStore.delete(key);
    }
  }

  // Cleanup Account Store
  for (const [key, data] of accountStore.entries()) {
    if (now - data.lastSeen > config.auth.accountWindowMs) {
      accountStore.delete(key);
    }
  }

  // Cleanup Public Store
  for (const [key, data] of publicStore.entries()) {
    if (now > data.resetTime) {
      publicStore.delete(key);
    }
  }

  // Cleanup Authenticated Store
  for (const [key, data] of authenticatedStore.entries()) {
    if (now > data.resetTime) {
      authenticatedStore.delete(key);
    }
  }
}, CLEANUP_INTERVAL_MS);

if (cleanupTimer.unref) {
  cleanupTimer.unref(); // Prevent blocking process exit during tests
}

/**
 * Reset all rate limit stores (useful for automated testing)
 */
export const resetRateLimitStores = () => {
  ipStore.clear();
  accountStore.clear();
  publicStore.clear();
  authenticatedStore.clear();
};

/**
 * Calculate Exponential Backoff Delay (in milliseconds)
 */

export const calculateExponentialBackoff = (attempts, baseMs, factor, maxDelayMs) => {
  if (attempts <= 1) return baseMs;
  const delay = baseMs * Math.pow(factor, attempts - 1);
  return Math.min(delay, maxDelayMs);
};

/**
 * Helper to extract client IP address
 */
const getClientIp = (req) => {
  return (
    req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
    req.ip ||
    req.socket?.remoteAddress ||
    "127.0.0.1"
  );
};

/**
 * Helper to extract Account Identifier (email / username / phone) from body
 */
const getAccountIdentifier = (req) => {
  if (!req.body || typeof req.body !== "object") return null;
  const rawId = req.body.email || req.body.username || req.body.phone || req.body.identifier;
  return rawId ? String(rawId).toLowerCase().trim() : null;
};

/**
 * 1. Auth Rate Limiter (Per-IP & Per-Account with Exponential Backoff)
 */
export const authRateLimiter = (req, res, next) => {
  const config = getRateLimitConfig().auth;
  const now = Date.now();
  const ip = getClientIp(req);
  const accountId = getAccountIdentifier(req);

  // --- IP Tracking ---
  let ipRecord = ipStore.get(ip);
  if (!ipRecord || (now - ipRecord.firstSeen > config.ipWindowMs)) {
    ipRecord = { count: 1, firstSeen: now, lastSeen: now, attempts: 1 };
  } else {
    ipRecord.count += 1;
    ipRecord.attempts += 1;
    ipRecord.lastSeen = now;
  }
  ipStore.set(ip, ipRecord);

  // --- Account Tracking (If identifier present in body) ---
  let accountRecord = null;
  if (accountId) {
    accountRecord = accountStore.get(accountId);
    if (!accountRecord || (now - accountRecord.firstSeen > config.accountWindowMs)) {
      accountRecord = { count: 1, firstSeen: now, lastSeen: now, attempts: 1 };
    } else {
      accountRecord.count += 1;
      accountRecord.attempts += 1;
      accountRecord.lastSeen = now;
    }
    accountStore.set(accountId, accountRecord);
  }

  // Determine effective attempt count
  const effectiveAttempts = Math.max(
    ipRecord.attempts,
    accountRecord ? accountRecord.attempts : 0
  );

  // Calculate exponential backoff delay
  const backoffMs = calculateExponentialBackoff(
    effectiveAttempts,
    config.backoffBaseMs,
    config.backoffFactor,
    config.maxDelayMs
  );

  // Remaining limits calculations
  const remainingIp = Math.max(0, config.ipMax - ipRecord.count);
  const remainingAccount = accountRecord ? Math.max(0, config.accountMax - accountRecord.count) : config.accountMax;

  // Set informative rate limit headers
  res.setHeader("X-RateLimit-Limit-IP", config.ipMax);
  res.setHeader("X-RateLimit-Remaining-IP", remainingIp);
  if (accountId) {
    res.setHeader("X-RateLimit-Limit-Account", config.accountMax);
    res.setHeader("X-RateLimit-Remaining-Account", remainingAccount);
  }
  res.setHeader("X-RateLimit-Backoff-Ms", backoffMs);

  // Reset account attempt counter & IP counter on successful login / verification (2xx status)
  res.on("finish", () => {
    if (res.statusCode >= 200 && res.statusCode < 300) {
      if (accountId) {
        accountStore.delete(accountId);
      }
      if (ip) {
        ipStore.delete(ip);
      }
    }
  });

  // Check if IP or Account limit exceeded
  const isIpExceeded = ipRecord.count > config.ipMax;
  const isAccountExceeded = accountRecord && accountRecord.count > config.accountMax;

  if (isIpExceeded || isAccountExceeded) {
    const retryAfterSec = Math.ceil(backoffMs / 1000);
    res.setHeader("Retry-After", retryAfterSec);

    return res.status(429).json({
      error: "Too Many Requests",
      message: "Authentication rate limit exceeded. Please wait before trying again.",
      retryAfterSeconds: retryAfterSec,
      backoffMs,
      limitType: isAccountExceeded ? "account" : "ip"
    });
  }

  next();
};

/**
 * 2. Public Rate Limiter (Moderate Limits)
 */
export const publicRateLimiter = (req, res, next) => {
  const config = getRateLimitConfig().public;
  const now = Date.now();
  const ip = getClientIp(req);

  let record = publicStore.get(ip);

  if (!record || now > record.resetTime) {
    record = { count: 1, resetTime: now + config.windowMs };
  } else {
    record.count += 1;
  }
  publicStore.set(ip, record);

  const remaining = Math.max(0, config.max - record.count);
  const resetSeconds = Math.ceil((record.resetTime - now) / 1000);

  res.setHeader("X-RateLimit-Limit", config.max);
  res.setHeader("X-RateLimit-Remaining", remaining);
  res.setHeader("X-RateLimit-Reset", resetSeconds);

  if (record.count > config.max) {
    res.setHeader("Retry-After", resetSeconds);
    return res.status(429).json({
      error: "Too Many Requests",
      message: "Public endpoint rate limit exceeded. Please slow down your requests.",
      retryAfterSeconds: resetSeconds
    });
  }

  next();
};

/**
 * 3. Authenticated User Action Rate Limiter (Looser Limits)
 */
export const authenticatedRateLimiter = (req, res, next) => {
  const config = getRateLimitConfig().authenticated;
  const now = Date.now();
  const userKey = req.user?.id || req.user?.uid || req.headers.authorization || getClientIp(req);

  let record = authenticatedStore.get(userKey);

  if (!record || now > record.resetTime) {
    record = { count: 1, resetTime: now + config.windowMs };
  } else {
    record.count += 1;
  }
  authenticatedStore.set(userKey, record);

  const remaining = Math.max(0, config.max - record.count);
  const resetSeconds = Math.ceil((record.resetTime - now) / 1000);

  res.setHeader("X-RateLimit-Limit", config.max);
  res.setHeader("X-RateLimit-Remaining", remaining);
  res.setHeader("X-RateLimit-Reset", resetSeconds);

  if (record.count > config.max) {
    res.setHeader("Retry-After", resetSeconds);
    return res.status(429).json({
      error: "Too Many Requests",
      message: "User rate limit exceeded. Please slow down your activity.",
      retryAfterSeconds: resetSeconds
    });
  }

  next();
};
