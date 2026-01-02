/**
 * Fix JS null user handling in dashboard.html
 */

const fs = require('fs');
const path = require('path');

const DASHBOARD_PATH = path.join(__dirname, 'public', 'dashboard.html');

let content = fs.readFileSync(DASHBOARD_PATH, 'utf-8');

// Fix the socket join to check for data AND data.id
const oldSocketCode = `if (window.socket && data.id) {
              window.socket.emit('join', data.id);
            }`;

const newSocketCode = `if (window.socket && data && data.id) {
              window.socket.emit('join', data.id);
            }`;

if (content.includes(oldSocketCode)) {
    content = content.replace(oldSocketCode, newSocketCode);
    console.log('✅ Fixed socket join null check');
} else {
    // Try alternate pattern
    content = content.replace(
        /if \(window\.socket && data\.id\)/g,
        'if (window.socket && data && data.id)'
    );
    console.log('✅ Fixed socket join null check (pattern 2)');
}

fs.writeFileSync(DASHBOARD_PATH, content, 'utf-8');
console.log('✅ Dashboard JS fix complete!');
