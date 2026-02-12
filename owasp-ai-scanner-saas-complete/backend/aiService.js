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
คุณเป็นผู้เชี่ยวชาญด้านความปลอดภัยไซเบอร์ กรุณาวิเคราะห์ช่องโหว่นี้เป็นภาษาไทยอย่างละเอียด:

ชื่อช่องโหว่: ${vuln.name}
ระดับความเสี่ยง: ${vuln.risk}
รายละเอียด: ${vuln.description}
วิธีแก้ไขที่แนะนำ: ${vuln.solution}

กรุณาให้ข้อมูลดังนี้:

**🔍 คำอธิบายช่องโหว่:**
อธิบายว่าช่องโหว่นี้คืออะไร และเกิดจากสาเหตุใด (2-3 ประโยค)

**⚠️ ความเสี่ยงและผลกระทบ:**
บอกว่าหากถูกโจมตีจะเกิดอะไรขึ้น และมีผลกระทบอย่างไร (2-3 ประโยค)

**✅ วิธีแก้ไขและป้องกัน:**
ให้คำแนะนำขั้นตอนการแก้ไขอย่างชัดเจนและปฏิบัติได้จริง (3-5 ข้อแนะนำ)

ให้คำตอบที่เข้าใจง่าย กระชับ และใช้ภาษาไทยที่ถูกต้อง
`;

        const result = await model.generateContent(prompt);
        return result.response.text();

    } catch (e) {
        console.log("AI ERROR:", e.message);
        return "ไม่สามารถวิเคราะห์ช่องโหว่นี้ด้วย AI ได้ในขณะนี้";
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
            return "ไม่พบช่องโหว่ด้านความปลอดภัยในการสแกนครั้งนี้ เว็บไซต์ของคุณมีความปลอดภัยในระดับดี";
        }

        const vulnSummary = unique.map(v => ({
            name: v.name,
            risk: v.risk,
            description: v.description
        }));

        const riskCounts = {
            High: unique.filter(v => v.risk === 'High').length,
            Medium: unique.filter(v => v.risk === 'Medium').length,
            Low: unique.filter(v => v.risk === 'Low').length,
            Informational: unique.filter(v => v.risk === 'Informational').length
        };

        const prompt = `
คุณเป็นผู้เชี่ยวชาญด้านความปลอดภัยไซเบอร์ ให้สรุปผลการสแกนความปลอดภัยเป็นภาษาไทยสำหรับผู้บริหาร

**สถิติช่องโหว่ที่พบ:**
- ทั้งหมด: ${unique.length} ช่องโหว่
- ความเสี่ยงสูง (High): ${riskCounts.High} ช่องโหว่
- ความเสี่ยงกลาง (Medium): ${riskCounts.Medium} ช่องโหว่
- ความเสี่ยงต่ำ (Low): ${riskCounts.Low} ช่องโหว่
- ข้อมูลเพิ่มเติม (Informational): ${riskCounts.Informational} รายการ

**รายการช่องโหว่:**
${JSON.stringify(vulnSummary, null, 2).slice(0, 3000)}

กรุณาให้:
1. **ประเมินความปลอดภัยโดยรวม** - สรุปว่าระบบมีความปลอดภัยอยู่ในระดับใด
2. **ช่องโหว่สำคัญที่ต้องแก้ไขเร่งด่วน** - ระบุช่องโหว่ที่มีความเสี่ยงสูงที่สุด
3. **ขั้นตอนการแก้ไขที่แนะนำ** - ให้คำแนะนำว่าควรแก้ไขอะไรก่อนหลัง
4. **ผลกระทบหากไม่แก้ไข** - เตือนถึงความเสี่ยงที่อาจเกิดขึ้น

ให้คำตอบเป็นภาษาไทยที่เข้าใจง่าย กระชับ แต่ครอบคลุม (ประมาณ 4-6 ประโยค) เหมาะสำหรับผู้บริหาร
`;

        const result = await model.generateContent(prompt);
        return result.response.text();

    } catch (e) {
        console.log("SUMMARY ERROR:", e.message);
        return "ไม่สามารถสร้างสรุปผลด้วย AI ได้ในขณะนี้ กรุณาลองใหม่อีกครั้ง";
    }
}

module.exports = { analyze, explain, summary };
