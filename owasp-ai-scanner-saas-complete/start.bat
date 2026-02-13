@echo off
echo ========================================
echo ระบบตรวจสอบช่องโหว่ด้วย OWASP ZAP + AI
echo ========================================
echo.

echo [1/3] กำลังตรวจสอบไฟล์ .env...
if not exist backend\.env (
    echo ❌ ไม่พบไฟล์ .env!
    echo.
    echo กรุณาสร้างไฟล์ backend\.env และใส่:
    echo GEMINI_API_KEY=your_api_key_here
    echo PORT=3001
    echo ZAP_URL=http://localhost:8081
    echo ZAP_API_KEY=m67ag15c1cjvo56nad6hlemurk
    echo.
    echo สมัคร API Key ได้ที่: https://aistudio.google.com/app/apikey
    pause
    exit /b 1
)
echo ✓ พบไฟล์ .env แล้ว
echo.

echo [2/3] กำลังรัน OWASP ZAP...
echo กำลังเปิด Terminal ใหม่สำหรับ ZAP...
start "OWASP ZAP" cmd /k "docker run -u zap -p 8081:8081 -i ghcr.io/zaproxy/zaproxy:stable zap.sh -daemon -host 0.0.0.0 -port 8081 -config api.addrs.addr.name=.* -config api.addrs.addr.regex=true -config api.key=m67ag15c1cjvo56nad6hlemurk"
echo ✓ รอ ZAP เริ่มทำงาน 30 วินาที...
timeout /t 30 /nobreak >nul
echo.

echo [3/3] กำลังรัน Backend และ Frontend...
echo กำลังเปิด Terminal สำหรับ Backend...
start "Backend Server" cmd /k "cd backend && npm start"
echo ✓ รอ Backend เริ่มทำงาน 5 วินาที...
timeout /t 5 /nobreak >nul
echo.

echo กำลังเปิด Terminal สำหรับ Frontend...
start "Frontend Server" cmd /k "cd frontend && npx serve -p 5500"
echo ✓ รอ Frontend เริ่มทำงาน 3 วินาที...
timeout /t 3 /nobreak >nul
echo.

echo ========================================
echo ✓ ระบบเริ่มทำงานแล้ว!
echo ========================================
echo.
echo เปิดเบราว์เซอร์ไปที่: http://localhost:5500
echo.
echo Terminal ที่เปิด:
echo - Terminal 1: OWASP ZAP (พอร์ต 8081)
echo - Terminal 2: Backend Server (พอร์ต 3001)
echo - Terminal 3: Frontend Server (พอร์ต 5500)
echo.
echo กด Ctrl+C ใน Terminal แต่ละอันเพื่อปิดระบบ
echo ========================================
echo.

echo กำลังเปิดเบราว์เซอร์...
timeout /t 2 /nobreak >nul
start http://localhost:5500

echo.
echo กด Enter เพื่อปิดหน้าต่างนี้...
pause >nul
