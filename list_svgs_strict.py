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
            svg_tags = re.findall(r'<svg[^>]+>', content)
            results.append((f, svg_tags))

count = 0
for f, tags in results:
    non_exempt = []
    for t in tags:
        # exempt sizes
        if any(size in t for size in ['width="96"', 'height="96"', 'width="240"', 'width="158"', 'width="80"', 'width="40"', 'height="40"', 'width="160"', 'width="266"']):
            continue
        non_exempt.append(t)
        
    if non_exempt:
        print(f"File: {f}")
        for t in non_exempt:
            print(f"  {t}")
        count += 1
print(f"Total files with non-exempt SVGs: {count}")
