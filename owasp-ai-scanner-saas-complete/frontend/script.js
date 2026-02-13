async function scan() {
    const url = document.getElementById("url").value;

    if (!url) {
        showError("กรุณากรอก URL", "จำเป็นต้องกรอก URL เพื่อทำการสแกนความปลอดภัย");
        return;
    }

    // Validate URL format
    try {
        const urlObj = new URL(url);
        if (!urlObj.protocol.startsWith('http')) {
            showError("รูปแบบ URL ไม่ถูกต้อง", "กรุณากรอก URL ที่เริ่มต้นด้วย http:// หรือ https://");
            return;
        }
    } catch (e) {
        showError("รูปแบบ URL ไม่ถูกต้อง", "กรุณากรอก URL ที่สมบูรณ์ เช่น https://example.com");
        return;
    }

    // Disable button during scan
    const scanButton = document.querySelector('.scan-button');
    const originalButtonContent = scanButton.innerHTML;
    scanButton.disabled = true;
    scanButton.innerHTML = `
        <div class="button-spinner"></div>
        <span class="button-text">Scanning...</span>
    `;

    // Show loading state with progress
    document.getElementById("result").innerHTML = `
        <div class="loading-card">
            <div class="loading-spinner"></div>
            <p class="loading-text">กำลังสแกนหาช่องโหว่...</p>
            <p class="loading-subtext">กระบวนการนี้อาจใช้เวลา 2-3 นาที</p>
            <div class="loading-steps">
                <div class="loading-step active">
                    <div class="step-icon">1</div>
                    <div class="step-text">Spider Crawling</div>
                </div>
                <div class="loading-step">
                    <div class="step-icon">2</div>
                    <div class="step-text">Active Scanning</div>
                </div>
                <div class="loading-step">
                    <div class="step-icon">3</div>
                    <div class="step-text">AI Analysis</div>
                </div>
            </div>
        </div>
    `;

    try {
        // Call Backend Scan
        const res = await fetch("http://localhost:3001/scan", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ url })
        });

        const data = await res.json();

        // Re-enable button
        scanButton.disabled = false;
        scanButton.innerHTML = originalButtonContent;

        if (!Array.isArray(data)) {
            showError("การสแกนล้มเหลว", "ไม่สามารถทำการสแกนความปลอดภัยได้ กรุณาลองใหม่อีกครั้ง");
            return;
        }

        if (data.length === 0) {
            document.getElementById("result").innerHTML = `
                <div class="success-card">
                    <div class="success-icon">
                        <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="32" cy="32" r="30" stroke="currentColor" stroke-width="3"/>
                            <path d="M20 32L28 40L44 24" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    </div>
                    <h3 class="success-title">ไม่พบช่องโหว่ด้านความปลอดภัย</h3>
                    <p class="success-message">
                        ยินดีด้วย! ไม่พบช่องโหว่ด้านความปลอดภัยในการสแกนครั้งนี้ 
                        เว็บไซต์ของคุณปฏิบัติตามมาตรฐานความปลอดภัยที่ดี
                    </p>
                    <div class="success-stats">
                        <div class="success-stat">
                            <div class="stat-number">100%</div>
                            <div class="stat-desc">Security Score</div>
                        </div>
                        <div class="success-stat">
                            <div class="stat-number">0</div>
                            <div class="stat-desc">ช่องโหว่ที่พบ</div>
                        </div>
                    </div>
                </div>
            `;
            return;
        }

        // Get AI Summary
        const sumRes = await fetch("http://localhost:3001/ai-summary", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ alerts: data })
        });

        const summary = await sumRes.json();

        // Build Results HTML
        let resultsHtml = "";

        // Calculate risk statistics
        const riskStats = {
            high: data.filter(v => v.risk === 'High').length,
            medium: data.filter(v => v.risk === 'Medium').length,
            low: data.filter(v => v.risk === 'Low').length,
            info: data.filter(v => v.risk === 'Informational').length
        };

        // Add Statistics Overview
        resultsHtml += `
            <div class="stats-overview">
                <div class="overview-header">
                    <h3 class="overview-title">สรุปผลการสแกน</h3>
                    <div class="overview-badge">พบช่องโหว่ทั้งหมด ${data.length} รายการ</div>
                </div>
                <div class="risk-stats-grid">
                    <div class="risk-stat risk-stat-high">
                        <div class="risk-stat-icon">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12 9V13M12 17H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                        </div>
                        <div class="risk-stat-content">
                            <div class="risk-stat-value">${riskStats.high}</div>
                            <div class="risk-stat-label">ความเสี่ยงสูง</div>
                        </div>
                    </div>
                    <div class="risk-stat risk-stat-medium">
                        <div class="risk-stat-icon">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12 8V12M12 16H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                        </div>
                        <div class="risk-stat-content">
                            <div class="risk-stat-value">${riskStats.medium}</div>
                            <div class="risk-stat-label">ความเสี่ยงกลาง</div>
                        </div>
                    </div>
                    <div class="risk-stat risk-stat-low">
                        <div class="risk-stat-icon">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M13 16H12V12H11M12 8H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                        </div>
                        <div class="risk-stat-content">
                            <div class="risk-stat-value">${riskStats.low}</div>
                            <div class="risk-stat-label">ความเสี่ยงต่ำ</div>
                        </div>
                    </div>
                    <div class="risk-stat risk-stat-info">
                        <div class="risk-stat-icon">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12 16V12M12 8H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                        </div>
                        <div class="risk-stat-content">
                            <div class="risk-stat-value">${riskStats.info}</div>
                            <div class="risk-stat-label">ข้อมูลเพิ่มเติม</div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Add AI Summary Card
        if (summary && summary.summary) {
            const formattedSummary = summary.summary
                .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                .replace(/\n\n/g, '</p><p class="summary-text">')
                .replace(/\n/g, '<br>');
                
            resultsHtml += `
                <div class="summary-card">
                    <div class="summary-header">
                        <div class="summary-icon">
                            <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M14 7V14L18 18M24 14C24 19.5228 19.5228 24 14 24C8.47715 24 4 19.5228 4 14C4 8.47715 8.47715 4 14 4C19.5228 4 24 8.47715 24 14Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                        </div>
                        <h3 class="summary-title">สรุปผลโดย AI</h3>
                    </div>
                    <div class="summary-content">
                        <p class="summary-text">${formattedSummary}</p>
                    </div>
                </div>
            `;
        }

        // Add Vulnerability Cards
        resultsHtml += '<div class="vuln-grid">';
        
        data.forEach(v => {
            const riskLevel = (v.risk || 'informational').toLowerCase();
            const riskClass = `risk-${riskLevel.replace(' ', '-')}`;
            
            // Format AI analysis with proper line breaks
            const aiAnalysis = (v.ai || 'ไม่มีข้อมูลเพิ่มเติม')
                .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                .replace(/\n\n/g, '</p><p class="vuln-description">')
                .replace(/\n/g, '<br>');
            
            resultsHtml += `
                <div class="vuln-card">
                    <div class="vuln-header">
                        <div class="vuln-title-section">
                            <h4 class="vuln-name">${escapeHtml(v.name)}</h4>
                            <span class="vuln-risk-badge ${riskClass}">${escapeHtml(v.risk || 'Info')}</span>
                        </div>
                    </div>
                    <div class="vuln-analysis">
                        <p class="vuln-description">${aiAnalysis}</p>
                    </div>
                </div>
            `;
        });

        resultsHtml += '</div>';

        document.getElementById("result").innerHTML = resultsHtml;

    } catch (err) {
        console.error("[v0] Scan error:", err);
        
        // Re-enable button
        scanButton.disabled = false;
        scanButton.innerHTML = originalButtonContent;
        
        showError(
            "เกิดข้อผิดพลาดในการเชื่อมต่อ", 
            "ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้ กรุณาตรวจสอบว่า Backend Server กำลังทำงานอยู่"
        );
    }
}

function showError(title, message) {
    document.getElementById("result").innerHTML = `
        <div class="error-card">
            <div class="error-icon">⚠️</div>
            <h3 class="error-title">${escapeHtml(title)}</h3>
            <p class="error-message">${escapeHtml(message)}</p>
        </div>
    `;
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Allow Enter key to trigger scan
document.addEventListener('DOMContentLoaded', () => {
    const input = document.getElementById('url');
    if (input) {
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                scan();
            }
        });
    }
});
