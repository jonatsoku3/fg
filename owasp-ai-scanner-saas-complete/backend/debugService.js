// Debug service for testing ZAP and showing mock results

function getMockVulnerabilities(url) {
    return [
        {
            name: "Missing Anti-clickjacking Header",
            risk: "Medium",
            description: "The response does not include either Content-Security-Policy with 'frame-ancestors' directive or X-Frame-Options to protect against 'ClickJacking' attacks.",
            solution: "Modern Web browsers support the Content-Security-Policy and X-Frame-Options HTTP headers. Ensure one of them is set on all web pages returned by your site/app.",
            url: url,
            ai: "**🔍 คำอธิบายช่องโหว่:**\nเว็บไซต์ไม่มีการป้องกัน Clickjacking ซึ่งเป็นเทคนิคที่ผู้โจมตีสามารถหลอกให้ผู้ใช้คลิกในสิ่งที่ไม่ได้ตั้งใจโดยการซ่อน iframe ไว้\n\n**⚠️ ความเสี่ยงและผลกระทบ:**\nผู้โจมตีสามารถนำเว็บไซต์ของคุณไปฝังใน iframe และหลอกให้ผู้ใช้คลิกปุ่มสำคัญ เช่น ยืนยันการโอนเงิน หรือเปลี่ยนรหัสผ่าน\n\n**✅ วิธีแก้ไขและป้องกัน:**\n1. เพิ่ม HTTP Header: X-Frame-Options: DENY หรือ SAMEORIGIN\n2. ใช้ Content-Security-Policy: frame-ancestors 'self'\n3. ตรวจสอบว่า framework ที่ใช้มีการตั้งค่านี้อยู่แล้วหรือไม่"
        },
        {
            name: "Cross-Site Scripting (XSS)",
            risk: "High",
            description: "Cross-site Scripting (XSS) is a type of vulnerability that allows attackers to inject malicious scripts into web pages viewed by other users.",
            solution: "Validate all input, encode output, use Content Security Policy, and implement proper XSS filters.",
            url: url + "/search",
            ai: "**🔍 คำอธิบายช่องโหว่:**\nช่องโหว่ XSS เกิดจากการที่เว็บไซต์แสดงผลข้อมูลจากผู้ใช้โดยไม่ผ่านการตรวจสอบ ทำให้ผู้โจมตีสามารถแทรก JavaScript code ที่เป็นอันตรายได้\n\n**⚠️ ความเสี่ยงและผลกระทบ:**\nผู้โจมตีสามารถขะดขวาง session, ขโมยข้อมูล cookie, redirect ผู้ใช้ไปยังเว็บปลอม หรือแก้ไขเนื้อหาบนหน้าเว็บได้\n\n**✅ วิธีแก้ไขและป้องกัน:**\n1. ใช้ HTML encoding สำหรับข้อมูลที่แสดงผล\n2. ใช้ Content Security Policy (CSP)\n3. Validate และ sanitize input ทั้งหมด\n4. ใช้ framework ที่มี XSS protection built-in\n5. ห้ามใช้ innerHTML โดยตรง ใช้ textContent แทน"
        },
        {
            name: "SQL Injection",
            risk: "High",
            description: "SQL injection is a code injection technique that might destroy your database. It allows attackers to execute malicious SQL statements.",
            solution: "Use parameterized queries, stored procedures, input validation, and least privilege database accounts.",
            url: url + "/login",
            ai: "**🔍 คำอธิบายช่องโหว่:**\nSQL Injection เกิดจากการที่ระบบรับค่าจากผู้ใช้มาสร้าง SQL query โดยตรงโดยไม่ผ่านการตรวจสอบ ทำให้ผู้โจมตีสามารถแทรก SQL command ได้\n\n**⚠️ ความเสี่ยงและผลกระทบ:**\nผู้โจมตีสามารถอ่าน ลบ หรือแก้ไขข้อมูลในฐานข้อมูลได้ทั้งหมด รวมถึงข้อมูลส่วนตัวของผู้ใช้ ข้อมูลบัตรเครดิต และอาจควบคุมเซิร์ฟเวอร์ได้\n\n**✅ วิธีแก้ไขและป้องกัน:**\n1. ใช้ Parameterized Queries หรือ Prepared Statements เสมอ\n2. ใช้ ORM เช่น Prisma, TypeORM ที่ป้องกัน SQL Injection อัตโนมัติ\n3. Validate input ทุกครั้งก่อนนำไปใช้\n4. ใช้ Stored Procedures\n5. จำกัดสิทธิ์ของ database user ให้เหมาะสม"
        },
        {
            name: "Vulnerable JavaScript Library",
            risk: "Medium",
            description: "The identified library has known vulnerabilities. Using components with known vulnerabilities can compromise the application security.",
            solution: "Update to the latest stable version of the library. Review security advisories and patch notes.",
            url: url,
            ai: "**🔍 คำอธิบายช่องโหว่:**\nเว็บไซต์ใช้ JavaScript library เวอร์ชันเก่าที่มีช่องโหว่ที่รู้จักแล้ว ซึ่งผู้โจมตีสามารถใช้ประโยชน์ได้\n\n**⚠️ ความเสี่ยงและผลกระทบ:**\nช่องโหว่ใน library อาจถูกใช้เพื่อโจมตีผู้ใช้งาน ขโมยข้อมูล หรือควบคุมเว็บไซต์ ขึ้นอยู่กับประเภทของช่องโหว่\n\n**✅ วิธีแก้ไขและป้องกัน:**\n1. อัพเดท library ทั้งหมดให้เป็นเวอร์ชันล่าสุด\n2. ใช้ npm audit หรือ yarn audit เพื่อตรวจสอบช่องโหว่\n3. ติดตาม security advisories ของ library ที่ใช้\n4. ใช้ tools อย่าง Dependabot ที่ช่วย auto-update\n5. ลบ library ที่ไม่ใช้งานออก"
        }
    ];
}

module.exports = { getMockVulnerabilities };
