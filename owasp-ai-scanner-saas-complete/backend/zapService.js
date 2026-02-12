const axios = require("axios");
const http = require("http");

const ZAP = process.env.ZAP_URL || "http://localhost:8081";

// Configure HTTP agent with no keep-alive for ZAP compatibility
const agent = new http.Agent({ 
    keepAlive: false,
    maxSockets: 5
});

axios.defaults.httpAgent = agent;
axios.defaults.timeout = 30000;

// Helper delay function
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Safe request with retry mechanism
async function safeRequest(url, retries = 3) {
    for (let i = 0; i < retries; i++) {
        try {
            const res = await axios.get(url, { 
                httpAgent: agent,
                timeout: 30000 
            });
            return res;
        } catch (err) {
            console.log(`[v0] ZAP request failed (attempt ${i + 1}/${retries}):`, err.message);
            
            if (i === retries - 1) {
                throw new Error(`ZAP connection failed after ${retries} attempts: ${err.message}`);
            }
            
            await delay(3000);
        }
    }
}

// Wait for spider to complete
async function waitSpider(maxWaitTime = 300000) {
    let status = 0;
    const startTime = Date.now();

    console.log("[v0] Waiting for spider to complete...");

    while (status < 100) {
        if (Date.now() - startTime > maxWaitTime) {
            console.log("[v0] Spider timeout reached");
            break;
        }

        try {
            const res = await safeRequest(`${ZAP}/JSON/spider/view/status/`);
            status = parseInt(res.data.status) || 0;
            console.log(`[v0] Spider progress: ${status}%`);
        } catch (err) {
            console.log("[v0] Spider status check failed, retrying...");
        }

        await delay(2000);
    }

    console.log("[v0] Spider complete");
}

// Wait for active scan to complete
async function waitActiveScan(maxWaitTime = 600000) {
    let status = 0;
    const startTime = Date.now();

    console.log("[v0] Waiting for active scan to complete...");

    while (status < 100) {
        if (Date.now() - startTime > maxWaitTime) {
            console.log("[v0] Active scan timeout reached");
            break;
        }

        try {
            const res = await safeRequest(`${ZAP}/JSON/ascan/view/status/`);
            status = parseInt(res.data.status) || 0;
            console.log(`[v0] Active scan progress: ${status}%`);
        } catch (err) {
            console.log("[v0] Active scan status check failed, retrying...");
        }

        await delay(5000);
    }

    console.log("[v0] Active scan complete");
}

// Main scan function
async function scan(target) {
    try {
        console.log("[v0] Starting security scan for:", target);

        // Start spider
        console.log("[v0] Initiating spider scan...");
        await safeRequest(`${ZAP}/JSON/spider/action/scan/?url=${encodeURIComponent(target)}`);
        await waitSpider();

        // Start active scan
        console.log("[v0] Initiating active scan...");
        await safeRequest(`${ZAP}/JSON/ascan/action/scan/?url=${encodeURIComponent(target)}`);
        await waitActiveScan();

        // Fetch alerts
        console.log("[v0] Retrieving scan results...");
        const alertsRes = await safeRequest(`${ZAP}/JSON/core/view/alerts/?baseurl=${encodeURIComponent(target)}`);
        
        const alerts = alertsRes.data.alerts || [];
        console.log(`[v0] Scan complete. Found ${alerts.length} alerts`);

        return alerts;

    } catch (err) {
        console.error("[v0] SCAN FAILED:", err.message);
        throw new Error(`Security scan failed: ${err.message}`);
    }
}

// Test ZAP connection
async function testConnection() {
    try {
        await safeRequest(`${ZAP}/JSON/core/view/version/`);
        console.log("[v0] ZAP connection successful");
        return true;
    } catch (err) {
        console.error("[v0] ZAP connection failed:", err.message);
        return false;
    }
}

module.exports = { scan, testConnection };
