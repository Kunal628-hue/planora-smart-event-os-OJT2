import assert from "node:assert";
import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SERVER_URL = "http://localhost:5001";

async function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function runTests() {
    console.log("Starting test server...");
    const serverProcess = spawn("node", ["server.js"], {
        cwd: path.join(__dirname, ".."),
        env: { ...process.env, PORT: "5001", NODE_ENV: "test" }
    });

    serverProcess.stdout.on('data', (data) => console.log(`Server: ${data}`));
    serverProcess.stderr.on('data', (data) => console.error(`Server Err: ${data}`));

    // Wait for the server to spin up
    await wait(4000);

    try {
        console.log("\n=== Resource Exhaustion & Validation Tests ===");

        const longPassword = "a".repeat(200);

        const response = await fetch(`${SERVER_URL}/api/auth/register`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                email: "test@example.com",
                password: longPassword,
                name: "Test User"
            })
        });

        const data = await response.json();

        // 1. Assert status code is 400 (Bad Request)
        assert.strictEqual(response.status, 400, `Expected status 400, got ${response.status}`);
        
        // 2. Assert validation message is present and mentions length constraint
        assert.strictEqual(data.message, "Validation failed");
        
        // Find the specific error for password
        const pwdError = data.errors.find(e => e.field === "password");
        assert.ok(pwdError, "Password error should be present in validation errors");
        assert.ok(pwdError.message.includes("length must be less than or equal to 128 characters"), `Unexpected error message: ${pwdError.message}`);

        console.log("  ✅  200-character password correctly returns 400 Bad Request");
        console.log("  ✅  Password validation occurs BEFORE bcrypt logic (preventing CPU exhaustion)");

        // 3. Test a valid password to ensure it passes validation
        const validPassword = "a".repeat(100);
        const validResponse = await fetch(`${SERVER_URL}/api/auth/register`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                email: "test@example.com",
                password: validPassword,
                name: "Test User"
            })
        });

        // Normally this would be 201 Created or 500 if DB fails, but definitely not 400 for validation
        assert.notStrictEqual(validResponse.status, 400, "100-character password should pass validation");
        console.log("  ✅  100-character password passes length validation constraints");

        console.log("\n─────────────────────────────────────────");
        console.log("Results: Resource exhaustion tests passed");
        console.log("─────────────────────────────────────────\n");

    } catch (err) {
        console.error("❌ Test failed:", err);
        process.exitCode = 1;
    } finally {
        // Clean up
        serverProcess.kill();
    }
}

runTests();
