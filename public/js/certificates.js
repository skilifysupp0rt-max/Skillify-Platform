/**
 * Certificate System
 * Generates and displays certificates based on course completion
 */

// Course configuration for certificates
const coursesConfig = {
    web: { name: 'Web Development', total: 9, file: 'web.html', color: '#6366f1' },
    game: { name: 'Game Development', total: 6, file: 'game.html', color: '#a855f7' },
    design: { name: 'UI/UX Design', total: 6, file: 'design.html', color: '#22d3ee' },
    ai: { name: 'AI & Data Science', total: 6, file: 'ai.html', color: '#fbbf24' },
    management: { name: 'Project Management', total: 6, file: 'management.html', color: '#10b981' }
};

// Load and display certificate progress
async function loadCertificateProgress() {
    try {
        const res = await fetch('/api/video/progress');
        if (!res.ok) return;

        const progress = await res.json();
        const earnedContainer = document.getElementById('earnedCertificates');
        let hasEarned = false;

        for (const [key, config] of Object.entries(coursesConfig)) {
            const completed = progress.filter(p => p.courseFile === config.file && p.completed).length;
            const percent = Math.round((completed / config.total) * 100);

            // Update progress bar
            const progressBar = document.getElementById(`cert-${key}-progress`);
            const statusEl = document.getElementById(`cert-${key}-status`);

            if (progressBar) progressBar.style.width = `${percent}%`;
            if (statusEl) {
                if (percent === 100) {
                    statusEl.innerHTML = '<span style="color:var(--success);">✓ Complete - Click to view</span>';
                } else {
                    statusEl.textContent = `${completed}/${config.total} Videos`;
                }
            }

            // Add to earned if complete
            if (percent === 100) {
                hasEarned = true;
                if (earnedContainer) {
                    // Check if not already added
                    if (!document.getElementById(`earned-cert-${key}`)) {
                        earnedContainer.innerHTML += `
                            <div class="cert-item earned" id="earned-cert-${key}" onclick="viewCertificate('${key}')" style="cursor:pointer; border-color:${config.color};">
                                <div style="position:absolute; top:10px; right:10px; background:var(--success); color:white; padding:4px 8px; border-radius:4px; font-size:10px;">EARNED</div>
                                <div class="cert-icon" style="color:${config.color};"><i class="ph ph-certificate"></i></div>
                                <h4>${config.name}</h4>
                                <p style="font-size:12px; color:var(--text-muted); margin:10px 0;">Skillify Certificate</p>
                                <button class="action-btn" style="width:100%; justify-content:center; margin-top:10px;" onclick="event.stopPropagation(); downloadCertificate('${key}')">
                                    <i class="ph ph-download"></i> Download PDF
                                </button>
                            </div>
                        `;
                    }
                }
            }
        }

        // Clear placeholder if has earned
        if (hasEarned && earnedContainer) {
            const placeholder = earnedContainer.querySelector('div[style*="grid-column"]');
            if (placeholder) placeholder.remove();
        }
    } catch (e) {
        console.error('Failed to load certificate progress:', e);
    }
}

// View certificate details
window.viewCertificate = function (courseKey) {
    const config = coursesConfig[courseKey];
    if (!config) return;

    createModal(`
        <div style="text-align:center;">
            <div style="width:80px; height:80px; margin:0 auto 20px; background:linear-gradient(135deg, ${config.color}, var(--purple)); border-radius:20px; display:flex; align-items:center; justify-content:center;">
                <i class="ph ph-certificate" style="font-size:40px; color:white;"></i>
            </div>
            <h2 style="margin-bottom:8px;">${config.name}</h2>
            <p style="color:var(--text-muted); margin-bottom:24px;">Skillify Professional Certificate</p>
            
            <div style="background:rgba(255,255,255,0.02); border:1px solid var(--border); border-radius:12px; padding:20px; margin-bottom:24px;">
                <h4 style="margin-bottom:16px;">Certificate Requirements:</h4>
                <ul style="text-align:left; list-style:none; padding:0;">
                    <li style="display:flex; align-items:center; gap:10px; padding:8px 0; border-bottom:1px solid var(--border);">
                        <i class="ph ph-check-circle" style="color:var(--success);"></i>
                        Complete all ${config.total} video lessons
                    </li>
                    <li style="display:flex; align-items:center; gap:10px; padding:8px 0; border-bottom:1px solid var(--border);">
                        <i class="ph ph-check-circle" style="color:var(--success);"></i>
                        Pass all quizzes with 80%+ score
                    </li>
                    <li style="display:flex; align-items:center; gap:10px; padding:8px 0;">
                        <i class="ph ph-check-circle" style="color:var(--success);"></i>
                        Complete the final project
                    </li>
                </ul>
            </div>

            <div style="display:flex; gap:12px;">
                <button onclick="this.closest('.modal-overlay').remove()" class="action-btn" style="flex:1;">
                    Close
                </button>
                <button onclick="downloadCertificate('${courseKey}')" class="pomo-btn active" style="flex:1;">
                    <i class="ph ph-download"></i> Download
                </button>
            </div>
        </div>
    `, { width: '450px' });
};

// Download certificate as PDF (generates HTML certificate)
window.downloadCertificate = async function (courseKey) {
    const config = coursesConfig[courseKey];
    if (!config) return;

    // Get user info
    let username = 'User';
    try {
        const res = await fetch('/auth/user');
        if (res.ok) {
            const user = await res.json();
            username = user.username || 'User';
        }
    } catch (e) { }

    const today = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    // Create certificate HTML
    const certificateHTML = `
    <!DOCTYPE html>
    <html>
    <head>
        <title>Skillify Certificate - ${config.name}</title>
        <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            @page { size: landscape; margin: 0; }
            body {
                font-family: 'Georgia', serif;
                background: linear-gradient(135deg, #0a0a0f, #1a1a2e);
                min-height: 100vh;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 40px;
            }
            .certificate {
                width: 900px;
                background: linear-gradient(135deg, #12121a, #1e1e2e);
                border: 3px solid ${config.color};
                border-radius: 20px;
                padding: 60px;
                position: relative;
                overflow: hidden;
            }
            .certificate::before {
                content: '';
                position: absolute;
                top: 20px;
                left: 20px;
                right: 20px;
                bottom: 20px;
                border: 1px solid rgba(255,255,255,0.1);
                border-radius: 15px;
            }
            .logo {
                text-align: center;
                font-size: 32px;
                font-weight: bold;
                color: ${config.color};
                margin-bottom: 20px;
                letter-spacing: 3px;
            }
            .title {
                text-align: center;
                font-size: 42px;
                color: white;
                margin-bottom: 10px;
                letter-spacing: 2px;
            }
            .subtitle {
                text-align: center;
                font-size: 18px;
                color: #9ca3af;
                margin-bottom: 40px;
            }
            .recipient {
                text-align: center;
                font-size: 48px;
                color: ${config.color};
                font-style: italic;
                margin-bottom: 30px;
                border-bottom: 2px solid ${config.color};
                padding-bottom: 10px;
                max-width: 500px;
                margin-left: auto;
                margin-right: auto;
            }
            .course {
                text-align: center;
                font-size: 28px;
                color: white;
                margin-bottom: 30px;
            }
            .details {
                text-align: center;
                color: #9ca3af;
                font-size: 14px;
                margin-bottom: 40px;
            }
            .signatures {
                display: flex;
                justify-content: space-around;
                margin-top: 40px;
            }
            .signature {
                text-align: center;
            }
            .signature-line {
                width: 200px;
                border-top: 1px solid #6366f1;
                margin-bottom: 10px;
            }
            .signature-name {
                color: white;
                font-weight: bold;
            }
            .signature-title {
                color: #9ca3af;
                font-size: 12px;
            }
            .id {
                position: absolute;
                bottom: 30px;
                right: 40px;
                color: rgba(255,255,255,0.3);
                font-size: 10px;
            }
        </style>
    </head>
    <body>
        <div class="certificate">
            <div class="logo">◆ SKILLIFY</div>
            <div class="title">Certificate of Completion</div>
            <div class="subtitle">This is to certify that</div>
            <div class="recipient">${username}</div>
            <div class="course">has successfully completed the<br><strong>${config.name}</strong> course</div>
            <div class="details">
                Issued on ${today}<br>
                Skillify Learning Platform
            </div>
            <div class="signatures">
                <div class="signature">
                    <div class="signature-line"></div>
                    <div class="signature-name">Yousef Amr</div>
                    <div class="signature-title">Founder & CEO</div>
                </div>
                <div class="signature">
                    <div class="signature-line"></div>
                    <div class="signature-name">Skillify Academy</div>
                    <div class="signature-title">Official Certificate</div>
                </div>
            </div>
            <div class="id">Certificate ID: ${courseKey.toUpperCase()}-${Date.now().toString(36).toUpperCase()}</div>
        </div>
        <script>window.print();</script>
    </body>
    </html>
    `;

    // Open in new window for printing/saving
    const win = window.open('', '_blank');
    win.document.write(certificateHTML);
    win.document.close();

    Toast.show('Certificate generated! Use Ctrl+P to save as PDF', 'success');
};

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    // Load on initial view
    const originalSwitchView = window.switchView;
    window.switchView = function (view, el) {
        if (originalSwitchView) originalSwitchView(view, el);

        if (view === 'certifications') {
            loadCertificateProgress();
        }
    };
});
