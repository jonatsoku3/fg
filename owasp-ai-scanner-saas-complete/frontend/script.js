async function scan() {
    const url = document.getElementById("url").value;

    if (!url) {
        showError("Please enter a valid URL", "URL is required to perform security scan");
        return;
    }

    // Validate URL format
    try {
        new URL(url);
    } catch (e) {
        showError("Invalid URL format", "Please enter a complete URL including https://");
        return;
    }

    // Show loading state
    document.getElementById("result").innerHTML = `
        <div class="loading-card">
            <div class="loading-spinner"></div>
            <p class="loading-text">Scanning for vulnerabilities...</p>
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

        if (!Array.isArray(data)) {
            showError("Scan Failed", "Unable to complete security scan. Please try again.");
            return;
        }

        if (data.length === 0) {
            document.getElementById("result").innerHTML = `
                <div class="summary-card">
                    <div class="summary-header">
                        <div class="summary-icon">✓</div>
                        <h3 class="summary-title">No Vulnerabilities Found</h3>
                    </div>
                    <p class="summary-content">
                        Great news! No security vulnerabilities were detected during the scan.
                        Your website appears to follow security best practices.
                    </p>
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

        // Add Summary Card
        if (summary && summary.summary) {
            resultsHtml += `
                <div class="summary-card">
                    <div class="summary-header">
                        <div class="summary-icon">🎯</div>
                        <h3 class="summary-title">Executive Security Summary</h3>
                    </div>
                    <p class="summary-content">${escapeHtml(summary.summary)}</p>
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
        console.error(err);
        showError(
            "Connection Error", 
            "Unable to connect to the scanning service. Please ensure the backend server is running."
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
