# SecureScan - AI-Powered Security Scanner

เครื่องมือสแกนช่องโหว่ด้านความปลอดภัยที่ใช้ OWASP ZAP และ AI (Google Gemini) วิเคราะห์และให้คำแนะนำการแก้ไข

## ความต้องการของระบบ

- Node.js 16+ 
- Docker Desktop (สำหรับ OWASP ZAP)
- Google Gemini API Key

## วิธีการติดตั้งและรัน

### 1. ติดตั้ง Dependencies

```bash
cd backend
npm install
```

### 2. ตั้งค่า Environment Variables

สร้างไฟล์ `.env` ใน folder `backend`:

```env
PORT=3001
GEMINI_API_KEY=your_actual_gemini_api_key_here
ZAP_URL=http://localhost:8081
```

**รับ Gemini API Key ได้ที่:** https://aistudio.google.com/app/apikey

### 3. รัน OWASP ZAP ใน Docker

เนื่องจากพอร์ต 8080 ถูกใช้งานอยู่แล้ว เราจะใช้พอร์ต 8081 แทน:

```bash
docker run -u zap -p 8081:8081 -i ghcr.io/zaproxy/zaproxy:stable zap.sh -daemon -host 0.0.0.0 -port 8081 -config api.addrs.addr.name=.* -config api.addrs.addr.regex=true -config api.disablekey=true
```

**หมายเหตุ:** 
- ถ้าหาก Docker บอกว่าพอร์ต 8081 ก็ถูกใช้แล้ว ให้เปลี่ยนเป็นพอร์ตอื่น เช่น 8082
- จำไว้ว่าต้องแก้ ZAP_URL ใน .env ให้ตรงกับพอร์ตที่ใช้ด้วย

### 4. รัน Backend Server

เปิด Terminal ใหม่:

```bash
cd backend
npm start
```

Server จะรันที่ http://localhost:3001

### 5. เปิด Frontend

**วิธีที่ 1:** เปิดไฟล์ HTML โดยตรง
```bash
cd frontend
# เปิดไฟล์ index.html ในเบราว์เซอร์
```

**วิธีที่ 2:** ใช้ HTTP Server (แนะนำ)
```bash
cd frontend
npx serve .
```

จากนั้นเปิดเบราว์เซอร์ไปที่ URL ที่แสดง (มักจะเป็น http://localhost:3000)

## การใช้งาน

1. เปิดเว็บไซต์ SecureScan ในเบราว์เซอร์
2. กรอก URL ของเว็บไซต์ที่ต้องการสแกน เช่น `https://example.com`
3. กดปุ่ม "Start Scan"
4. รอประมาณ 2-3 นาที (ขึ้นอยู่กับขนาดเว็บไซต์)
5. ดูผลการสแกนพร้อมคำแนะนำจาก AI

## การแก้ปัญหา

### พอร์ต 8080 หรือ 8081 ถูกใช้งานอยู่

**วิธีที่ 1:** หาว่าโปรแกรมไหนใช้พอร์ตนั้นอยู่

```bash
# Windows PowerShell
netstat -ano | findstr :8081

# หยุดโปรเซสด้วย PID ที่ได้
taskkill /PID <PID_NUMBER> /F
```

**วิธีที่ 2:** ใช้พอร์ตอื่นแทน เช่น 8082

```bash
# รัน ZAP ที่พอร์ต 8082
docker run -u zap -p 8082:8082 -i ghcr.io/zaproxy/zaproxy:stable zap.sh -daemon -host 0.0.0.0 -port 8082 -config api.addrs.addr.name=.* -config api.addrs.addr.regex=true -config api.disablekey=true

# แก้ไข .env
ZAP_URL=http://localhost:8082
```

### Backend ไม่สามารถเชื่อมต่อ ZAP

ตรวจสอบว่า:
1. Docker ZAP รันอยู่หรือไม่: `docker ps`
2. ZAP_URL ใน .env ถูกต้องหรือไม่
3. ใช้ `http://localhost:8081` บน Windows
4. ถ้าใช้ Mac/Linux อาจต้องใช้ `http://host.docker.internal:8081`

### Frontend แสดง CORS Error

ตรวจสอบว่า Backend รันอยู่ที่ port 3001 และใช้ HTTP Server แทนการเปิดไฟล์ HTML โดยตรง

## โครงสร้างโปรเจค

```
owasp-ai-scanner-saas-complete/
├── backend/
│   ├── server.js          # Express server หลัก
│   ├── zapService.js      # ติดต่อ OWASP ZAP
│   ├── aiService.js       # วิเคราะห์ด้วย Gemini AI
│   ├── package.json
│   └── .env               # ตั้งค่า (ต้องสร้างเอง)
├── frontend/
│   ├── index.html         # หน้าเว็บหลัก
│   ├── style.css          # Styles ทันสมัย
│   └── script.js          # Logic การทำงาน
└── README.md
```

## คุณสมบัติ

- สแกนช่องโหว่ด้วย OWASP ZAP (Spider + Active Scan)
- วิเคราะห์และอธิบายช่องโหว่ด้วย AI (Google Gemini 3 Flash)
- แสดงสถิติความเสี่ยง (High, Medium, Low, Info)
- สรุปผลโดย AI สำหรับผู้บริหาร
- UI/UX ทันสมัยด้วย Glassmorphism และ Animations
- Responsive Design ใช้งานได้ทุกอุปกรณ์

## เทคโนโลยีที่ใช้

- **Backend:** Node.js, Express.js
- **Security Scanner:** OWASP ZAP
- **AI Analysis:** Google Gemini 3 Flash
- **Frontend:** HTML5, CSS3 (Modern), Vanilla JavaScript
- **Design:** Glassmorphism, Gradient Animations

## License

MIT License
