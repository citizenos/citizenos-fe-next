import os
import re

html_files = []
for root, dirs, files in os.walk('src'):
    for file in files:
        if file.endswith('.html'):
            html_files.append(os.path.join(root, file))

for html_file in html_files:
    with open(html_file, 'r') as f:
        html_content = f.read()
    
    if '<cos-icon' in html_content:
        ts_file = html_file.replace('.html', '.ts')
        if os.path.exists(ts_file):
            with open(ts_file, 'r') as f:
                ts_content = f.read()
            
            if 'IconComponent' not in ts_content:
                # Need to add import
                print(f"Fixing {ts_file}")
                # Figure out path to icon.component
                depth = ts_file.count('/') - 1
                prefix = '../' * (depth - 3) if depth > 3 else '' # adjust this
                
                # A simpler way is to just do a global replace or insert at top
                # Actually, let's just use the absolute path or relative
                # src/app/shared/components/icon/icon.component
                rel_path = '../' * (ts_file.count('/') - 1) + 'src/app/shared/components/icon/icon.component'
                # but we are in src... wait, if ts_file is src/app/features/...
                # count from src:
                # src/app/a/b.ts -> 3 slashes, needs ../../
                parts = ts_file.split('/')
                depth_from_src = len(parts) - 1
                up = '../' * (depth_from_src - 1) # if src/a/b.ts (depth=2), needs ../
                
                import_path = up + 'app/shared/components/icon/icon.component'
                if import_path.startswith('../app/'):
                    # if we go up to src, it's just 'src/app' -> actually better to just go to app/shared
                    pass
                
                ts_content = f"import {{ IconComponent }} from '{import_path}';\n" + ts_content
                ts_content = re.sub(
                    r"imports:\s*\[([^\]]+)\]",
                    r"imports: [\1, IconComponent]",
                    ts_content
                )
                with open(ts_file, 'w') as f:
                    f.write(ts_content)
