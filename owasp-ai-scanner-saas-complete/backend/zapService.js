const axios = require("axios");
const http = require("http");

const ZAP = "http://host.docker.internal:8080";

// ===== Disable KeepAlive =====
const agent = new http.Agent({ keepAlive: false });

axios.defaults.httpAgent = agent;
axios.defaults.timeout = 20000;


// ===== Helper Delay =====
const delay = (ms) => new Promise(r => setTimeout(r, ms));


// ===== Safe Axios Request (Retry System) =====
async function safeRequest(url, retries = 3) {

    for (let i = 0; i < retries; i++) {

        try {

            const res = await axios.get(url, { httpAgent: agent });
            return res;

        } catch (err) {

            console.log("ZAP reconnect attempt:", i + 1);

            if (i === retries - 1) throw err;

            await delay(3000);
        }
    }
}


// ===== Wait Spider Complete =====
async function waitSpider() {

    let status = 0;

    while (status < 100) {

        try {

            const res = await safeRequest(`${ZAP}/JSON/spider/view/status/`);
            status = parseInt(res.data.status);

            console.log("Spider:", status);

        } catch (err) {

            console.log("Spider status retry...");
        }

        await delay(2000);
    }
}


// ===== Wait Active Scan Complete =====
async function waitActiveScan() {

    let status = 0;

    while (status < 100) {

        try {

            const res = await safeRequest(`${ZAP}/JSON/ascan/view/status/`);
            status = parseInt(res.data.status);

            console.log("Active Scan:", status);

        } catch (err) {

            console.log("Active scan retry...");
        }

        await delay(5000);
    }
}



// ===== MAIN SCAN FUNCTION =====
async function scan(target) {

    try {

        console.log("Starting Spider...");
        await safeRequest(`${ZAP}/JSON/spider/action/scan/?url=${target}`);

        await waitSpider();


        console.log("Starting Active Scan...");
        await safeRequest(`${ZAP}/JSON/ascan/action/scan/?url=${target}`);

        await waitActiveScan();


        console.log("Fetching Alerts...");
        const alerts = await safeRequest(`${ZAP}/JSON/core/view/alerts/`);

        return alerts.data.alerts || [];

    } catch (err) {

        console.error("SCAN FAILED:", err.message);
        return [];
    }
}


module.exports = { scan };
