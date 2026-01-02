
const fs = require('fs');
const path = require('path');

function extractCss(htmlPath, cssPath) {
    console.log(`Processing ${htmlPath}...`);
    try {
        const content = fs.readFileSync(htmlPath, 'utf8');
        const startTag = '<style>';
        const endTag = '</style>';
        
        const startIndex = content.indexOf(startTag);
        if (startIndex === -1) {
            console.log('  No <style> block found.');
            return;
        }
        
        const endIndex = content.indexOf(endTag, startIndex);
        if (endIndex === -1) {
            console.log('  No </style> closing tag found.');
            return;
        }
        
        const cssContent = content.substring(startIndex + startTag.length, endIndex).trim();
        
        // Ensure dir exists
        fs.mkdirSync(path.dirname(cssPath), { recursive: true });
        fs.writeFileSync(cssPath, cssContent);
        console.log(`  Extracted ${cssContent.length} bytes to ${cssPath}`);
        
        // Calculate line numbers
        const beforeContent = content.substring(0, startIndex);
        const styleBlock = content.substring(startIndex, endIndex + endTag.length);
        
        const startLine = beforeContent.split('\n').length;
        const endLine = startLine + styleBlock.split('\n').length - 1;
        
        console.log(`  Style block range: Line ${startLine} to Line ${endLine}`);
        
    } catch (err) {
        console.error(`  Error: ${err.message}`);
    }
}

const baseDir = path.join(__dirname); // SKILLIFY/
const html1 = path.join(baseDir, 'LOGIN', 'index.html');
const css1 = path.join(baseDir, 'public', 'css', 'style.css');

const html2 = path.join(baseDir, 'public', 'dashboard.html');
const css2 = path.join(baseDir, 'public', 'css', 'dashboard.css');

console.log('--- Extracting CSS ---');
extractCss(html1, css1);
extractCss(html2, css2);
