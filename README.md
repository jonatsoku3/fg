# SecureScan - AI-Powered Security Scanner

เครื่องมือสแกนช่องโหว่ความปลอดภัยเว็บไซต์ด้วย OWASP ZAP และ AI

## ความต้องการของระบบ

- Node.js (v14 หรือสูงกว่า)
- Docker (สำหรับรัน OWASP ZAP)
- Google Gemini API Key

## การติดตั้ง

### 1. ติดตั้ง Dependencies สำหรับ Backend

```bash
cd owasp-ai-scanner-saas-complete/backend
npm install
```

### 2. ตั้งค่า Environment Variables

สร้างไฟล์ `.env` ในโฟลเดอร์ `backend`:

```bash
cp .env.example .env
```

แก้ไขไฟล์ `.env` และใส่ข้อมูลต่อไปนี้:

```
PORT=3001
GEMINI_API_KEY=your_gemini_api_key_here
ZAP_URL=http://host.docker.internal:8080
```

**วิธีการรับ Gemini API Key:**
1. ไปที่ https://aistudio.google.com/app/apikey
2. เข้าสู่ระบบด้วย Google Account
3. คลิก "Create API Key"
4. คัดลอก API Key มาใส่ในไฟล์ `.env`

### 3. รัน OWASP ZAP ด้วย Docker

```bash
docker run -u zap -p 8080:8080 -i ghcr.io/zaproxy/zaproxy:stable zap.sh -daemon -host 0.0.0.0 -port 8080 -config api.addrs.addr.name=.* -config api.addrs.addr.regex=true -config api.disablekey=true
```

### 4. รัน Backend Server

```bash
cd owasp-ai-scanner-saas-complete/backend
npm start
```

Backend จะรันที่ `http://localhost:3001`

### 5. เปิด Frontend

เปิดไฟล์ `owasp-ai-scanner-saas-complete/frontend/index.html` ในเว็บเบราว์เซอร์

หรือใช้ Live Server (แนะนำ):

```bash
cd owasp-ai-scanner-saas-complete/frontend
npx serve .
```

Frontend จะรันที่ `http://localhost:3000`

## การใช้งาน

1. เปิดเว็บไซต์ Frontend
2. กรอก URL ของเว็บไซต์ที่ต้องการสแกน (เช่น https://example.com)
3. คลิกปุ่ม "Start Scan"
4. รอผลการสแกน (ใช้เวลาประมาณ 2-3 นาที)
5. ดูผลการวิเคราะห์ช่องโหว่และคำแนะนำจาก AI

## โครงสร้างโปรเจค

```
owasp-ai-scanner-saas-complete/
├── backend/
│   ├── server.js          # Main Express server
│   ├── zapService.js      # OWASP ZAP integration
│   ├── aiService.js       # Google Gemini AI integration
│   ├── package.json       # Backend dependencies
│   └── .env              # Environment variables
└── frontend/
    ├── index.html        # Main HTML page
    ├── style.css         # Styling
    └── script.js         # Frontend logic
```

## การแก้ไขปัญหา

### ไม่สามารถเชื่อมต่อกับ ZAP

- ตรวจสอบว่า Docker container กำลังรันอยู่
- ตรวจสอบว่า ZAP รันที่พอร์ต 8080
- ลอง `docker ps` เพื่อดู container ที่กำลังรัน

### AI ไม่ทำงาน

- ตรวจสอบว่า GEMINI_API_KEY ถูกต้อง
- ตรวจสอบ API quota ที่ Google AI Studio
- ดู logs ใน Backend console

### CORS Error

- ตรวจสอบว่า Backend รันที่ port 3001
- ตรวจสอบว่า Frontend เรียก API ที่ URL ถูกต้อง

## ฟีเจอร์

- สแกนช่องโหว่ด้วย OWASP ZAP
- วิเคราะห์ผลด้วย Google Gemini AI
- แสดงผลแบบ Real-time
- แยกระดับความเสี่ยง (High, Medium, Low, Informational)
- คำแนะนำการแก้ไขเป็นภาษาไทย
- UI/UX ที่ทันสมัยและใช้งานง่าย

## เทคโนโลยีที่ใช้

- **Backend:** Node.js, Express
- **Security Scanning:** OWASP ZAP
- **AI:** Google Gemini 3 Flash
- **Frontend:** HTML, CSS, JavaScript
- **Docker:** สำหรับรัน OWASP ZAP

## License

MIT License
