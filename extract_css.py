
import re
import os

def extract_css(html_file, css_file):
    print(f"Processing {html_file}...")
    try:
        with open(html_file, 'r', encoding='utf-8') as f:
            content = f.read()

        # Find style block
        match = re.search(r'<style>(.*?)</style>', content, re.DOTALL)
        if match:
            css_content = match.group(1).strip()
            
            # Write CSS file
            os.makedirs(os.path.dirname(css_file), exist_ok=True)
            with open(css_file, 'w', encoding='utf-8') as f:
                f.write(css_content)
            
            print(f"  Extracted {len(css_content)} bytes to {css_file}")
            
            # Find line numbers
            start_index = match.start()
            end_index = match.end()
            
            start_line = content[:start_index].count('\n') + 1
            end_line = content[:end_index].count('\n') + 1
            
            print(f"  Style block found from line {start_line} to {end_line}")
            return start_line, end_line
        else:
            print("  No <style> block found.")
            return None, None
    except Exception as e:
        print(f"  Error: {e}")
        return None, None

def main():
    base_dir = r"C:\Users\yousef amr\Desktop\MY PROJECTS\Codes\SKILLIFY"
    
    # Process index.html
    index_html = os.path.join(base_dir, "LOGIN", "index.html")
    index_css = os.path.join(base_dir, "LOGIN", "public", "css", "style.css") # Note: LOGIN/public/css... wait, structure check.
    # User listed: C:\Users\yousef amr\Desktop\MY PROJECTS\Codes\SKILLIFY\public\dashboard.html
    # And: C:\Users\yousef amr\Desktop\MY PROJECTS\Codes\SKILLIFY\LOGIN\index.html
    
    # Let's adjust paths carefully.
    # The 'public' folder is at SKILLIFY/public
    # LOGIN folder is sibling to public?
    # Let's double check structure from previous list_dir.
    
    # Step 129 list_dir SKILLIFY:
    # LOGIN (dir)
    # public (dir)
    
    # So index.html is in SKILLIFY/LOGIN/index.html
    # dashboard.html is in SKILLIFY/public/dashboard.html
    
    # We decided to put CSS in `public/css/`. 
    # For dashboard.html: SKILLIFY/public/css/dashboard.css 
    # For index.html: SKILLIFY/public/css/style.css ? 
    #   Where does index.html look for static files? 
    #   server.js serves '..' (LOGIN dir) and '../../public' (public dir).
    #   So if index.html is in LOGIN/, and we link "css/style.css", it might look in LOGIN/css/style.css
    #   OR if we use /css/style.css, it might hit the public static middleware.
    
    # Let's put BOTH in SKILLIFY/public/css/ to be clean, and serve them from there.
    # server/app.js: app.use(express.static(path.join(__dirname, '../../public')));
    
    print("--- Extracting CSS ---")
    extract_css(os.path.join(base_dir, "LOGIN", "index.html"), os.path.join(base_dir, "public", "css", "style.css"))
    extract_css(os.path.join(base_dir, "public", "dashboard.html"), os.path.join(base_dir, "public", "css", "dashboard.css"))

if __name__ == "__main__":
    main()
