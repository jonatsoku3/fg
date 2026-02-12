const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const model = genAI.getGenerativeModel({
    model: "gemini-3-flash"
});

function removeDuplicate(alerts) {
    return [...new Map(
        alerts.map(v => [v.name, v])
    ).values()];
}

async function analyze(vuln) {
    try {
        const prompt = `
Explain this security vulnerability in Thai language (simple to understand):

Name: ${vuln.name}
Severity: ${vuln.risk}
Description: ${vuln.description}
Solution: ${vuln.solution}

Please provide:
1. What this vulnerability is
2. Why it's dangerous
3. How to fix it

Keep the explanation concise and clear.
`;

        const result = await model.generateContent(prompt);
        return result.response.text();

    } catch (e) {
        console.log("AI ERROR:", e.message);
        return "Unable to analyze this vulnerability with AI.";
    }
}

async function explain(alerts) {
    try {
        const unique = removeDuplicate(alerts);

        if (unique.length === 0) {
            return [];
        }

        const analyzed = await Promise.all(
            unique.map(async (vuln) => {
                const ai = await analyze(vuln);
                return {
                    name: vuln.name,
                    risk: vuln.risk,
                    description: vuln.description,
                    solution: vuln.solution,
                    ai: ai
                };
            })
        );

        return analyzed;

    } catch (e) {
        console.log("EXPLAIN ERROR:", e.message);
        return alerts;
    }
}

async function summary(alerts) {
    try {
        const unique = removeDuplicate(alerts);

        if (unique.length === 0) {
            return "No security vulnerabilities were found during the scan.";
        }

        const vulnSummary = unique.map(v => ({
            name: v.name,
            risk: v.risk
        }));

        const riskCounts = {
            High: unique.filter(v => v.risk === 'High').length,
            Medium: unique.filter(v => v.risk === 'Medium').length,
            Low: unique.filter(v => v.risk === 'Low').length,
            Informational: unique.filter(v => v.risk === 'Informational').length
        };

        const prompt = `
You are a cybersecurity expert. Provide an executive summary of this security scan in Thai language.

Vulnerabilities found: ${unique.length}
- High Risk: ${riskCounts.High}
- Medium Risk: ${riskCounts.Medium}
- Low Risk: ${riskCounts.Low}
- Informational: ${riskCounts.Informational}

Vulnerability details:
${JSON.stringify(vulnSummary, null, 2).slice(0, 3000)}

Please provide:
1. Overall security assessment
2. Most critical issues to address first
3. Recommended immediate actions

Keep it concise (3-4 sentences maximum) and executive-level.
`;

        const result = await model.generateContent(prompt);
        return result.response.text();

    } catch (e) {
        console.log("SUMMARY ERROR:", e.message);
        return "Unable to generate AI summary at this time.";
    }
}

module.exports = { analyze, explain, summary };
