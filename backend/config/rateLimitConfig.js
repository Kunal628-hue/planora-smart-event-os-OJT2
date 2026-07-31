/**
 * Planora Rate Limit Configuration
 * Configurable thresholds for authentication, public, and authenticated endpoints.
 */

export const getRateLimitConfig = () => ({
  auth: {
    ipWindowMs: parseInt(process.env.RATE_LIMIT_AUTH_IP_WINDOW_MS || "900000", 10), // 15 mins default
    ipMax: parseInt(process.env.RATE_LIMIT_AUTH_IP_MAX || "10", 10),
    accountWindowMs: parseInt(process.env.RATE_LIMIT_AUTH_ACCOUNT_WINDOW_MS || "900000", 10), // 15 mins default
    accountMax: parseInt(process.env.RATE_LIMIT_AUTH_ACCOUNT_MAX || "5", 10),
    backoffBaseMs: parseInt(process.env.RATE_LIMIT_AUTH_BACKOFF_BASE_MS || "1000", 10), // 1s base default
    backoffFactor: parseFloat(process.env.RATE_LIMIT_AUTH_BACKOFF_FACTOR || "2"),
    maxDelayMs: parseInt(process.env.RATE_LIMIT_AUTH_MAX_DELAY_MS || "30000", 10) // 30s max backoff delay
  },
  public: {
    windowMs: parseInt(process.env.RATE_LIMIT_PUBLIC_WINDOW_MS || "900000", 10), // 15 mins default
    max: parseInt(process.env.RATE_LIMIT_PUBLIC_MAX || "100", 10)
  },
  authenticated: {
    windowMs: parseInt(process.env.RATE_LIMIT_AUTHENTICATED_WINDOW_MS || "900000", 10), // 15 mins default
    max: parseInt(process.env.RATE_LIMIT_AUTHENTICATED_MAX || "500", 10)
  }
});
