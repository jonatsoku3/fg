// Mock vulnerability data for testing
const mockVulnerabilities = [
    {
        name: "Cross Site Scripting (Reflected)",
        risk: "High",
        description: "Cross-site Scripting (XSS) is an attack technique that involves echoing attacker-supplied code into a user's browser instance. A browser instance can be a standard web browser client, or a browser object embedded in a software product such as the browser within WinAmp, an RSS reader, or an email client. The code itself is usually written in HTML/JavaScript, but may also extend to VBScript, ActiveX, Java, Flash, or any other browser-supported technology.",
        solution: "Phase: Architecture and Design - Use a vetted library or framework that does not allow this weakness to occur or provides constructs that make this weakness easier to avoid. Examples of libraries and frameworks that make it easier to generate properly encoded output include Microsoft's Anti-XSS library, the OWASP ESAPI Encoding module, and Apache Wicket.",
        url: "https://example.com/search?q=test",
        ai: "**🔍 คำอธิบายช่องโหว่:**\n\nช่องโหว่ Cross Site Scripting (XSS) แบบ Reflected เกิดจากการที่เว็บไซต์นำข้อมูลที่ผู้ใช้ป้อนเข้ามา (เช่น พารามิเตอร์ใน URL) ไปแสดงผลโดยตรงโดยไม่มีการกรองหรือเข้ารหัสที่เหมาะสม ทำให้ผู้โจมตีสามารถแทรกโค้ด JavaScript หรือ HTML เข้าไปได้\n\n**⚠️ ความเสี่ยงและผลกระทบ:**\n\nหากถูกโจมตี ผู้โจมตีสามารถขโมย Session Cookie ของผู้ใช้งาน ดักจับข้อมูลที่ผู้ใช้กรอก หรือเปลี่ยนแปลงเนื้อหาหน้าเว็บได้ ส่งผลให้ข้อมูลส่วนตัวของผู้ใช้ถูกโจรกรรม และความน่าเชื่อถือของเว็บไซต์ลดลง\n\n**✅ วิธีแก้ไขและป้องกัน:**\n\n1. ใช้ Output Encoding ทุกครั้งที่แสดงข้อมูลที่มาจากผู้ใช้\n2. ใช้ Content Security Policy (CSP) เพื่อจำกัดการทำงานของ script\n3. ใช้ library ที่ปลอดภัย เช่น DOMPurify สำหรับทำความสะอาดข้อมูล\n4. ตั้งค่า HTTPOnly flag ให้กับ Cookie เพื่อป้องกันการเข้าถึงจาก JavaScript\n5. Validate และ Sanitize input ทุกจุดที่รับข้อมูลจากผู้ใช้"
    },
    {
        name: "SQL Injection",
        risk: "High",
        description: "SQL injection is a code injection technique that might destroy your database. It is one of the most common web hacking techniques. SQL injection is the placement of malicious code in SQL statements, via web page input.",
        solution: "Use parameterized queries or prepared statements instead of dynamic SQL. Implement proper input validation and sanitization. Apply the principle of least privilege for database accounts.",
        url: "https://example.com/product?id=1",
        ai: "**🔍 คำอธิบายช่องโหว่:**\n\nSQL Injection เกิดจากการที่เว็บไซต์นำข้อมูลจากผู้ใช้ไปใช้ในคำสั่ง SQL โดยตรงโดยไม่มีการตรวจสอบหรือป้องกัน ทำให้ผู้โจมตีสามารถแทรกคำสั่ง SQL เพิ่มเติมเข้าไปได้\n\n**⚠️ ความเสี่ยงและผลกระทบ:**\n\nผู้โจมตีสามารถอ่าน ลบ หรือแก้ไขข้อมูลในฐานข้อมูลได้ทั้งหมด รวมถึงข้อมูลส่วนตัว รหัสผ่าน และข้อมูลธุรกรรมทางการเงิน อาจทำให้ระบบถูก bypass การ login หรือยึดครองเซิร์ฟเวอร์ได้\n\n**✅ วิธีแก้ไขและป้องกัน:**\n\n1. ใช้ Prepared Statements และ Parameterized Queries เสมอ\n2. ใช้ ORM (Object-Relational Mapping) ที่มีความปลอดภัย\n3. Validate และ Sanitize input อย่างเข้มงวด\n4. ตั้งสิทธิ์ฐานข้อมูลตามหน้าที่ (Principle of Least Privilege)\n5. ใช้ Stored Procedures ที่เขียนอย่างปลอดภัย"
    },
    {
        name: "Missing Anti-clickjacking Header",
        risk: "Medium",
        description: "The response does not include either Content-Security-Policy with 'frame-ancestors' directive or X-Frame-Options to protect against 'ClickJacking' attacks.",
        solution: "Modern Web browsers support the Content-Security-Policy and X-Frame-Options HTTP headers. Ensure one of them is set on all web pages returned by your site/app.",
        url: "https://example.com/",
        ai: "**🔍 คำอธิบายช่องโหว่:**\n\nขาด Header ป้องกัน Clickjacking ทำให้เว็บไซต์สามารถถูกฝังใน iframe โดยเว็บไซต์อื่นได้ ผู้โจมตีอาจสร้างหน้าเว็บปลอมที่ซ่อนเว็บไซต์ของคุณไว้ข้างใน\n\n**⚠️ ความเสี่ยงและผลกระทบ:**\n\nผู้ใช้อาจถูกหลอกให้คลิกบนปุ่มหรือลิงก์ที่มองไม่เห็น ส่งผลให้ทำการกระทำที่ไม่ได้ตั้งใจ เช่น โอนเงิน เปลี่ยนการตั้งค่า หรือแชร์ข้อมูลส่วนตัว\n\n**✅ วิธีแก้ไขและป้องกัน:**\n\n1. เพิ่ม X-Frame-Options header: DENY หรือ SAMEORIGIN\n2. ใช้ Content-Security-Policy header พร้อม frame-ancestors directive\n3. ตรวจสอบว่า header ถูกส่งในทุกหน้าเว็บ"
    },
    {
        name: "Cookie Without Secure Flag",
        risk: "Low",
        description: "A cookie has been set without the secure flag, which means that the cookie can be accessed via unencrypted connections.",
        solution: "Whenever a cookie contains sensitive information or is a session token, then it should always be passed using an encrypted channel. Ensure that the secure flag is set for cookies containing such sensitive information.",
        url: "https://example.com/login",
        ai: "**🔍 คำอธิบายช่องโหว่:**\n\nCookie ที่ไม่มี Secure Flag สามารถถูกส่งผ่าน HTTP ธรรมดา (ไม่เข้ารหัส) ได้ ทำให้มีความเสี่ยงถูกดักจับข้อมูล\n\n**⚠️ ความเสี่ยงและผลกระทบ:**\n\nหากมีการเชื่อมต่อผ่าน HTTP หรือถูกโจมตีแบบ Man-in-the-Middle ผู้โจมตีสามารถดักจับ Session Cookie และยึดครอง session ของผู้ใช้ได้\n\n**✅ วิธีแก้ไขและป้องกัน:**\n\n1. เพิ่ม Secure flag ให้กับ Cookie ทั้งหมด\n2. เพิ่ม HttpOnly flag เพื่อป้องกัน JavaScript access\n3. ใช้ HTTPS ในทุกหน้าเว็บ\n4. ตั้งค่า SameSite attribute เพื่อป้องกัน CSRF"
    }
];

function getMockData(url) {
    console.log("[v0] Returning mock vulnerability data for testing");
    return mockVulnerabilities;
}

module.exports = { getMockData, mockVulnerabilities };
