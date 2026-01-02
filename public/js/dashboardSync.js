/**
 * Dashboard Integration System
 * Syncs course progress, XP, stats from backend to dashboard
 */

class DashboardSync {
    constructor() {
        this.userData = null;
        this.videoProgress = [];
        this.courseProgress = {};
        this.subscription = null;
        this.init();
    }

    async init() {
        await this.loadUserData();
        await this.loadVideoProgress();
        await this.loadSubscription();
        this.calculateCourseProgress();
        this.updateDashboard();
    }

    // Load user data from backend
    async loadUserData() {
        try {
            const res = await fetch('/auth/user');
            if (res.ok) {
                this.userData = await res.json();
            }
        } catch (e) {
            console.error('Failed to load user data:', e);
        }
    }

    // Load all video progress
    async loadVideoProgress() {
        try {
            const res = await fetch('/api/video/progress');
            if (res.ok) {
                this.videoProgress = await res.json();
            }
        } catch (e) {
            console.error('Failed to load video progress:', e);
        }
    }

    // Load subscription status
    async loadSubscription() {
        try {
            const res = await fetch('/api/payment/subscription');
            if (res.ok) {
                this.subscription = await res.json();
            }
        } catch (e) {
            console.error('Failed to load subscription:', e);
        }
    }

    // Calculate progress per course file
    calculateCourseProgress() {
        const courses = {
            'web.html': { total: 9, icon: 'code', name: 'Web Development' },
            'game.html': { total: 6, icon: 'game-controller', name: 'Game Development' },
            'pan.html': { total: 6, icon: 'code-block', name: 'Code Editor' },
            'design.html': { total: 6, icon: 'paint-brush', name: 'UI/UX Design' },
            'cv.html': { total: 6, icon: 'user', name: 'CV Builder' },
            'management.html': { total: 6, icon: 'briefcase', name: 'Project Management' },
            'ai.html': { total: 6, icon: 'brain', name: 'AI & Data Science' }
        };

        for (const [file, data] of Object.entries(courses)) {
            const completed = this.videoProgress.filter(
                p => p.courseFile === file && p.completed
            ).length;

            this.courseProgress[file] = {
                ...data,
                completed,
                percent: Math.round((completed / data.total) * 100)
            };
        }
    }

    // Update all dashboard elements
    updateDashboard() {
        this.updateStats();
        this.updateCourseCards();
        this.updateRoadmap();
        this.updateHeatmap();
        this.updateSubscriptionBadge();
    }

    // Update stat cards
    updateStats() {
        if (!this.userData) return;

        // Streak
        const streakEl = document.getElementById('stat-streak');
        if (streakEl) streakEl.innerText = this.userData.streak || 0;

        // XP
        const xpEl = document.getElementById('stat-xp');
        if (xpEl) xpEl.innerText = this.formatNumber(this.userData.xp || 0);

        // Focus Time
        const focusEl = document.getElementById('stat-focus');
        if (focusEl) focusEl.innerText = this.formatHours(this.userData.focusHours || 0);

        // Level display
        const levelEl = document.getElementById('levelText');
        if (levelEl) levelEl.innerText = `Level ${this.userData.level || 1}`;

        const xpBarEl = document.getElementById('xpBar');
        if (xpBarEl) {
            const xpProgress = (this.userData.xp || 0) % 100;
            xpBarEl.style.width = `${xpProgress}%`;
        }

        const xpTextEl = document.getElementById('xpText');
        if (xpTextEl) {
            xpTextEl.innerText = `${(this.userData.xp || 0) % 100} / 100 XP`;
        }

        // Total completed videos
        const totalCompleted = this.videoProgress.filter(p => p.completed).length;

        // Update greeting with stats
        const greeting = document.getElementById('greetingMsg');
        if (greeting && this.userData.username) {
            const hour = new Date().getHours();
            const greet = hour < 12 ? 'Good Morning' : hour < 18 ? 'Good Afternoon' : 'Good Evening';
            greeting.innerText = `${greet}, ${this.userData.username}! ⚡`;
        }

        const heroSub = document.querySelector('.hero-sub');
        if (heroSub && totalCompleted > 0) {
            heroSub.innerText = `You've completed ${totalCompleted} videos. Keep going!`;
        }
    }

    // Update course cards with progress
    updateCourseCards() {
        const courseCards = document.querySelectorAll('.course-card');

        courseCards.forEach(card => {
            const link = card.getAttribute('onclick');
            if (!link) return;

            // Extract course file from onclick
            const match = link.match(/['"]([^'"]+\.html)['"]/);
            if (!match) return;

            const fileName = match[1].split('/').pop();
            const progress = this.courseProgress[fileName];

            if (progress) {
                // Update progress bar
                const progressFill = card.querySelector('.course-progress-fill');
                if (progressFill) {
                    progressFill.style.width = `${progress.percent}%`;
                    progressFill.style.background = progress.percent === 100
                        ? 'var(--success)'
                        : 'linear-gradient(90deg, var(--primary), var(--accent))';
                }

                // Update meta text
                const metaSpans = card.querySelectorAll('.course-meta span');
                if (metaSpans.length >= 2) {
                    metaSpans[0].innerText = `${progress.completed}/${progress.total} Videos`;
                    metaSpans[1].innerText = `${progress.percent}% Complete`;
                }

                // Add completion badge
                if (progress.percent === 100 && !card.querySelector('.course-badge.badge-done')) {
                    const inner = card.querySelector('.course-inner');
                    if (inner) {
                        const badge = document.createElement('div');
                        badge.className = 'course-badge badge-done';
                        badge.style.cssText = 'background: var(--success); color: white;';
                        badge.innerText = '✓ DONE';
                        inner.prepend(badge);
                    }
                }
            }
        });
    }

    // Update roadmap progress
    updateRoadmap() {
        const nodeMap = {
            'node-web-dev': 'web.html',
            'node-game': 'game.html',
            'node-ui-ux': 'design.html',
            'node-backend': 'pan.html',
            'node-ai': 'ai.html'
        };

        for (const [nodeId, fileName] of Object.entries(nodeMap)) {
            const node = document.getElementById(nodeId);
            if (!node) continue;

            const progress = this.courseProgress[fileName];
            if (!progress) continue;

            // Update progress bar in node
            const progressBar = node.querySelector('.progress-fill');
            if (progressBar) {
                progressBar.style.width = `${progress.percent}%`;
            }

            // Update node state
            if (progress.percent === 100) {
                node.classList.remove('current', 'locked');
                node.classList.add('completed');
            } else if (progress.percent > 0) {
                node.classList.remove('locked', 'completed');
                node.classList.add('current');
            }

            // Update progress text
            const progressText = node.querySelector('.node-progress span:last-child');
            if (progressText) {
                progressText.innerText = `${progress.percent}%`;
            }
        }
    }

    // Update activity heatmap
    updateHeatmap() {
        const heatmap = document.getElementById('heatmap');
        if (!heatmap) return;

        // Create activity data from video progress
        const activityMap = {};
        this.videoProgress.forEach(p => {
            if (p.completedAt) {
                const date = new Date(p.completedAt).toDateString();
                activityMap[date] = (activityMap[date] || 0) + 1;
            }
        });

        // Generate heatmap cells for last 90 days
        heatmap.innerHTML = '';
        const today = new Date();

        for (let i = 89; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const dateStr = date.toDateString();
            const count = activityMap[dateStr] || 0;

            const cell = document.createElement('div');
            cell.className = 'heatmap-cell';
            cell.title = `${dateStr}: ${count} videos`;

            // Color based on activity
            if (count === 0) {
                cell.style.background = 'rgba(255,255,255,0.03)';
            } else if (count === 1) {
                cell.style.background = 'rgba(99, 102, 241, 0.3)';
            } else if (count <= 3) {
                cell.style.background = 'rgba(99, 102, 241, 0.5)';
            } else {
                cell.style.background = 'rgba(99, 102, 241, 0.8)';
            }

            heatmap.appendChild(cell);
        }
    }

    // Utility functions
    formatNumber(num) {
        if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
        if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
        return num.toString();
    }

    formatHours(hours) {
        if (hours < 1) return Math.round(hours * 60) + 'm';
        return Math.round(hours) + 'h';
    }

    // Update subscription badge in sidebar
    updateSubscriptionBadge() {
        const planBadge = document.getElementById('currentPlan');
        if (!planBadge) return;

        const plan = this.subscription?.plan || 'free';
        const planNames = {
            free: 'FREE',
            pro: 'PRO',
            enterprise: 'ENTERPRISE'
        };
        const planColors = {
            free: 'var(--success)',
            pro: 'linear-gradient(135deg, var(--primary), var(--purple))',
            enterprise: 'linear-gradient(135deg, var(--gold), #f97316)'
        };

        planBadge.innerText = planNames[plan] || 'FREE';
        planBadge.style.background = planColors[plan] || 'var(--success)';

        // Update upgrade button text if pro/enterprise
        const upgradeBtn = planBadge.closest('.nav-item');
        if (upgradeBtn && plan !== 'free') {
            upgradeBtn.querySelector('span:not(#currentPlan)').innerText = 'Manage Plan';
        }
    }
}

// Initialize on page load
let dashboardSync;
document.addEventListener('DOMContentLoaded', () => {
    // Only init on dashboard
    if (window.location.pathname.includes('dashboard')) {
        dashboardSync = new DashboardSync();
    }
});

// Refresh dashboard data every 30 seconds
setInterval(() => {
    if (dashboardSync) {
        dashboardSync.init();
    }
}, 30000);
