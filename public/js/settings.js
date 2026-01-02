/**
 * Settings Page JavaScript
 * Handles all settings functionality
 */

// Switch between settings tabs
function switchSettingsTab(tab, btn) {
    // Hide all sections
    document.querySelectorAll('.settings-section').forEach(s => s.classList.remove('active'));
    // Show selected section
    document.getElementById('settings-' + tab).classList.add('active');
    // Update tab buttons
    document.querySelectorAll('.settings-tab').forEach(t => t.classList.remove('active'));
    btn.classList.add('active');
}

// Load settings data on page load
async function loadSettingsData() {
    try {
        // Load user data
        const res = await fetch('/auth/user');
        if (!res.ok) return;

        const user = await res.json();

        // Update profile section
        document.getElementById('settingsUsername').innerText = user.username || 'User';
        document.getElementById('settingsEmail').innerText = user.email || '';
        document.getElementById('settingsLevel').innerText = 'Level ' + (user.level || 1);

        // Update avatar
        const avatarText = document.getElementById('settingsAvatarText');
        const avatarImg = document.getElementById('settingsAvatarImg');

        if (user.avatar) {
            avatarText.style.display = 'none';
            avatarImg.style.display = 'block';
            avatarImg.src = user.avatar;
        } else {
            const initials = (user.username || 'U').substring(0, 2).toUpperCase();
            avatarText.innerText = initials;
        }

        // Update form fields
        document.getElementById('inputUsername').value = user.username || '';
        document.getElementById('inputEmail').value = user.email || '';
        document.getElementById('inputBio').value = user.bio || '';
        document.getElementById('inputLocation').value = user.location || '';
        document.getElementById('inputWebsite').value = user.website || '';

        // Update stats
        document.getElementById('statTotalXP').innerText = user.xp || 0;
        document.getElementById('statStreak').innerText = user.streak || 0;

        // Load video stats
        const videoRes = await fetch('/api/video/progress');
        if (videoRes.ok) {
            const videos = await videoRes.json();
            const completed = videos.filter(v => v.completed).length;
            document.getElementById('statVideos').innerText = completed;
        }

        // Load subscription
        const subRes = await fetch('/api/payment/subscription');
        if (subRes.ok) {
            const sub = await subRes.json();
            updateBillingSection(sub);

            // Update plan badge
            const planBadge = document.getElementById('settingsPlan');
            planBadge.innerText = (sub.plan || 'free').toUpperCase();
            if (sub.plan === 'pro') {
                planBadge.style.background = 'linear-gradient(135deg, var(--primary), var(--purple))';
                planBadge.style.color = 'white';
            } else if (sub.plan === 'enterprise') {
                planBadge.style.background = 'linear-gradient(135deg, var(--gold), #f97316)';
                planBadge.style.color = '#000';
            }
        }

        // Load saved preferences
        loadSavedPreferences();

    } catch (e) {
        console.error('Failed to load settings:', e);
    }
}

// Update billing section
function updateBillingSection(sub) {
    const planNames = {
        free: 'Free Plan',
        pro: 'Pro Plan',
        enterprise: 'Enterprise Plan'
    };
    const planDescs = {
        free: '3 courses, Basic quizzes',
        pro: 'All courses, Certificates, Priority support',
        enterprise: 'Teams, Analytics, API access, Custom branding'
    };
    const planPrices = {
        free: 0,
        pro: 9.99,
        enterprise: 29.99
    };

    document.getElementById('billingPlanName').innerText = planNames[sub.plan] || 'Free Plan';
    document.getElementById('billingPlanDesc').innerText = planDescs[sub.plan] || 'Basic features';
    document.getElementById('billingAmount').innerText = '$' + (sub.amount || planPrices[sub.plan] || 0);
    document.getElementById('billingPeriod').innerText = '/' + (sub.billingPeriod || 'month');

    // Show cancel button if not free
    if (sub.plan && sub.plan !== 'free') {
        document.getElementById('cancelSubBtn').style.display = 'block';
    }
}

// Save profile
async function saveProfile(e) {
    e.preventDefault();

    const data = {
        username: document.getElementById('inputUsername').value,
        bio: document.getElementById('inputBio').value,
        location: document.getElementById('inputLocation').value,
        website: document.getElementById('inputWebsite').value
    };

    try {
        const res = await fetch('/api/user/update-profile', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        if (res.ok) {
            Toast.show('Profile updated successfully!', 'success');
            loadSettingsData();
        } else {
            throw new Error('Failed to update profile');
        }
    } catch (e) {
        Toast.show('Failed to update profile', 'error');
    }
}

// Change password
async function changePassword(e) {
    e.preventDefault();

    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    if (!currentPassword || !newPassword || !confirmPassword) {
        Toast.show('Please fill all password fields', 'error');
        return;
    }

    if (newPassword !== confirmPassword) {
        Toast.show('New passwords do not match', 'error');
        return;
    }

    if (newPassword.length < 8) {
        Toast.show('Password must be at least 8 characters', 'error');
        return;
    }

    try {
        const res = await fetch('/api/user/change-password', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ currentPassword, newPassword })
        });

        if (res.ok) {
            Toast.show('Password changed successfully!', 'success');
            document.getElementById('passwordForm').reset();
        } else {
            const data = await res.json();
            throw new Error(data.message || 'Failed to change password');
        }
    } catch (e) {
        Toast.show(e.message || 'Failed to change password', 'error');
    }
}

// Handle avatar upload
async function handleAvatarUpload(input) {
    const file = input.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('avatar', file);

    try {
        const res = await fetch('/api/user/upload-avatar', {
            method: 'POST',
            body: formData
        });

        if (res.ok) {
            Toast.show('Avatar updated!', 'success');
            loadSettingsData();
        } else {
            throw new Error('Upload failed');
        }
    } catch (e) {
        // Fallback: show preview locally
        const reader = new FileReader();
        reader.onload = function (e) {
            document.getElementById('settingsAvatarText').style.display = 'none';
            document.getElementById('settingsAvatarImg').style.display = 'block';
            document.getElementById('settingsAvatarImg').src = e.target.result;
        };
        reader.readAsDataURL(file);
        Toast.show('Avatar preview shown (upload to server coming soon)', 'info');
    }
}

// Save notification settings
function saveNotificationSettings() {
    const settings = {
        courses: document.getElementById('notifCourses').checked,
        progress: document.getElementById('notifProgress').checked,
        reminders: document.getElementById('notifReminders').checked,
        marketing: document.getElementById('notifMarketing').checked,
        browser: document.getElementById('notifBrowser').checked,
        sound: document.getElementById('notifSound').checked
    };

    localStorage.setItem('skillify_notifications', JSON.stringify(settings));
    Toast.show('Notification settings saved', 'success');
}

// Set theme
function setTheme(theme, btn) {
    document.querySelectorAll('.theme-option').forEach(t => {
        t.classList.remove('active');
        t.querySelector('div').style.borderColor = 'transparent';
    });
    btn.classList.add('active');
    btn.querySelector('div').style.borderColor = 'var(--primary)';

    localStorage.setItem('skillify_theme', theme);

    // Apply theme (light mode coming soon)
    if (theme === 'light') {
        Toast.show('Light mode coming soon!', 'info');
    } else {
        Toast.show('Theme saved', 'success');
    }
}

// Set accent color
function setAccentColor(color, btn) {
    document.querySelectorAll('.color-option').forEach(c => c.classList.remove('active'));
    btn.classList.add('active');

    const colors = {
        primary: '#6366f1',
        cyan: '#22d3ee',
        purple: '#a855f7',
        green: '#10b981',
        orange: '#f97316',
        pink: '#ec4899'
    };

    document.documentElement.style.setProperty('--primary', colors[color]);
    localStorage.setItem('skillify_accent', color);
    Toast.show('Accent color updated!', 'success');
}

// Toggle compact mode
function toggleCompactMode() {
    const enabled = document.getElementById('compactMode').checked;
    document.body.classList.toggle('compact-mode', enabled);
    localStorage.setItem('skillify_compact', enabled);
}

// Toggle animations
function toggleAnimations() {
    const enabled = document.getElementById('animations').checked;
    document.body.classList.toggle('no-animations', !enabled);
    localStorage.setItem('skillify_animations', enabled);
}

// Confirm delete account
function confirmDeleteAccount() {
    const confirmed = confirm('⚠️ Are you sure you want to delete your account?\n\nThis action cannot be undone. All your data, progress, and certificates will be permanently deleted.');

    if (confirmed) {
        const doubleConfirm = prompt('Type "DELETE" to confirm:');
        if (doubleConfirm === 'DELETE') {
            deleteAccount();
        }
    }
}

// Delete account
async function deleteAccount() {
    try {
        const res = await fetch('/api/user/delete-account', {
            method: 'DELETE'
        });

        if (res.ok) {
            Toast.show('Account deleted. Goodbye!', 'success');
            setTimeout(() => {
                window.location.href = '/';
            }, 2000);
        } else {
            throw new Error('Failed to delete account');
        }
    } catch (e) {
        Toast.show('Failed to delete account', 'error');
    }
}

// Cancel subscription
async function cancelSubscription() {
    const confirmed = confirm('Are you sure you want to cancel your subscription?\n\nYou will retain access until the end of your billing period.');

    if (!confirmed) return;

    try {
        const res = await fetch('/api/payment/cancel-subscription', {
            method: 'POST'
        });

        if (res.ok) {
            const data = await res.json();
            Toast.show(data.message || 'Subscription cancelled', 'success');
            loadSettingsData();
        } else {
            throw new Error('Failed to cancel subscription');
        }
    } catch (e) {
        Toast.show('Failed to cancel subscription', 'error');
    }
}

// Load saved preferences
function loadSavedPreferences() {
    // Notifications
    const notifSettings = JSON.parse(localStorage.getItem('skillify_notifications') || '{}');
    if (notifSettings.courses !== undefined) document.getElementById('notifCourses').checked = notifSettings.courses;
    if (notifSettings.progress !== undefined) document.getElementById('notifProgress').checked = notifSettings.progress;
    if (notifSettings.reminders !== undefined) document.getElementById('notifReminders').checked = notifSettings.reminders;
    if (notifSettings.marketing !== undefined) document.getElementById('notifMarketing').checked = notifSettings.marketing;
    if (notifSettings.browser !== undefined) document.getElementById('notifBrowser').checked = notifSettings.browser;
    if (notifSettings.sound !== undefined) document.getElementById('notifSound').checked = notifSettings.sound;

    // Compact mode
    const compact = localStorage.getItem('skillify_compact') === 'true';
    if (document.getElementById('compactMode')) {
        document.getElementById('compactMode').checked = compact;
        if (compact) document.body.classList.add('compact-mode');
    }

    // Animations
    const animations = localStorage.getItem('skillify_animations') !== 'false';
    if (document.getElementById('animations')) {
        document.getElementById('animations').checked = animations;
        if (!animations) document.body.classList.add('no-animations');
    }

    // Accent color
    const accent = localStorage.getItem('skillify_accent');
    if (accent) {
        const colors = {
            primary: '#6366f1',
            cyan: '#22d3ee',
            purple: '#a855f7',
            green: '#10b981',
            orange: '#f97316',
            pink: '#ec4899'
        };
        if (colors[accent]) {
            document.documentElement.style.setProperty('--primary', colors[accent]);
        }
    }
}

// Initialize settings when view is shown
const originalSwitchView = window.switchView;
window.switchView = function (view, el) {
    if (originalSwitchView) originalSwitchView(view, el);

    if (view === 'profile') {
        loadSettingsData();
    }
};

// Load on initial page load if on settings
document.addEventListener('DOMContentLoaded', () => {
    loadSavedPreferences();
});
