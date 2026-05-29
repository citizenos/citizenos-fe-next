import os
import re

html_files = []
for root, dirs, files in os.walk('src/app'):
    for file in files:
        if file.endswith('.html'):
            html_files.append(os.path.join(root, file))

svg_pattern = re.compile(r'<svg([^>]*)>(.*?)</svg>', re.DOTALL | re.IGNORECASE)

extracted_icons = {}
file_replacements = {}

for f in html_files:
    with open(f, 'r') as file:
        content = file.read()
    
    matches = svg_pattern.finditer(content)
    replacements = []
    
    for match in matches:
        full_tag = match.group(0)
        attrs = match.group(1)
        inner = match.group(2)
        
        # Check exemption
        if any(size in attrs for size in ['width="96"', 'height="96"', 'width="240"', 'width="158"', 'width="80"', 'width="40"', 'height="40"', 'width="160"', 'width="266"']):
            continue
        if '<image' in inner or 'base64' in inner:
            continue
            
        # extract width for size
        width_m = re.search(r'width="(\d+)"', attrs)
        height_m = re.search(r'height="(\d+)"', attrs)
        viewbox_m = re.search(r'viewBox="([^"]+)"', attrs)
        class_m = re.search(r'class="([^"]+)"', attrs)
        
        width = width_m.group(1) if width_m else ""
        viewbox = viewbox_m.group(1) if viewbox_m else "0 0 24 24"
        classes = class_m.group(1) if class_m else ""
        
        # normalize inner content to use as dict key
        norm_inner = re.sub(r'\s+', ' ', inner).strip()
        
        # Try to find a match in extracted_icons
        icon_name = None
        for name, data in extracted_icons.items():
            if data['norm_inner'] == norm_inner and data['viewbox'] == viewbox:
                icon_name = name
                break
                
        if not icon_name:
            basename = os.path.basename(f).replace('.component.html', '')
            icon_name = f"{basename}-icon-{len(extracted_icons)+1}-legacy"
            extracted_icons[icon_name] = {
                'viewbox': viewbox,
                'inner': inner,
                'norm_inner': norm_inner
            }
            
        # formulate replacement
        class_str = f' class="{classes}"' if classes else ''
        replacement = f'<cos-icon name="{icon_name}" size="{width}"{class_str}></cos-icon>'
        replacements.append((full_tag, replacement))
        
    if replacements:
        file_replacements[f] = replacements

# Now just print a summary to see what we found
print(f"Found {len(extracted_icons)} unique icons to extract.")
for name, data in extracted_icons.items():
    print(f"Icon: {name}, viewBox: {data['viewbox']}")
    
