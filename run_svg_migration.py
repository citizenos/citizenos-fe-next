import os
import re

registry_path = 'src/app/shared/components/icon/icon.registry.ts'
icon_component_path = 'src/app/shared/components/icon/icon.component.ts'

with open(registry_path, 'r') as f:
    registry_content = f.read()

existing_icons = {}
matches = re.finditer(r"\['([^']+)',\s*\{\s*viewBox:\s*'([^']+)',\s*content:\s*'([^']+)'\s*\}\]", registry_content)
for m in matches:
    name = m.group(1)
    viewbox = m.group(2)
    content = m.group(3)
    norm_content = re.sub(r'\s+', ' ', content).strip()
    existing_icons[name] = {
        'viewbox': viewbox,
        'content': content,
        'norm_content': norm_content
    }

html_files = []
for root, dirs, files in os.walk('src/app'):
    for file in files:
        if file.endswith('.html'):
            html_files.append(os.path.join(root, file))

svg_pattern = re.compile(r'<svg([^>]*)>(.*?)</svg>', re.DOTALL | re.IGNORECASE)

new_icons_to_add = {}
files_modified = 0

for f in html_files:
    with open(f, 'r') as file:
        content = file.read()
    
    matches = list(svg_pattern.finditer(content))
    replacements = []
    
    for match in matches:
        full_tag = match.group(0)
        attrs = match.group(1)
        inner = match.group(2)
        
        width_m = re.search(r'width="(\d+)"', attrs)
        height_m = re.search(r'height="(\d+)"', attrs)
        width = int(width_m.group(1)) if width_m else 0
        height = int(height_m.group(1)) if height_m else 0
        
        if width > 48 or height > 48 or 'width="100%"' in attrs or 'height="100%"' in attrs:
            continue
            
        if '<image' in inner or 'base64' in inner or '<pattern' in inner:
            continue
            
        if '{{' in inner or '}}' in inner or '*ngIf' in inner or '@if' in inner or '@for' in inner or '[ngClass]' in inner or '[class.' in inner:
            continue
            
        if width == 40 and height == 40 and '<rect' in inner and 'rx="20"' in inner:
            continue
            
        viewbox_m = re.search(r'viewBox="([^"]+)"', attrs)
        viewbox = viewbox_m.group(1) if viewbox_m else "0 0 24 24"
        
        class_m = re.search(r'class="([^"]+)"', attrs)
        classes = class_m.group(1) if class_m else ""
        
        angular_class_m = re.search(r'\[class\.([^\]]+)\]="([^"]+)"', attrs)
        ang_classes = ""
        if angular_class_m:
             ang_classes = f' [class.{angular_class_m.group(1)}]="{angular_class_m.group(2)}"'
        
        norm_inner = re.sub(r'\s+', ' ', inner).strip()
        norm_inner = norm_inner.replace('"', "'")
        
        matched_icon_name = None
        for name, data in existing_icons.items():
            if data['viewbox'] == viewbox and data['norm_content'].replace('"', "'") == norm_inner:
                matched_icon_name = name
                break
                
        if not matched_icon_name:
            for name, dict_inner in new_icons_to_add.items():
                if dict_inner['viewbox'] == viewbox and dict_inner['norm_content'].replace('"', "'") == norm_inner:
                    matched_icon_name = name
                    break
                    
        if not matched_icon_name:
            basename = os.path.basename(f).replace('.component.html', '').replace('-dialog', '')
            base_icon_name = f"{basename}-icon-legacy"
            
            counter = 1
            matched_icon_name = base_icon_name
            while matched_icon_name in existing_icons or matched_icon_name in new_icons_to_add:
                counter += 1
                matched_icon_name = f"{basename}-icon-{counter}-legacy"
                
            new_icons_to_add[matched_icon_name] = {
                'viewbox': viewbox,
                'content': inner.strip().replace("\n", " "),
                'norm_content': norm_inner
            }
        
        class_str = f' class="{classes}"' if classes else ''
        width_str = str(width) if width else "24"
        replacement = f'<cos-icon name="{matched_icon_name}" size="{width_str}"{class_str}{ang_classes}></cos-icon>'
        replacements.append((full_tag, replacement))
        
    if replacements:
        new_content = content
        for old, new in replacements:
            new_content = new_content.replace(old, new)
            
        with open(f, 'w') as file:
            file.write(new_content)
        files_modified += 1
        
        ts_file = f.replace('.html', '.ts')
        if os.path.exists(ts_file):
            with open(ts_file, 'r') as tf:
                ts_content = tf.read()
                
            # Check if IconComponent is already imported
            if 'IconComponent' not in ts_content:
                dir_path = os.path.dirname(ts_file)
                rel_path = os.path.relpath(icon_component_path, dir_path)
                if rel_path.endswith('.ts'):
                    rel_path = rel_path[:-3]
                if not rel_path.startswith('.'):
                    rel_path = './' + rel_path
                    
                import_stmt = f"import {{ IconComponent }} from '{rel_path}';\n"
                ts_content = import_stmt + ts_content
                
            # Use regex to specifically target the @Component({ imports: [ ... ] }) block
            component_decorator_match = re.search(r'(@Component\s*\(\s*\{.*?imports:\s*\[)([^\]]+)(\])', ts_content, re.DOTALL)
            if component_decorator_match:
                prefix = component_decorator_match.group(1)
                imports_array = component_decorator_match.group(2)
                suffix = component_decorator_match.group(3)
                
                if 'IconComponent' not in imports_array:
                    imports_array = imports_array.rstrip()
                    if imports_array.endswith(','):
                        imports_array += ' IconComponent,'
                    else:
                        imports_array += ', IconComponent'
                        
                    new_ts_content = ts_content[:component_decorator_match.start()] + prefix + imports_array + suffix + ts_content[component_decorator_match.end():]
                    
                    with open(ts_file, 'w') as tf:
                        tf.write(new_ts_content)

print(f"Files modified: {files_modified}")
print(f"New icons added: {len(new_icons_to_add)}")

if new_icons_to_add:
    icon_name_match = re.search(r"export type IconName = ([^;]+);", registry_content)
    if icon_name_match:
        existing_types = icon_name_match.group(1)
        new_types = " | ".join([f"'{name}'" for name in new_icons_to_add.keys()])
        updated_types = f"{existing_types} | {new_types}"
        registry_content = registry_content.replace(existing_types, updated_types)
        
    # Replace \n  ]);
    map_end_match = re.search(r"(\n\s+\]\);\s*getIcon)", registry_content)
    if map_end_match:
        insert_str = ","
        for name, data in new_icons_to_add.items():
            content = data['content'].replace("'", '"')
            insert_str += f"\n    ['{name}', {{ viewBox: '{data['viewbox']}', content: '{content}' }}],"
        # Remove the last comma
        insert_str = insert_str.rstrip(',')
            
        registry_content = registry_content.replace(map_end_match.group(1), insert_str + map_end_match.group(1))
        
    with open(registry_path, 'w') as f:
        f.write(registry_content)
        
    print("Updated icon.registry.ts")
