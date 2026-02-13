# คู่มือแก้ปัญหา (Troubleshooting Guide)

## ปัญหา: ไม่พบช่องโหว่เลย

### สาเหตุที่เป็นไปได้:

#### 1. เว็บไซต์ที่สแกนปลอดภัยจริงๆ
- เว็บไซต์ที่ทันสมัยและมีการรักษาความปลอดภัยที่ดี อาจไม่มีช่องโหว่ให้พบ
- **แก้ไข:** ลองสแกนเว็บไซต์ทดสอบ เช่น http://testphp.vulnweb.com/

#### 2. ZAP ไม่สามารถเข้าถึงเว็บไซต์ได้
- เว็บไซต์บล็อก IP ของ ZAP
- เว็บไซต์ต้องการ authentication
- เว็บไซต์อยู่หลัง firewall หรือ VPN

**ตรวจสอบ:**
```bash
# ดู log ของ ZAP ว่ามี error อะไร
docker logs <container_id>
```

#### 3. การตั้งค่า ZAP ไม่เหมาะสม
- Scan policy อาจตั้งค่าให้ scan น้อยเกินไป
- Timeout สั้นเกินไป

**แก้ไข:**
ดู log ใน backend server ว่า ZAP scan เจออะไรบ้าง

#### 4. การเชื่อมต่อ ZAP มีปัญหา
**ตรวจสอบ:**
```bash
# ใน backend folder
curl http://localhost:8081/JSON/core/view/version/
```

ถ้าได้ response แสดงว่า ZAP ทำงานปกติ

---

## วิธีทดสอบด้วยข้อมูลจำลอง (Mock Data)

เพื่อทดสอบว่าระบบทำงานได้ ให้เปิดใช้ Test Mode:

### 1. แก้ไขไฟล์ .env
```
USE_MOCK_DATA=true
```

### 2. Restart Backend
```bash
npm start
```

### 3. ทดสอบสแกน
ระบบจะแสดงข้อมูลช่องโหว่ตัวอย่าง 4 รายการ:
- Cross Site Scripting (High)
- SQL Injection (High)
- Missing Anti-clickjacking Header (Medium)
- Cookie Without Secure Flag (Low)

---

## เว็บไซต์ทดสอบที่มีช่องโหว่จริง

ลองสแกนเว็บไซต์เหล่านี้:

1. **OWASP WebGoat** (ต้อง setup เอง)
   ```bash
   docker run -p 8080:8080 webgoat/webgoat
   # แล้วสแกน http://localhost:8080/WebGoat
   ```

2. **DVWA (Damn Vulnerable Web Application)**
   ```bash
   docker run -p 80:80 vulnerables/web-dvwa
   # แล้วสแกน http://localhost
   ```

3. **Test PHP Vuln Web** (Online)
   - http://testphp.vulnweb.com/
   - http://testphp.vulnweb.com/artists.php
   - http://testphp.vulnweb.com/listproducts.php

---

## ตรวจสอบ Log แบบละเอียด

### 1. Backend Log
ใน terminal ที่รัน backend จะเห็น:
```
[v0] Starting security scan for: https://example.com
[v0] ZAP URL: http://localhost:8081
[v0] Testing ZAP connection...
[v0] ZAP version: { version: '2.x.x' }
[v0] Spider progress: 25%
[v0] Spider progress: 50%
...
[v0] Total alerts in ZAP: 10
[v0] Filtered alerts for https://example.com: 5
```

### 2. ZAP Log
```bash
# ดู container ที่รัน
docker ps

# ดู log
docker logs <container_id>
```

---

## ปัญหาอื่นๆ

### ZAP ไม่ทำงาน
```bash
# ตรวจสอบว่า ZAP รันอยู่
docker ps

# ถ้าไม่เห็น รันใหม่
docker run -u zap -p 8081:8081 -i ghcr.io/zaproxy/zaproxy:stable zap.sh -daemon -host 0.0.0.0 -port 8081 -config api.addrs.addr.name=.* -config api.addrs.addr.regex=true -config api.disablekey=true
```

### Backend ไม่เชื่อมต่อ ZAP
ตรวจสอบ .env ว่า ZAP_URL ถูกต้อง:
```
ZAP_URL=http://localhost:8081
```

### Frontend เชื่อมต่อ Backend ไม่ได้
ตรวจสอบว่า backend รันที่ port 3001 และเปิดไฟล์ index.html ด้วย:
```bash
cd frontend
npx serve .
```
จะรันที่ http://localhost:3000

---

## ติดต่อขอความช่วยเหลือ

ถ้ายังแก้ไม่ได้ ให้ทำตามนี้:

1. เปิด Test Mode (USE_MOCK_DATA=true)
2. ถ่ายภาพหน้าจอผลลัพธ์
3. Copy log จาก backend terminal
4. ส่งมาที่อาจารย์ที่ปรึกษา
