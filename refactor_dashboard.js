/**
 * SKILLIFY CSS Refactor Script (Node.js)
 * This script safely removes inline CSS from dashboard.html and links external CSS
 */

const fs = require('fs');
const path = require('path');

const BASE_DIR = path.join(__dirname, 'public');
const DASHBOARD_PATH = path.join(BASE_DIR, 'dashboard.html');

function refactorDashboard() {
    // Read the file
    let content = fs.readFileSync(DASHBOARD_PATH, 'utf-8');

    // Find and remove the <style>...</style> block
    const styleMatch = content.match(/<style>[\s\S]*?<\/style>/);

    if (styleMatch) {
        console.log(`Found inline CSS block (${styleMatch[0].length} characters)`);

        // Remove the inline style block
        content = content.replace(/<style>[\s\S]*?<\/style>/, '');
        console.log('Removed inline CSS block');
    } else {
        console.log('No inline style block found');
        return;
    }

    // Fix the title encoding issue
    content = content.replace(/Skillify Ã¢â‚¬â€ Ultimate\s*/, 'Skillify — Ultimate Learning Platform');
    content = content.replace(/Skillify â€" Ultimate\s*/, 'Skillify — Ultimate Learning Platform');

    // Add external CSS link and DOMPurify after the viewport meta tag
    const headAdditions = `
  <!-- External CSS -->
  <link rel="stylesheet" href="css/dashboard.css">
  
  <!-- Security: DOMPurify for XSS Protection -->
  <script src="https://cdn.jsdelivr.net/npm/dompurify@3.0.6/dist/purify.min.js"></script>
`;

    // Insert after the title tag
    content = content.replace(
        /<title>Skillify — Ultimate Learning Platform<\/title>/,
        `<title>Skillify — Ultimate Learning Platform</title>\n${headAdditions}`
    );

    // Also try to fix if title wasn't fixed properly
    if (!content.includes('href="css/dashboard.css"')) {
        // Find position after last script tag in head
        content = content.replace(
            /<script src="https:\/\/cdn\.jsdelivr\.net\/npm\/chart\.js"><\/script>/,
            `<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>\n${headAdditions}`
        );
    }

    // Write the modified content back
    fs.writeFileSync(DASHBOARD_PATH, content, 'utf-8');

    console.log('Successfully refactored dashboard.html!');
    console.log('- Removed inline CSS');
    console.log('- Linked external dashboard.css');
    console.log('- Added DOMPurify CDN');
    console.log('- Fixed title encoding');
}

refactorDashboard();
