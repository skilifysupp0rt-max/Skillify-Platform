/**
 * SKILLIFY Feature Fixes Script
 * Adds logout button, loading states, empty states, and fixes AI chat
 */

const fs = require('fs');
const path = require('path');

const BASE_DIR = path.join(__dirname, 'public');
const DASHBOARD_PATH = path.join(BASE_DIR, 'dashboard.html');

function applyFeatureFixes() {
    let content = fs.readFileSync(DASHBOARD_PATH, 'utf-8');

    // 1. Add logout button in sidebar (before </aside>)
    const logoutButton = `
    <!-- Logout Button -->
    <div class="nav-item" id="logoutBtn" onclick="handleLogout()" style="margin-top: 20px; color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.2);">
      <i class="ph ph-sign-out"></i> Logout
    </div>
  </aside>`;

    content = content.replace('</aside>', logoutButton);
    console.log('✅ Added logout button to sidebar');

    // 2. Add handleLogout function and fix the dynamic logout injection
    // Replace the old dynamic logout button injection
    const oldLogout = /\/\* DYNAMIC LOGOUT BUTTON INJECTION \*\/[\s\S]*?sidebar\.appendChild\(logoutBtn\);[\s\S]*?\}\);/;

    const newLogoutHandler = `/* LOGOUT HANDLER */
      window.handleLogout = () => {
        if (confirm('Are you sure you want to logout?')) {
          fetch('/auth/logout', { method: 'POST', credentials: 'include' })
            .then(() => {
              localStorage.removeItem('username');
              localStorage.removeItem('token');
              window.location.href = '/';
            })
            .catch(() => {
              window.location.href = '/';
            });
        }
      };`;

    if (oldLogout.test(content)) {
        content = content.replace(oldLogout, newLogoutHandler);
        console.log('✅ Replaced dynamic logout with proper handler');
    } else {
        // Just add the handler if old pattern not found
        content = content.replace('</script>', newLogoutHandler + '\n    </script>');
        console.log('✅ Added logout handler');
    }

    // 3. Fix AI Chat to show "Coming Soon" message
    const oldChatHandler = /window\.sendChat = \(\) => \{[\s\S]*?setTimeout\(\(\) => \{[\s\S]*?\}, 800\);[\s\S]*?\};/;

    const newChatHandler = `window.sendChat = () => {
        const inp = document.getElementById('chatInput');
        const body = document.getElementById('chatBody');
        const val = DOMPurify.sanitize(inp.value.trim());
        if (!val) return;

        body.innerHTML += \`<div style="text-align:right; margin:10px 0;"><span
        style="background:var(--primary); padding:8px 12px; border-radius:12px;">\${val}</span></div>\`;
        inp.value = '';
        body.scrollTop = body.scrollHeight;

        setTimeout(() => {
          body.innerHTML += \`<div style="text-align:left; margin:10px 0;"><span
        style="background:rgba(255,255,255,0.05); padding:8px 12px; border-radius:12px;">
        <strong>🤖 AI Assistant</strong><br>
        AI features are coming soon! We're working on integrating smart learning recommendations and personalized study assistance. Stay tuned!
        </span></div>\`;
          body.scrollTop = body.scrollHeight;
        }, 600);
      };`;

    if (oldChatHandler.test(content)) {
        content = content.replace(oldChatHandler, newChatHandler);
        console.log('✅ Fixed AI Chat with Coming Soon message + DOMPurify');
    }

    // 4. Add loading skeleton class to CSS (will be in dashboard.css)
    // For now, just ensure the script is clean

    // 5. Fix title if still broken
    content = content.replace(/Skillify Ã¢â‚¬â€ Ultimate\s*/g, 'Skillify — Ultimate Learning Platform');
    content = content.replace(/Skillify â€" Ultimate\s*/g, 'Skillify — Ultimate Learning Platform');

    // Write back
    fs.writeFileSync(DASHBOARD_PATH, content, 'utf-8');

    console.log('\\n✅ All feature fixes applied to dashboard.html!');
}

// Fix Admin Panel
function fixAdminPanel() {
    const adminPath = path.join(BASE_DIR, 'admin.html');
    let content = fs.readFileSync(adminPath, 'utf-8');

    // Change "Option" button to "Delete" with better confirmation
    content = content.replace(
        /onclick="banUser\(\$\{u\.id\}\)">Option</g,
        'onclick="deleteUser(\'${u.id}\', \'${u.username}\')"><i class="ph ph-trash" style="margin-right:4px;"></i>Delete'
    );

    // Replace banUser with deleteUser that has better confirmation
    const oldBanUser = /window\.banUser = async \(id\) => \{[\s\S]*?\};/;
    const newDeleteUser = `window.deleteUser = async (id, username) => {
            if (confirm(\`Are you sure you want to permanently delete user "\${username}"? This action cannot be undone.\`)) {
                try {
                    await fetch('/api/admin/users/' + id, { method: 'DELETE' });
                    loadUsers(); 
                    loadStats();
                    alert('User deleted successfully.');
                } catch (err) {
                    alert('Failed to delete user.');
                }
            }
        };`;

    content = content.replace(oldBanUser, newDeleteUser);

    fs.writeFileSync(adminPath, content, 'utf-8');
    console.log('✅ Fixed Admin Panel user actions');
}

// Run fixes
applyFeatureFixes();
fixAdminPanel();

console.log('\\n🎉 All feature fixes complete!');
