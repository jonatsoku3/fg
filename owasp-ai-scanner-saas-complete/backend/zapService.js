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
        console.log("[v0] ZAP URL:", ZAP);

        // Test connection first
        console.log("[v0] Testing ZAP connection...");
        const versionRes = await safeRequest(`${ZAP}/JSON/core/view/version/`);
        console.log("[v0] ZAP version:", versionRes.data);

        // Start spider
        console.log("[v0] Initiating spider scan...");
        const spiderRes = await safeRequest(`${ZAP}/JSON/spider/action/scan/?url=${encodeURIComponent(target)}&maxChildren=10&recurse=true`);
        console.log("[v0] Spider started:", spiderRes.data);
        await waitSpider();

        // Check spider results
        const spiderResultsRes = await safeRequest(`${ZAP}/JSON/spider/view/results/`);
        console.log("[v0] Spider found", spiderResultsRes.data.results?.length || 0, "URLs");

        // Start active scan
        console.log("[v0] Initiating active scan...");
        const ascanRes = await safeRequest(`${ZAP}/JSON/ascan/action/scan/?url=${encodeURIComponent(target)}&recurse=true&inScopeOnly=false`);
        console.log("[v0] Active scan started:", ascanRes.data);
        await waitActiveScan();

        // Fetch all alerts (not just by baseurl)
        console.log("[v0] Retrieving ALL scan results...");
        const alertsRes = await safeRequest(`${ZAP}/JSON/core/view/alerts/`);
        
        let alerts = alertsRes.data.alerts || [];
        console.log(`[v0] Total alerts in ZAP: ${alerts.length}`);

        // Filter alerts for target URL
        alerts = alerts.filter(alert => alert.url && alert.url.includes(new URL(target).hostname));
        console.log(`[v0] Filtered alerts for ${target}: ${alerts.length}`);

        // If no alerts found, log details
        if (alerts.length === 0) {
            console.log("[v0] No vulnerabilities found. This could mean:");
            console.log("  1. The website is secure");
            console.log("  2. The scan didn't complete properly");
            console.log("  3. ZAP couldn't access the website");
            
            // Check sites in scope
            const sitesRes = await safeRequest(`${ZAP}/JSON/core/view/sites/`);
            console.log("[v0] Sites scanned:", sitesRes.data.sites);
        } else {
            console.log("[v0] Alert summary:");
            const riskCounts = alerts.reduce((acc, alert) => {
                acc[alert.risk] = (acc[alert.risk] || 0) + 1;
                return acc;
            }, {});
            console.log(riskCounts);
        }

        return alerts;

    } catch (err) {
        console.error("[v0] SCAN FAILED:", err.message);
        console.error("[v0] Full error:", err);
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
