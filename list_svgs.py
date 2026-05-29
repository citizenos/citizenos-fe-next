import os
import re

html_files = []
for root, dirs, files in os.walk('src/app'):
    for file in files:
        if file.endswith('.html'):
            html_files.append(os.path.join(root, file))

results = []
for f in html_files:
    with open(f, 'r') as file:
        content = file.read()
        if '<svg' in content:
            # Check if all <svg> in this file are large "illustrations"
            # we can just print the <svg ...> tag to see its width/height
            svg_tags = re.findall(r'<svg[^>]+>', content)
            results.append((f, svg_tags))

count = 0
for f, tags in results:
    non_exempt = [t for t in tags if 'width="96"' not in t and 'height="96"' not in t and 'width="240"' not in t and 'width="158"' not in t and 'width="80"' not in t]
    if non_exempt:
        print(f"File: {f}")
        for t in non_exempt:
            print(f"  {t}")
        count += 1
print(f"Total files with non-exempt SVGs: {count}")
