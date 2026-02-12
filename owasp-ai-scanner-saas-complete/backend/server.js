const express = require("express");
const cors = require("cors");
require("dotenv").config();

const zapService = require("./zapService");
const aiService = require("./aiService");

const app = express();

app.use(cors());
app.use(express.json());

app.post("/scan", async (req, res) => {
    try {

        console.log("SCAN REQUEST:", req.body);

        const { url } = req.body;

        const alerts = await zapService.scan(url);

        console.log("ZAP RESULT:", alerts);

        const ai = await aiService.explain(alerts);

        console.log("AI RESULT:", ai);

        console.log("FINAL RESPONSE:", ai);
        res.json(ai);


    } catch (err) {

        console.error("SCAN ERROR:", err);

        res.status(500).json({ error: err.message });

    }
});

app.post("/ai-summary", async (req,res)=>{

    try {

        const summary = await aiService.summary(req.body.alerts);
        res.json({summary});

    } catch(err){

        console.error("SUMMARY ERROR:", err);
        res.json({summary:"AI Summary Failed"});

    }

});

app.listen(process.env.PORT, ()=>{
    console.log("Server running on port", process.env.PORT);
});
