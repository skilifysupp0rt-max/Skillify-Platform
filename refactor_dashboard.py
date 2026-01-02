"""
SKILLIFY CSS Refactor Script
This script safely removes inline CSS from dashboard.html and links external CSS
"""

import os
import re

# Paths
BASE_DIR = r"c:\Users\yousef amr\Desktop\MY PROJECTS\Codes\SKILLIFY\public"
DASHBOARD_PATH = os.path.join(BASE_DIR, "dashboard.html")

def refactor_dashboard():
    # Read the file
    with open(DASHBOARD_PATH, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Find and remove the <style>...</style> block
    # The style block starts after line 14 and ends before </head>
    pattern = r'<style>.*?</style>'
    
    # Check if style tag exists
    match = re.search(pattern, content, re.DOTALL)
    if match:
        print(f"Found inline CSS block ({len(match.group())} characters)")
        
        # Remove the inline style block
        content = re.sub(pattern, '', content, count=1, flags=re.DOTALL)
        print("Removed inline CSS block")
    else:
        print("No inline style block found")
        return
    
    # Fix the title encoding issue
    content = content.replace('Skillify Ã¢â‚¬â€ Ultimate', 'Skillify — Ultimate Learning Platform')
    
    # Add external CSS link and DOMPurify after the meta tags
    # Find the position after viewport meta tag
    head_additions = '''
  <!-- External CSS -->
  <link rel="stylesheet" href="css/dashboard.css">
  
  <!-- Security: DOMPurify for XSS Protection -->
  <script src="https://cdn.jsdelivr.net/npm/dompurify@3.0.6/dist/purify.min.js"></script>
'''
    
    # Insert after the title tag
    content = content.replace(
        '<title>Skillify — Ultimate Learning Platform</title>',
        '<title>Skillify — Ultimate Learning Platform</title>\n' + head_additions
    )
    
    # Write the modified content back
    with open(DASHBOARD_PATH, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print("Successfully refactored dashboard.html!")
    print("- Removed inline CSS")
    print("- Linked external dashboard.css")
    print("- Added DOMPurify CDN")
    print("- Fixed title encoding")

if __name__ == "__main__":
    refactor_dashboard()
