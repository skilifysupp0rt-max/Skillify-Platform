/**
 * Script to update all course HTML files with the new video system
 */

const fs = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, 'public');
const webDevDir = path.join(publicDir, 'web dev');
const workSkillsDir = path.join(publicDir, 'Work Skills');

// Files to update
const courseFiles = [
    path.join(webDevDir, 'web.html'),
    path.join(webDevDir, 'ai.html'),
    path.join(webDevDir, 'design.html'),
    path.join(webDevDir, 'game.html'),
    path.join(webDevDir, 'management.html'),
    path.join(webDevDir, 'pan.html'),
    path.join(workSkillsDir, 'cv.html')
];

// Script tags to add before </head>
const scriptsToAdd = `
    <!-- Video Learning System -->
    <script src="/js/courseData.js"></script>
    <script src="/js/videoSystem.js"></script>
`;

// Update each file
courseFiles.forEach(filePath => {
    if (!fs.existsSync(filePath)) {
        console.log(`⚠️ File not found: ${filePath}`);
        return;
    }

    let content = fs.readFileSync(filePath, 'utf-8');

    // Add scripts if not already present
    if (!content.includes('videoSystem.js')) {
        content = content.replace('</head>', scriptsToAdd + '</head>');
        console.log(`✅ Added video system scripts to ${path.basename(filePath)}`);
    }

    // Update playVideo calls to use new system
    content = content.replace(
        /onclick="app\.playVideo\('([^']*)', '([^']*)'\)"/g,
        'onclick="videoSystem.playVideo(\'$1\', \'$2\', this.closest(\'.card\'))" data-video-id="$1"'
    );

    // Update quiz button to show quiz for specific video
    content = content.replace(
        /onclick="app\.openQuiz\('([^']*)'\)"/g,
        'onclick="videoSystem.openQuiz(\'$1\', this)"'
    );

    fs.writeFileSync(filePath, content, 'utf-8');
    console.log(`✅ Updated ${path.basename(filePath)}`);
});

console.log('\n🎉 All course files updated with video system!');
console.log('\n📝 Changes made:');
console.log('   - Added videoSystem.js and courseData.js scripts');
console.log('   - Updated playVideo calls to use new system');
console.log('   - Added data-video-id attributes to cards');
console.log('\n⚠️ Restart the server to apply backend changes!');
