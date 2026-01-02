/**
 * Enhanced Dashboard Features
 * Handles: Search, Theme, Popups, Dynamic Content
 */

// ============ GLOBAL SEARCH ============
function initGlobalSearch() {
    const searchInput = document.getElementById('globalSearch');
    if (!searchInput) return;

    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase().trim();

        // Search in current view
        const currentView = document.querySelector('.view-container.active');
        if (!currentView) return;

        // Search cards
        const cards = currentView.querySelectorAll('.course-card, .stat-card, .widget-panel, .cert-item, .challenge-card');
        cards.forEach(card => {
            const text = card.textContent.toLowerCase();
            if (query === '' || text.includes(query)) {
                card.style.display = '';
                card.style.opacity = '1';
            } else {
                card.style.display = 'none';
                card.style.opacity = '0';
            }
        });

        // Search sidebar items
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(item => {
            const text = item.textContent.toLowerCase();
            if (query === '' || text.includes(query)) {
                item.style.opacity = '1';
            } else {
                item.style.opacity = '0.3';
            }
        });
    });
}

// ============ THEME TOGGLE (GLOBAL) ============
function toggleTheme() {
    const body = document.body;
    const isLight = body.classList.toggle('light');
    localStorage.setItem('skillify_theme', isLight ? 'light' : 'dark');

    // Update icon
    const themeBtn = document.querySelector('[onclick="toggleTheme()"] i');
    if (themeBtn) {
        themeBtn.className = isLight ? 'ph ph-moon' : 'ph ph-sun';
    }

    Toast.show(`Switched to ${isLight ? 'Light' : 'Dark'} mode`, 'success');
}

// Apply saved theme on load
function applyTheme() {
    const savedTheme = localStorage.getItem('skillify_theme');
    if (savedTheme === 'light') {
        document.body.classList.add('light');
        const themeBtn = document.querySelector('[onclick="toggleTheme()"] i');
        if (themeBtn) themeBtn.className = 'ph ph-moon';
    }
}

// ============ CENTERED MODALS ============
function createModal(content, options = {}) {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.style.cssText = `
        position: fixed;
        inset: 0;
        background: rgba(0,0,0,0.7);
        backdrop-filter: blur(10px);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9999;
        animation: fadeIn 0.2s ease;
    `;

    const modal = document.createElement('div');
    modal.className = 'modal-content';
    modal.style.cssText = `
        background: var(--panel-solid);
        border: 1px solid var(--border);
        border-radius: 20px;
        padding: 30px;
        max-width: ${options.width || '500px'};
        width: 90%;
        max-height: 80vh;
        overflow-y: auto;
        animation: slideUp 0.3s ease;
    `;

    modal.innerHTML = content;
    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    // Close on overlay click
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            overlay.remove();
        }
    });

    // Close on Escape
    const escHandler = (e) => {
        if (e.key === 'Escape') {
            overlay.remove();
            document.removeEventListener('keydown', escHandler);
        }
    };
    document.addEventListener('keydown', escHandler);

    return { overlay, modal };
}

// Replace all alerts with modals
window.showModal = function (title, message, type = 'info') {
    const icons = {
        success: '<i class="ph ph-check-circle" style="color:var(--success);font-size:48px;"></i>',
        error: '<i class="ph ph-x-circle" style="color:#ef4444;font-size:48px;"></i>',
        info: '<i class="ph ph-info" style="color:var(--primary);font-size:48px;"></i>',
        warning: '<i class="ph ph-warning" style="color:var(--gold);font-size:48px;"></i>'
    };

    createModal(`
        <div style="text-align:center;">
            ${icons[type] || icons.info}
            <h2 style="margin:20px 0 10px;">${title}</h2>
            <p style="color:var(--text-muted);">${message}</p>
            <button onclick="this.closest('.modal-overlay').remove()" class="pomo-btn active" style="margin-top:20px;">
                OK
            </button>
        </div>
    `);
};

// ============ CALENDAR FUNCTIONALITY ============
function initCalendar() {
    const calendarView = document.getElementById('view-calendar');
    if (!calendarView) {
        // Create calendar view if not exists
        const mainContent = document.querySelector('.main-content');
        if (!mainContent) return;

        const calendarHTML = `
        <div id="view-calendar" class="view-container">
            <h2 style="margin-bottom:24px;">Calendar</h2>
            <div class="widget-panel" style="padding:0; overflow:hidden;">
                <div style="display:flex; justify-content:space-between; align-items:center; padding:20px; border-bottom:1px solid var(--border);">
                    <button class="action-btn" onclick="changeMonth(-1)"><i class="ph ph-caret-left"></i></button>
                    <h3 id="calendarMonth">January 2026</h3>
                    <button class="action-btn" onclick="changeMonth(1)"><i class="ph ph-caret-right"></i></button>
                </div>
                <div style="display:grid; grid-template-columns:repeat(7,1fr); text-align:center; padding:10px 0; background:rgba(255,255,255,0.02);">
                    <div style="font-weight:600; color:var(--text-muted); font-size:12px;">Sun</div>
                    <div style="font-weight:600; color:var(--text-muted); font-size:12px;">Mon</div>
                    <div style="font-weight:600; color:var(--text-muted); font-size:12px;">Tue</div>
                    <div style="font-weight:600; color:var(--text-muted); font-size:12px;">Wed</div>
                    <div style="font-weight:600; color:var(--text-muted); font-size:12px;">Thu</div>
                    <div style="font-weight:600; color:var(--text-muted); font-size:12px;">Fri</div>
                    <div style="font-weight:600; color:var(--text-muted); font-size:12px;">Sat</div>
                </div>
                <div id="calendarDays" style="display:grid; grid-template-columns:repeat(7,1fr); gap:4px; padding:10px;"></div>
            </div>
            <div class="widget-panel" style="margin-top:24px;">
                <h3 style="margin-bottom:16px;">Upcoming Events</h3>
                <div id="calendarEvents"></div>
            </div>
        </div>`;

        // Find a good place to insert
        const lastView = mainContent.querySelector('.view-container:last-of-type');
        if (lastView) {
            lastView.insertAdjacentHTML('afterend', calendarHTML);
        }
    }

    renderCalendar();
}

let currentCalendarDate = new Date();

function renderCalendar() {
    const daysContainer = document.getElementById('calendarDays');
    const monthLabel = document.getElementById('calendarMonth');
    if (!daysContainer || !monthLabel) return;

    const year = currentCalendarDate.getFullYear();
    const month = currentCalendarDate.getMonth();

    const months = ['January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'];
    monthLabel.textContent = `${months[month]} ${year}`;

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const today = new Date();

    daysContainer.innerHTML = '';

    // Empty cells for days before first day
    for (let i = 0; i < firstDay; i++) {
        daysContainer.innerHTML += '<div></div>';
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
        const isToday = day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
        const dayStyle = isToday
            ? 'background:var(--primary); color:white; border-radius:50%;'
            : 'color:var(--text); cursor:pointer;';

        daysContainer.innerHTML += `
            <div style="padding:12px; text-align:center; ${dayStyle}" 
                 onclick="selectCalendarDay(${day})">${day}</div>
        `;
    }
}

function changeMonth(delta) {
    currentCalendarDate.setMonth(currentCalendarDate.getMonth() + delta);
    renderCalendar();
}

window.selectCalendarDay = function (day) {
    Toast.show(`Selected: ${day}/${currentCalendarDate.getMonth() + 1}/${currentCalendarDate.getFullYear()}`, 'info');
};

// ============ CHALLENGES (REAL) ============
function initChallenges() {
    const challengesView = document.getElementById('view-challenges');
    if (!challengesView) {
        const mainContent = document.querySelector('.main-content');
        if (!mainContent) return;

        const challengesHTML = `
        <div id="view-challenges" class="view-container">
            <h2 style="margin-bottom:24px;">Weekly Challenges</h2>
            
            <div class="grid-stats" style="grid-template-columns: repeat(4, 1fr); margin-bottom:24px;">
                <div class="stat-card">
                    <div class="stat-val" style="color:var(--primary);">3/7</div>
                    <div class="stat-label">Completed</div>
                </div>
                <div class="stat-card">
                    <div class="stat-val" style="color:var(--gold);">500</div>
                    <div class="stat-label">XP Earned</div>
                </div>
                <div class="stat-card">
                    <div class="stat-val" style="color:var(--purple);">5</div>
                    <div class="stat-label">Days Left</div>
                </div>
                <div class="stat-card">
                    <div class="stat-val" style="color:var(--success);">#12</div>
                    <div class="stat-label">Your Rank</div>
                </div>
            </div>

            <div class="grid-courses">
                <!-- Challenge 1 -->
                <div class="course-card challenge-card" onclick="startChallenge('html-basics')">
                    <div class="course-inner" style="position:relative;">
                        <span style="position:absolute; top:10px; right:10px; background:var(--success); color:white; padding:4px 8px; border-radius:4px; font-size:10px; font-weight:700;">+100 XP</span>
                        <div class="course-icon" style="color:var(--primary);"><i class="ph ph-code"></i></div>
                        <div class="course-title">HTML Structure Challenge</div>
                        <div class="course-desc">Build a semantic webpage with header, nav, main, and footer.</div>
                        <div class="progress-track" style="margin-top:16px;">
                            <div class="progress-fill" style="width:100%; background:var(--success);"></div>
                        </div>
                        <div style="font-size:11px; color:var(--success); margin-top:8px;">✓ Completed</div>
                    </div>
                </div>

                <!-- Challenge 2 -->
                <div class="course-card challenge-card" onclick="startChallenge('css-flexbox')">
                    <div class="course-inner" style="position:relative;">
                        <span style="position:absolute; top:10px; right:10px; background:var(--gold); color:#000; padding:4px 8px; border-radius:4px; font-size:10px; font-weight:700;">+150 XP</span>
                        <div class="course-icon" style="color:var(--accent);"><i class="ph ph-layout"></i></div>
                        <div class="course-title">Flexbox Layout</div>
                        <div class="course-desc">Create a responsive card layout using only Flexbox.</div>
                        <div class="progress-track" style="margin-top:16px;">
                            <div class="progress-fill" style="width:60%; background:var(--accent);"></div>
                        </div>
                        <div style="font-size:11px; color:var(--text-muted); margin-top:8px;">60% Complete</div>
                    </div>
                </div>

                <!-- Challenge 3 -->
                <div class="course-card challenge-card" onclick="startChallenge('js-array')">
                    <div class="course-inner" style="position:relative;">
                        <span style="position:absolute; top:10px; right:10px; background:var(--primary); color:white; padding:4px 8px; border-radius:4px; font-size:10px; font-weight:700;">+200 XP</span>
                        <div class="course-icon" style="color:var(--gold);"><i class="ph ph-file-js"></i></div>
                        <div class="course-title">Array Methods Master</div>
                        <div class="course-desc">Use map, filter, and reduce to transform data.</div>
                        <div class="progress-track" style="margin-top:16px;">
                            <div class="progress-fill" style="width:0%;"></div>
                        </div>
                        <div style="font-size:11px; color:var(--text-muted); margin-top:8px;">Not Started</div>
                    </div>
                </div>

                <!-- Challenge 4 -->
                <div class="course-card challenge-card" onclick="startChallenge('api-fetch')">
                    <div class="course-inner" style="position:relative;">
                        <span style="position:absolute; top:10px; right:10px; background:var(--purple); color:white; padding:4px 8px; border-radius:4px; font-size:10px; font-weight:700;">+250 XP</span>
                        <div class="course-icon" style="color:var(--purple);"><i class="ph ph-cloud-arrow-down"></i></div>
                        <div class="course-title">API Integration</div>
                        <div class="course-desc">Fetch data from a REST API and display it.</div>
                        <div class="progress-track" style="margin-top:16px;">
                            <div class="progress-fill" style="width:100%; background:var(--success);"></div>
                        </div>
                        <div style="font-size:11px; color:var(--success); margin-top:8px;">✓ Completed</div>
                    </div>
                </div>

                <!-- Challenge 5 -->
                <div class="course-card challenge-card" onclick="startChallenge('responsive')">
                    <div class="course-inner" style="position:relative;">
                        <span style="position:absolute; top:10px; right:10px; background:var(--primary); color:white; padding:4px 8px; border-radius:4px; font-size:10px; font-weight:700;">+150 XP</span>
                        <div class="course-icon" style="color:var(--success);"><i class="ph ph-devices"></i></div>
                        <div class="course-title">Responsive Design</div>
                        <div class="course-desc">Make a website work on mobile, tablet, and desktop.</div>
                        <div class="progress-track" style="margin-top:16px;">
                            <div class="progress-fill" style="width:30%; background:var(--success);"></div>
                        </div>
                        <div style="font-size:11px; color:var(--text-muted); margin-top:8px;">30% Complete</div>
                    </div>
                </div>

                <!-- Challenge 6 -->
                <div class="course-card challenge-card" onclick="startChallenge('form-validation')">
                    <div class="course-inner" style="position:relative;">
                        <span style="position:absolute; top:10px; right:10px; background:var(--gold); color:#000; padding:4px 8px; border-radius:4px; font-size:10px; font-weight:700;">+100 XP</span>
                        <div class="course-icon" style="color:#ef4444;"><i class="ph ph-textbox"></i></div>
                        <div class="course-title">Form Validation</div>
                        <div class="course-desc">Build a form with real-time validation feedback.</div>
                        <div class="progress-track" style="margin-top:16px;">
                            <div class="progress-fill" style="width:100%; background:var(--success);"></div>
                        </div>
                        <div style="font-size:11px; color:var(--success); margin-top:8px;">✓ Completed</div>
                    </div>
                </div>
            </div>
        </div>`;

        const lastView = mainContent.querySelector('.view-container:last-of-type');
        if (lastView) {
            lastView.insertAdjacentHTML('afterend', challengesHTML);
        }
    }
}

window.startChallenge = function (id) {
    const challengeDetails = {
        'html-basics': {
            title: 'HTML Structure Challenge',
            description: 'Create a semantic HTML document with proper structure.',
            tasks: [
                'Create a valid HTML5 document',
                'Add a header with navigation',
                'Include a main section with article',
                'Add a footer with copyright'
            ]
        },
        'css-flexbox': {
            title: 'Flexbox Layout Challenge',
            description: 'Build a responsive card layout using Flexbox.',
            tasks: [
                'Create a flex container',
                'Add 3 equal-width cards',
                'Make cards wrap on mobile',
                'Add proper spacing'
            ]
        }
    };

    const details = challengeDetails[id] || { title: 'Challenge', description: 'Complete this challenge!', tasks: ['Complete the task'] };

    createModal(`
        <h2 style="margin-bottom:16px;">${details.title}</h2>
        <p style="color:var(--text-muted); margin-bottom:20px;">${details.description}</p>
        <h4 style="margin-bottom:12px;">Tasks:</h4>
        <ul style="list-style:none; padding:0;">
            ${details.tasks.map(t => `
                <li style="display:flex; align-items:center; gap:10px; padding:12px; background:rgba(255,255,255,0.03); border-radius:8px; margin-bottom:8px;">
                    <input type="checkbox" style="width:18px; height:18px;">
                    <span>${t}</span>
                </li>
            `).join('')}
        </ul>
        <button onclick="this.closest('.modal-overlay').remove(); Toast.show('Challenge started!', 'success');" class="pomo-btn active" style="margin-top:20px; width:100%;">
            Start Challenge
        </button>
    `, { width: '600px' });
};

// ============ MY COURSES (SHOW ONLY ACTIVE) ============
async function loadMyCourses() {
    try {
        const res = await fetch('/api/video/progress');
        if (!res.ok) return;

        const progress = await res.json();
        const coursesGrid = document.querySelector('#view-mycourses .grid-courses');
        if (!coursesGrid) return;

        // Group by course
        const courses = {};
        progress.forEach(p => {
            if (!courses[p.courseFile]) {
                courses[p.courseFile] = { completed: 0, total: 0 };
            }
            courses[p.courseFile].total++;
            if (p.completed) courses[p.courseFile].completed++;
        });

        // Only show courses with progress
        if (Object.keys(courses).length === 0) {
            coursesGrid.innerHTML = `
                <div style="grid-column:1/-1; text-align:center; padding:60px; color:var(--text-muted);">
                    <i class="ph ph-monitor-play" style="font-size:64px; opacity:0.3; margin-bottom:16px;"></i>
                    <h3>No courses started yet</h3>
                    <p>Start learning to see your progress here!</p>
                    <button onclick="switchView('roadmap', this)" class="pomo-btn active" style="margin-top:16px;">
                        Browse Courses
                    </button>
                </div>
            `;
        }
    } catch (e) {
        console.error('Failed to load courses:', e);
    }
}

// ============ INIT ALL ============
document.addEventListener('DOMContentLoaded', () => {
    applyTheme();
    initGlobalSearch();
    initCalendar();
    initChallenges();

    // Override switchView to load dynamic content
    const originalSwitchView = window.switchView;
    window.switchView = function (view, el) {
        if (originalSwitchView) originalSwitchView(view, el);

        if (view === 'calendar') renderCalendar();
        if (view === 'mycourses') loadMyCourses();
    };
});

// Add CSS for modals
const modalStyle = document.createElement('style');
modalStyle.textContent = `
@keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
}
@keyframes slideUp {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
}
`;
document.head.appendChild(modalStyle);
