import os
import re

for root, dirs, files in os.walk('src'):
    for file in files:
        if file.endswith('.ts'):
            path = os.path.join(root, file)
            with open(path, 'r') as f:
                content = f.read()
            if ', IconComponent' in content:
                # Look for  , , IconComponent or something
                if re.search(r",\s*,\s*IconComponent", content):
                    content = re.sub(r",\s*,\s*IconComponent", r", IconComponent", content)
                    with open(path, 'w') as f:
                        f.write(content)
                        print(f"Fixed {path}")
