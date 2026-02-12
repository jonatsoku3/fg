const express = require("express");
const cors = require("cors");
require("dotenv").config();

const zapService = require("./zapService");
const aiService = require("./aiService");

const app = express();

app.use(cors());
app.use(express.json());

// Health check endpoint
app.get("/health", (req, res) => {
    res.json({ status: "ok", service: "SecureScan API" });
});

// Main scan endpoint
app.post("/scan", async (req, res) => {
    try {
        console.log("[v0] SCAN REQUEST:", req.body);

        const { url } = req.body;

        if (!url) {
            return res.status(400).json({ error: "URL is required" });
        }

        // Validate URL format
        try {
            new URL(url);
        } catch (e) {
            return res.status(400).json({ error: "Invalid URL format" });
        }

        // Start ZAP scan (100% real scanning)
        console.log("[v0] Starting comprehensive ZAP scan for:", url);
        const alerts = await zapService.scan(url);
        console.log("[v0] ZAP scan complete. Found", alerts.length, "alerts");

        // If no vulnerabilities found, return empty array
        if (alerts.length === 0) {
            console.log("[v0] No vulnerabilities detected");
            return res.json([]);
        }

        // Analyze with AI
        console.log("[v0] Starting AI analysis for", alerts.length, "vulnerabilities...");
        const analyzed = await aiService.explain(alerts);
        console.log("[v0] AI analysis complete");

        res.json(analyzed);

    } catch (err) {
        console.error("[v0] SCAN ERROR:", err);
        res.status(500).json({ 
            error: "Scan failed", 
            message: err.message 
        });
    }
});

// AI summary endpoint
app.post("/ai-summary", async (req, res) => {
    try {
        console.log("[v0] SUMMARY REQUEST");

        const { alerts } = req.body;

        if (!alerts || !Array.isArray(alerts)) {
            return res.status(400).json({ 
                summary: "Invalid request format" 
            });
        }

        const summary = await aiService.summary(alerts);
        res.json({ summary });

    } catch (err) {
        console.error("[v0] SUMMARY ERROR:", err);
        res.json({ 
            summary: "Unable to generate summary at this time." 
        });
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error("[v0] Unhandled error:", err);
    res.status(500).json({ 
        error: "Internal server error",
        message: err.message 
    });
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
    console.log(`[v0] SecureScan server running on port ${PORT}`);
    console.log(`[v0] Health check: http://localhost:${PORT}/health`);
});
