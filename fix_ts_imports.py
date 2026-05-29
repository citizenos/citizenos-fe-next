import os
import re

html_files = []
for root, dirs, files in os.walk('src/app'):
    for file in files:
        if file.endswith('.html'):
            html_files.append(os.path.join(root, file))

icon_component_path = 'src/app/shared/components/icon/icon.component.ts'

for f in html_files:
    with open(f, 'r') as file:
        content = file.read()
    
    if '<cos-icon' in content:
        ts_file = f.replace('.html', '.ts')
        if os.path.exists(ts_file):
            with open(ts_file, 'r') as tf:
                ts_content = tf.read()
            
            modified = False
            
            # Check if exact IconComponent is imported
            if not re.search(r'\bIconComponent\b', ts_content):
                dir_path = os.path.dirname(ts_file)
                rel_path = os.path.relpath(icon_component_path, dir_path)
                if rel_path.endswith('.ts'):
                    rel_path = rel_path[:-3]
                if not rel_path.startswith('.'):
                    rel_path = './' + rel_path
                    
                import_stmt = f"import {{ IconComponent }} from '{rel_path}';\n"
                ts_content = import_stmt + ts_content
                modified = True
                
            # Check if exact IconComponent is in imports array
            component_decorator_match = re.search(r'(@Component\s*\(\s*\{.*?imports:\s*\[)([^\]]+)(\])', ts_content, re.DOTALL)
            if component_decorator_match:
                prefix = component_decorator_match.group(1)
                imports_array = component_decorator_match.group(2)
                suffix = component_decorator_match.group(3)
                
                if not re.search(r'\bIconComponent\b', imports_array):
                    imports_array = imports_array.rstrip()
                    if imports_array.endswith(','):
                        imports_array += ' IconComponent,'
                    else:
                        imports_array += ', IconComponent'
                        
                    ts_content = ts_content[:component_decorator_match.start()] + prefix + imports_array + suffix + ts_content[component_decorator_match.end():]
                    modified = True
                    
            if modified:
                with open(ts_file, 'w') as tf:
                    tf.write(ts_content)
                print(f"Fixed imports for {ts_file}")

