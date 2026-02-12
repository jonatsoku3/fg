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

// Main scan function with 100% ZAP capabilities
async function scan(target) {
    try {
        console.log("[v0] ========================================");
        console.log("[v0] Starting FULL ZAP security scan");
        console.log("[v0] Target:", target);
        console.log("[v0] ZAP URL:", ZAP);
        console.log("[v0] ========================================");

        // Test connection
        console.log("[v0] Step 1/7: Testing ZAP connection...");
        const versionRes = await safeRequest(`${ZAP}/JSON/core/view/version/`);
        console.log("[v0] ✓ ZAP version:", versionRes.data.version);

        // Access URL first (Passive scan will start automatically)
        console.log("[v0] Step 2/7: Accessing target URL for passive scan...");
        await safeRequest(`${ZAP}/JSON/core/action/accessUrl/?url=${encodeURIComponent(target)}`);
        await delay(3000); // Wait for passive scan
        console.log("[v0] ✓ Target accessed");

        // Enable all scanners
        console.log("[v0] Step 3/7: Enabling all passive scanners...");
        await safeRequest(`${ZAP}/JSON/pscan/action/enableAllScanners/`);
        console.log("[v0] ✓ All passive scanners enabled");

        // Spider scan with maximum settings
        console.log("[v0] Step 4/7: Starting comprehensive spider scan...");
        const spiderRes = await safeRequest(
            `${ZAP}/JSON/spider/action/scan/?` +
            `url=${encodeURIComponent(target)}` +
            `&maxChildren=50` + // Increased from 10
            `&recurse=true` +
            `&subtreeOnly=false`
        );
        console.log("[v0] ✓ Spider scan ID:", spiderRes.data.scan);
        await waitSpider();

        // Check what spider found
        const spiderResultsRes = await safeRequest(`${ZAP}/JSON/spider/view/results/`);
        const urlsFound = spiderResultsRes.data.results?.length || 0;
        console.log(`[v0] ✓ Spider found ${urlsFound} URLs`);

        // Set active scan policy to ALL
        console.log("[v0] Step 5/7: Configuring active scan policy...");
        await safeRequest(`${ZAP}/JSON/ascan/action/enableAllScanners/`);
        console.log("[v0] ✓ All active scanners enabled");

        // Start comprehensive active scan
        console.log("[v0] Step 6/7: Starting comprehensive active scan...");
        const ascanRes = await safeRequest(
            `${ZAP}/JSON/ascan/action/scan/?` +
            `url=${encodeURIComponent(target)}` +
            `&recurse=true` +
            `&inScopeOnly=false` +
            `&scanPolicyName=` + // Use default policy (all tests)
            `&method=` +
            `&postData=`
        );
        console.log("[v0] ✓ Active scan ID:", ascanRes.data.scan);
        await waitActiveScan();

        // Wait for passive scan to complete
        console.log("[v0] Step 7/7: Waiting for passive scan completion...");
        let recordsToScan = 1;
        let iterations = 0;
        while (recordsToScan > 0 && iterations < 30) {
            const pscanRes = await safeRequest(`${ZAP}/JSON/pscan/view/recordsToScan/`);
            recordsToScan = parseInt(pscanRes.data.recordsToScan) || 0;
            if (recordsToScan > 0) {
                console.log(`[v0] Passive scan: ${recordsToScan} records remaining...`);
                await delay(2000);
            }
            iterations++;
        }
        console.log("[v0] ✓ Passive scan complete");

        // Fetch ALL alerts (both active and passive)
        console.log("[v0] ========================================");
        console.log("[v0] Collecting scan results...");
        const alertsRes = await safeRequest(`${ZAP}/JSON/core/view/alerts/?baseurl=&start=&count=&riskId=`);
        
        let alerts = alertsRes.data.alerts || [];
        console.log(`[v0] Total alerts from ZAP: ${alerts.length}`);

        // Filter for target domain
        const targetHostname = new URL(target).hostname;
        alerts = alerts.filter(alert => {
            if (!alert.url) return false;
            try {
                return new URL(alert.url).hostname === targetHostname;
            } catch {
                return false;
            }
        });
        
        console.log(`[v0] Alerts for ${targetHostname}: ${alerts.length}`);

        // Display detailed summary
        if (alerts.length > 0) {
            const riskCounts = {
                High: alerts.filter(a => a.risk === 'High').length,
                Medium: alerts.filter(a => a.risk === 'Medium').length,
                Low: alerts.filter(a => a.risk === 'Low').length,
                Informational: alerts.filter(a => a.risk === 'Informational').length
            };
            console.log("[v0] Alert breakdown:");
            console.log(`[v0]   High Risk: ${riskCounts.High}`);
            console.log(`[v0]   Medium Risk: ${riskCounts.Medium}`);
            console.log(`[v0]   Low Risk: ${riskCounts.Low}`);
            console.log(`[v0]   Informational: ${riskCounts.Informational}`);
            
            // Show unique vulnerability types
            const uniqueVulns = [...new Set(alerts.map(a => a.name))];
            console.log(`[v0] Unique vulnerabilities found: ${uniqueVulns.length}`);
            uniqueVulns.forEach(name => {
                console.log(`[v0]   - ${name}`);
            });
        } else {
            console.log("[v0] ⚠ No vulnerabilities detected");
            console.log("[v0] Possible reasons:");
            console.log("[v0]   - Website is well secured");
            console.log("[v0]   - Website blocked ZAP scanner");
            console.log("[v0]   - Website requires authentication");
            console.log("[v0]   - Network/firewall restrictions");
            
            // Show what was scanned
            const sitesRes = await safeRequest(`${ZAP}/JSON/core/view/sites/`);
            console.log("[v0] Sites in ZAP session:", sitesRes.data.sites);
            
            const urlsRes = await safeRequest(`${ZAP}/JSON/core/view/urls/`);
            console.log("[v0] URLs visited:", urlsRes.data.urls?.length || 0);
        }

        console.log("[v0] ========================================");
        console.log("[v0] Scan complete!");
        console.log("[v0] ========================================");

        return alerts;

    } catch (err) {
        console.error("[v0] ========================================");
        console.error("[v0] SCAN FAILED!");
        console.error("[v0] Error:", err.message);
        console.error("[v0] ========================================");
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
