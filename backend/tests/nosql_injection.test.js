import http from 'http';
import app from '../server.js';
import dotenv from 'dotenv';
dotenv.config();

const PORT = process.env.TEST_PORT || 5005;

const runTest = async () => {
    console.log("Running NoSQL Injection Prevention Test...");
    process.env.NODE_ENV = 'test';
    
    const server = app.listen(PORT, async () => {
        try {
            const payload = JSON.stringify({
                email: { "$ne": null },
                password: { "$gt": "" }
            });

            const options = {
                hostname: 'localhost',
                port: PORT,
                path: '/api/auth/login',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Length': payload.length
                }
            };

            const req = http.request(options, (res) => {
                let data = '';
                res.on('data', chunk => data += chunk);
                res.on('end', () => {
                    if (res.statusCode === 400) {
                        console.log('✅ NoSQL Injection prevented. Received 400 Bad Request.');
                        server.close();
                        process.exit(0);
                    } else if (res.statusCode === 200) {
                        console.error('❌ VULNERABILITY: NoSQL Injection succeeded! Received 200 OK.');
                        server.close();
                        process.exit(1);
                    } else {
                        console.error(`⚠️ Unexpected status code ${res.statusCode} received. Body: ${data}`);
                        server.close();
                        process.exit(res.statusCode === 400 ? 0 : 1);
                    }
                });
            });

            req.on('error', (e) => {
                console.error(`Request failed: ${e.message}`);
                server.close();
                process.exit(1);
            });

            req.write(payload);
            req.end();
        } catch (e) {
            console.error("Test failed.", e);
            server.close();
            process.exit(1);
        }
    });
};

runTest();
