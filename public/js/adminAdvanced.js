/**
 * Advanced Admin Features
 * Analytics, Leaderboard, Courses, Coupons, Announcements, Banned, Payments, Emails
 */

// ============ ANALYTICS VIEW ============
async function loadAnalytics() {
    const container = document.getElementById('view-analytics');
    if (!container) createAnalyticsView();

    try {
        // Fetch real stats
        const statsRes = await fetch('/api/admin/stats');
        const stats = await statsRes.json();

        const el = (id) => document.getElementById(id);
        if (el('newUsersCount')) el('newUsersCount').textContent = stats.newUsersThisWeek || 0;
        if (el('revenueCount')) el('revenueCount').textContent = '$' + (stats.totalRevenue || '0');
        if (el('videosWatched')) el('videosWatched').textContent = stats.videosWatched || 0;

        const convRate = stats.users > 0 ? Math.round(((stats.proMembers || 0) / stats.users) * 100) : 0;
        if (el('conversionRate')) el('conversionRate').textContent = convRate + '%';

        // Fetch analytics for charts
        const analyticsRes = await fetch('/api/admin/analytics?days=30');
        const analytics = await analyticsRes.json();

        loadRegistrationChart(analytics.registrations);
        loadActivityChart(analytics.videoCompletions);
    } catch (e) {
        console.error('Failed to load analytics:', e);
    }
}

function createAnalyticsView() {
    const main = document.querySelector('.main-content');
    const html = `
    <div id="view-analytics" class="view">
        <div class="header">
            <div>
                <h1>Analytics</h1>
                <p style="color:var(--text-muted); margin-top:4px;">Platform performance metrics</p>
            </div>
            <div class="header-actions">
                <select class="form-input" style="width:150px;" onchange="changeAnalyticsPeriod(this.value)">
                    <option value="7">Last 7 days</option>
                    <option value="30" selected>Last 30 days</option>
                    <option value="90">Last 90 days</option>
                </select>
            </div>
        </div>
        
        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-icon" style="background:rgba(99, 102, 241, 0.2); color:var(--primary);"><i class="ph ph-user-plus"></i></div>
                <div class="stat-value" id="newUsersCount">0</div>
                <div class="stat-label">New Users</div>
            </div>
            <div class="stat-card">
                <div class="stat-icon" style="background:rgba(16, 185, 129, 0.2); color:var(--success);"><i class="ph ph-currency-dollar"></i></div>
                <div class="stat-value" id="revenueCount">$0</div>
                <div class="stat-label">Revenue</div>
            </div>
            <div class="stat-card">
                <div class="stat-icon" style="background:rgba(168, 85, 247, 0.2); color:var(--purple);"><i class="ph ph-video"></i></div>
                <div class="stat-value" id="videosWatched">0</div>
                <div class="stat-label">Videos Watched</div>
            </div>
            <div class="stat-card">
                <div class="stat-icon" style="background:rgba(251, 191, 36, 0.2); color:var(--warning);"><i class="ph ph-percent"></i></div>
                <div class="stat-value" id="conversionRate">0%</div>
                <div class="stat-label">Conversion Rate</div>
            </div>
        </div>
        
        <div class="grid-2" style="margin-top:24px;">
            <div class="table-container" style="padding:20px;">
                <h3 style="margin-bottom:16px;">User Registrations</h3>
                <div style="height:300px;"><canvas id="registrationChart"></canvas></div>
            </div>
            <div class="table-container" style="padding:20px;">
                <h3 style="margin-bottom:16px;">Daily Activity</h3>
                <div style="height:300px;"><canvas id="activityChartCanvas"></canvas></div>
            </div>
        </div>
    </div>`;
    main.insertAdjacentHTML('beforeend', html);
}

function loadRegistrationChart(data = {}) {
    const ctx = document.getElementById('registrationChart');
    if (!ctx) return;

    const labels = Object.keys(data).slice(-7);
    const values = labels.map(l => data[l] || 0);

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels.length ? labels : ['No data'],
            datasets: [{
                label: 'New Users',
                data: values.length ? values : [0],
                borderColor: '#6366f1',
                backgroundColor: 'rgba(99, 102, 241, 0.1)',
                fill: true,
                tension: 0.4
            }]
        },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
    });
}

function loadActivityChart(data = {}) {
    const ctx = document.getElementById('activityChartCanvas');
    if (!ctx) return;

    const labels = Object.keys(data).slice(-7);
    const values = labels.map(l => data[l] || 0);

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels.length ? labels : ['No data'],
            datasets: [{
                label: 'Completed Videos',
                data: values.length ? values : [0],
                backgroundColor: '#10b981'
            }]
        },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
    });
}

// ============ LEADERBOARD VIEW ============
function loadLeaderboard() {
    const container = document.getElementById('view-leaderboard');
    if (!container) createLeaderboardView();
    loadTopUsers();
}

function createLeaderboardView() {
    const main = document.querySelector('.main-content');
    const html = `
    <div id="view-leaderboard" class="view">
        <div class="header">
            <div>
                <h1>🏆 Leaderboard</h1>
                <p style="color:var(--text-muted); margin-top:4px;">Top users by XP</p>
            </div>
        </div>
        
        <div class="table-container">
            <table>
                <thead>
                    <tr>
                        <th>#</th>
                        <th>User</th>
                        <th>XP</th>
                        <th>Level</th>
                        <th>Courses</th>
                        <th>Streak</th>
                    </tr>
                </thead>
                <tbody id="leaderboardTable"></tbody>
            </table>
        </div>
    </div>`;
    main.insertAdjacentHTML('beforeend', html);
}

async function loadTopUsers() {
    try {
        // Use new real leaderboard API
        const res = await fetch('/api/admin/leaderboard');
        if (!res.ok) return;
        const data = await res.json();

        const tbody = document.getElementById('leaderboardTable');
        if (!tbody) return;

        tbody.innerHTML = data.slice(0, 20).map(u => `
            <tr>
                <td style="font-weight:700; color:${u.rank <= 3 ? '#fbbf24' : 'var(--text-muted)'};">🏅 ${u.rank}</td>
                <td>
                    <div class="user-cell">
                        <div class="user-cell-avatar">${(u.username || 'U')[0].toUpperCase()}</div>
                        <div class="user-cell-name">${u.username}</div>
                    </div>
                </td>
                <td style="font-weight:700;">${u.xp || 0} XP</td>
                <td><span class="role-badge" style="background:rgba(99, 102, 241, 0.2); color:var(--primary);">Lvl ${u.level || 1}</span></td>
                <td>${u.videosCompleted || 0} videos</td>
                <td>${u.streak || 0} 🔥</td>
            </tr>
        `).join('');
    } catch (e) {
        console.error('Failed to load leaderboard:', e);
    }
}

// ============ COURSES MANAGEMENT ============
function loadCourses() {
    const container = document.getElementById('view-courses');
    if (!container) createCoursesView();
}

function createCoursesView() {
    const main = document.querySelector('.main-content');
    const html = `
    <div id="view-courses" class="view">
        <div class="header">
            <div>
                <h1>Course Management</h1>
                <p style="color:var(--text-muted); margin-top:4px;">Add, edit, or remove courses</p>
            </div>
            <button class="btn btn-primary" onclick="addCourseModal()"><i class="ph ph-plus"></i> Add Course</button>
        </div>
        
        <div class="table-container">
            <table>
                <thead>
                    <tr>
                        <th>Course</th>
                        <th>Category</th>
                        <th>Videos</th>
                        <th>Enrollments</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody id="coursesTable">
                    <tr>
                        <td><div class="user-cell"><div class="user-cell-avatar" style="background:var(--primary);"><i class="ph ph-code"></i></div><div>Web Development</div></div></td>
                        <td>Development</td>
                        <td>9</td>
                        <td>245</td>
                        <td><span class="role-badge" style="background:rgba(16, 185, 129, 0.2); color:var(--success);">Active</span></td>
                        <td><button class="action-btn"><i class="ph ph-pencil"></i></button><button class="action-btn danger"><i class="ph ph-trash"></i></button></td>
                    </tr>
                    <tr>
                        <td><div class="user-cell"><div class="user-cell-avatar" style="background:var(--purple);"><i class="ph ph-game-controller"></i></div><div>Game Development</div></div></td>
                        <td>Development</td>
                        <td>6</td>
                        <td>123</td>
                        <td><span class="role-badge" style="background:rgba(16, 185, 129, 0.2); color:var(--success);">Active</span></td>
                        <td><button class="action-btn"><i class="ph ph-pencil"></i></button><button class="action-btn danger"><i class="ph ph-trash"></i></button></td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>`;
    main.insertAdjacentHTML('beforeend', html);
}

function addCourseModal() {
    showAdminModal('Add New Course', `
        <div class="form-group">
            <label class="form-label">Course Name</label>
            <input type="text" class="form-input" id="newCourseName" placeholder="e.g. Python Basics">
        </div>
        <div class="form-group">
            <label class="form-label">Category</label>
            <select class="form-input" id="newCourseCategory">
                <option>Development</option>
                <option>Design</option>
                <option>Business</option>
                <option>Marketing</option>
            </select>
        </div>
        <button class="btn btn-primary" style="width:100%;" onclick="saveCourse()">Save Course</button>
    `);
}

// ============ COUPONS ============
function loadCoupons() {
    const container = document.getElementById('view-coupons');
    if (!container) createCouponsView();
}

function createCouponsView() {
    const main = document.querySelector('.main-content');
    const html = `
    <div id="view-coupons" class="view">
        <div class="header">
            <div>
                <h1>Discount Coupons</h1>
                <p style="color:var(--text-muted); margin-top:4px;">Create and manage discount codes</p>
            </div>
            <button class="btn btn-primary" onclick="addCouponModal()"><i class="ph ph-plus"></i> Create Coupon</button>
        </div>
        
        <div class="table-container">
            <table>
                <thead>
                    <tr>
                        <th>Code</th>
                        <th>Discount</th>
                        <th>Uses</th>
                        <th>Limit</th>
                        <th>Expires</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody id="couponsTable">
                    <tr>
                        <td><code style="background:var(--panel-hover); padding:4px 8px; border-radius:4px;">WELCOME50</code></td>
                        <td style="font-weight:700; color:var(--success);">50%</td>
                        <td>12</td>
                        <td>100</td>
                        <td>Jan 31, 2026</td>
                        <td><span class="role-badge" style="background:rgba(16, 185, 129, 0.2); color:var(--success);">Active</span></td>
                        <td><button class="action-btn danger" onclick="deleteCoupon('WELCOME50')"><i class="ph ph-trash"></i></button></td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>`;
    main.insertAdjacentHTML('beforeend', html);
}

function addCouponModal() {
    showAdminModal('Create Coupon', `
        <div class="form-group">
            <label class="form-label">Coupon Code</label>
            <input type="text" class="form-input" id="newCouponCode" placeholder="e.g. SUMMER2026" style="text-transform:uppercase;">
        </div>
        <div class="grid-2">
            <div class="form-group">
                <label class="form-label">Discount %</label>
                <input type="number" class="form-input" id="newCouponDiscount" placeholder="50" min="1" max="100">
            </div>
            <div class="form-group">
                <label class="form-label">Use Limit</label>
                <input type="number" class="form-input" id="newCouponLimit" placeholder="100">
            </div>
        </div>
        <div class="form-group">
            <label class="form-label">Expiry Date</label>
            <input type="date" class="form-input" id="newCouponExpiry">
        </div>
        <button class="btn btn-success" style="width:100%;" onclick="saveCoupon()"><i class="ph ph-check"></i> Create Coupon</button>
    `);
}

// ============ ANNOUNCEMENTS ============
function loadAnnouncements() {
    const container = document.getElementById('view-announcements');
    if (!container) createAnnouncementsView();
}

function createAnnouncementsView() {
    const main = document.querySelector('.main-content');
    const html = `
    <div id="view-announcements" class="view">
        <div class="header">
            <div>
                <h1>Announcements</h1>
                <p style="color:var(--text-muted); margin-top:4px;">Display messages on user dashboards</p>
            </div>
            <button class="btn btn-primary" onclick="addAnnouncementModal()"><i class="ph ph-megaphone"></i> New Announcement</button>
        </div>
        
        <div id="announcementsList" style="display:flex; flex-direction:column; gap:16px;">
            <div class="table-container" style="padding:20px; border-left:4px solid var(--primary);">
                <div style="display:flex; justify-content:space-between; align-items:start;">
                    <div>
                        <h3>🎉 Welcome to Skillify 2.0!</h3>
                        <p style="color:var(--text-muted); margin-top:8px;">We've added new courses, improved performance, and fixed bugs. Enjoy learning!</p>
                        <div style="font-size:12px; color:var(--text-muted); margin-top:12px;">Created: Jan 1, 2026 • Visible to: All Users</div>
                    </div>
                    <button class="action-btn danger"><i class="ph ph-trash"></i></button>
                </div>
            </div>
        </div>
    </div>`;
    main.insertAdjacentHTML('beforeend', html);
}

function addAnnouncementModal() {
    showAdminModal('New Announcement', `
        <div class="form-group">
            <label class="form-label">Title</label>
            <input type="text" class="form-input" id="announcementTitle" placeholder="Announcement title">
        </div>
        <div class="form-group">
            <label class="form-label">Message</label>
            <textarea class="form-textarea" id="announcementMessage" placeholder="Write your announcement..."></textarea>
        </div>
        <div class="form-group">
            <label class="form-label">Type</label>
            <select class="form-input" id="announcementType">
                <option value="info">ℹ️ Info</option>
                <option value="success">✅ Success</option>
                <option value="warning">⚠️ Warning</option>
                <option value="danger">🚨 Critical</option>
            </select>
        </div>
        <button class="btn btn-primary" style="width:100%;" onclick="saveAnnouncement()">Publish Announcement</button>
    `);
}

// ============ BANNED USERS ============
function loadBanned() {
    const container = document.getElementById('view-banned');
    if (!container) createBannedView();
}

function createBannedView() {
    const main = document.querySelector('.main-content');
    const html = `
    <div id="view-banned" class="view">
        <div class="header">
            <div>
                <h1>Banned Users</h1>
                <p style="color:var(--text-muted); margin-top:4px;">Manage user bans and restrictions</p>
            </div>
        </div>
        
        <div class="table-container">
            <div class="table-header">
                <h3>Ban a User</h3>
            </div>
            <div style="padding:20px; display:flex; gap:12px;">
                <input type="email" class="form-input" id="banEmail" placeholder="User email to ban">
                <select class="form-input" style="width:200px;" id="banDuration">
                    <option value="1">1 Day</option>
                    <option value="7">7 Days</option>
                    <option value="30">30 Days</option>
                    <option value="0">Permanent</option>
                </select>
                <button class="btn btn-danger" onclick="banUser()"><i class="ph ph-prohibit"></i> Ban User</button>
            </div>
        </div>
        
        <div class="table-container" style="margin-top:24px;">
            <div class="table-header">
                <h3>Currently Banned</h3>
            </div>
            <div id="bannedList" style="padding:20px;">
                <div class="empty-state">
                    <i class="ph ph-check-circle"></i>
                    <p>No banned users</p>
                </div>
            </div>
        </div>
    </div>`;
    main.insertAdjacentHTML('beforeend', html);
}

// ============ PAYMENTS ============
async function loadPayments() {
    const container = document.getElementById('view-payments');
    if (!container) createPaymentsView();

    try {
        const res = await fetch('/api/admin/payments');
        const data = await res.json();

        // Update stats
        const statsRes = await fetch('/api/admin/stats');
        const stats = await statsRes.json();

        const paymentsStats = document.querySelectorAll('#view-payments .stat-card .stat-value');
        if (paymentsStats.length >= 4) {
            paymentsStats[0].textContent = '$' + (data.totalRevenue || '0');
            paymentsStats[1].textContent = '$' + (data.totalRevenue || '0');
            paymentsStats[2].textContent = stats.proMembers || 0;
            paymentsStats[3].textContent = stats.enterpriseMembers || 0;
        }

        // Update table
        const tbody = document.getElementById('paymentsTable');
        if (tbody && data.subscriptions && data.subscriptions.length > 0) {
            tbody.innerHTML = data.subscriptions.map((s, i) => {
                const statusClass = s.status === 'active' ? 'var(--success)' : 'var(--warning)';
                return `
                <tr>
                    <td style="color:var(--text-muted);">#SUB-${String(i + 1).padStart(3, '0')}</td>
                    <td>${s.user || 'Unknown'}</td>
                    <td>${s.plan} ${s.billingPeriod}</td>
                    <td style="font-weight:700;">$${s.amount || '0'}</td>
                    <td><i class="ph ph-credit-card"></i> Stripe</td>
                    <td>${s.startDate ? new Date(s.startDate).toLocaleDateString() : '-'}</td>
                    <td><span class="role-badge" style="background:rgba(16, 185, 129, 0.2); color:${statusClass};">${s.status}</span></td>
                </tr>`;
            }).join('');
        }
    } catch (e) {
        console.error('Failed to load payments:', e);
    }
}

function createPaymentsView() {
    const main = document.querySelector('.main-content');
    const html = `
    <div id="view-payments" class="view">
        <div class="header">
            <div>
                <h1>Payments History</h1>
                <p style="color:var(--text-muted); margin-top:4px;">All transactions and subscriptions</p>
            </div>
            <button class="btn btn-secondary" onclick="exportPayments()"><i class="ph ph-download"></i> Export CSV</button>
        </div>
        
        <div class="stats-grid" style="margin-bottom:24px;">
            <div class="stat-card">
                <div class="stat-value" style="color:var(--success);">$2,450</div>
                <div class="stat-label">This Month</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">$18,320</div>
                <div class="stat-label">Total Revenue</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">156</div>
                <div class="stat-label">Pro Members</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">12</div>
                <div class="stat-label">Enterprise</div>
            </div>
        </div>
        
        <div class="table-container">
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>User</th>
                        <th>Plan</th>
                        <th>Amount</th>
                        <th>Method</th>
                        <th>Date</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody id="paymentsTable">
                    <tr>
                        <td style="color:var(--text-muted);">#PAY-001</td>
                        <td>john@example.com</td>
                        <td>Pro Monthly</td>
                        <td style="font-weight:700;">$9.99</td>
                        <td><i class="ph ph-credit-card"></i> Stripe</td>
                        <td>Jan 2, 2026</td>
                        <td><span class="role-badge" style="background:rgba(16, 185, 129, 0.2); color:var(--success);">Completed</span></td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>`;
    main.insertAdjacentHTML('beforeend', html);
}

// ============ EMAIL TEMPLATES ============
function loadEmails() {
    const container = document.getElementById('view-emails');
    if (!container) createEmailsView();
}

function createEmailsView() {
    const main = document.querySelector('.main-content');
    const html = `
    <div id="view-emails" class="view">
        <div class="header">
            <div>
                <h1>Email Templates</h1>
                <p style="color:var(--text-muted); margin-top:4px;">Pre-made email templates for quick messaging</p>
            </div>
            <button class="btn btn-primary" onclick="addTemplateModal()"><i class="ph ph-plus"></i> New Template</button>
        </div>
        
        <div class="grid-3" id="emailTemplates">
            <div class="table-container" style="padding:20px; cursor:pointer;" onclick="useTemplate('welcome')">
                <h4 style="margin-bottom:8px;">👋 Welcome Email</h4>
                <p style="font-size:13px; color:var(--text-muted);">Sent to new users after registration</p>
            </div>
            <div class="table-container" style="padding:20px; cursor:pointer;" onclick="useTemplate('reminder')">
                <h4 style="margin-bottom:8px;">⏰ Course Reminder</h4>
                <p style="font-size:13px; color:var(--text-muted);">Remind users about incomplete courses</p>
            </div>
            <div class="table-container" style="padding:20px; cursor:pointer;" onclick="useTemplate('promo')">
                <h4 style="margin-bottom:8px;">🎁 Promo Email</h4>
                <p style="font-size:13px; color:var(--text-muted);">Promotional offers and discounts</p>
            </div>
            <div class="table-container" style="padding:20px; cursor:pointer;" onclick="useTemplate('password')">
                <h4 style="margin-bottom:8px;">🔐 Password Reset</h4>
                <p style="font-size:13px; color:var(--text-muted);">Password reset confirmation</p>
            </div>
            <div class="table-container" style="padding:20px; cursor:pointer;" onclick="useTemplate('certificate')">
                <h4 style="margin-bottom:8px;">🎓 Certificate Ready</h4>
                <p style="font-size:13px; color:var(--text-muted);">Notify users of earned certificates</p>
            </div>
            <div class="table-container" style="padding:20px; cursor:pointer;" onclick="useTemplate('inactive')">
                <h4 style="margin-bottom:8px;">😴 Inactive User</h4>
                <p style="font-size:13px; color:var(--text-muted);">Win back inactive users</p>
            </div>
        </div>
    </div>`;
    main.insertAdjacentHTML('beforeend', html);
}

function useTemplate(type) {
    const templates = {
        welcome: { subject: 'Welcome to Skillify! 🎉', body: 'Hi {name},\n\nWelcome to Skillify! Start your learning journey today.' },
        reminder: { subject: 'Continue your course! ⏰', body: 'Hi {name},\n\nYou haven\'t finished your course yet. Keep going!' },
        promo: { subject: 'Special Offer! 🎁', body: 'Hi {name},\n\nGet 50% off Pro with code SPECIAL50!' }
    };

    const t = templates[type];
    if (t) {
        document.getElementById('broadcastSubject').value = t.subject;
        document.getElementById('broadcastMessage').value = t.body;
        switchView('messages');
    }
}

// ============ MODAL HELPER ============
function showAdminModal(title, content) {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal" style="position:relative;">
            <button class="modal-close" onclick="this.parentElement.parentElement.remove()">&times;</button>
            <h2>${title}</h2>
            ${content}
        </div>
    `;
    document.body.appendChild(modal);
    modal.onclick = (e) => { if (e.target === modal) modal.remove(); };
}

// ============ UPDATE SWITCH VIEW ============
const originalSwitchView = window.switchView;
window.switchView = function (view) {
    // Call original if exists
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    const viewEl = document.getElementById('view-' + view);

    if (!viewEl) {
        // Create view if doesn't exist
        if (view === 'analytics') { createAnalyticsView(); loadAnalytics(); }
        else if (view === 'leaderboard') { createLeaderboardView(); loadLeaderboard(); }
        else if (view === 'courses') createCoursesView();
        else if (view === 'coupons') createCouponsView();
        else if (view === 'announcements') createAnnouncementsView();
        else if (view === 'banned') createBannedView();
        else if (view === 'payments') createPaymentsView();
        else if (view === 'emails') createEmailsView();
    }

    const el = document.getElementById('view-' + view);
    if (el) el.classList.add('active');

    // Update nav
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    if (event && event.target) {
        event.target.closest('.nav-item')?.classList.add('active');
    }

    // Load data
    if (view === 'analytics') loadAnalytics();
    if (view === 'leaderboard') loadTopUsers();
};
