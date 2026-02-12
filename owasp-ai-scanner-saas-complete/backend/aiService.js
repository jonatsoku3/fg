const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const model = genAI.getGenerativeModel({
    model: "gemini-3-flash-preview"
});

function removeDuplicate(alerts){

    return [...new Map(
        alerts.map(v => [v.name, v])
    ).values()];
}

async function analyze(vuln){

    try{

        const prompt = `
อธิบายช่องโหว่นี้เป็นภาษาไทยแบบเข้าใจง่าย:

ชื่อ: ${vuln.name}
ความรุนแรง: ${vuln.risk}
รายละเอียด: ${vuln.description}
วิธีแก้: ${vuln.solution}
`;

        const result = await model.generateContent(prompt);

        return result.response.text();

    }catch(e){

        console.log("AI ERROR:", e.message);
        return "AI วิเคราะห์ไม่สำเร็จ";
    }
}

async function summary(alerts){

    try{

        const unique = removeDuplicate(alerts);

        if(unique.length === 0){
            return "ไม่พบช่องโหว่ในระบบ";
        }

        const prompt = `
สรุปรายงานช่องโหว่เว็บเป็นภาษาไทย:

${JSON.stringify(unique).slice(0,4000)}
`;

        const result = await model.generateContent(prompt);

        return result.response.text();

    }catch(e){

        console.log("SUMMARY ERROR:", e.message);
        return "ไม่สามารถสรุปผลได้";
    }
}

module.exports = { analyze, summary };
