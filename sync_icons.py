import re

with open('src/app/shared/components/icon/icon.registry.ts', 'r') as f:
    content = f.read()

# Extract all names from ICON_REGISTRY
# It looks like: ['icon-name', { ... }]
matches = re.findall(r"\['([^']+)'", content)

# Check which ones are not in IconName
# IconName definition ends with ;
icon_name_match = re.search(r"export type IconName = ([^;]+);", content)
icon_names_str = icon_name_match.group(1)
icon_names = [n.strip().strip("'") for n in icon_names_str.split('|')]

missing = set(matches) - set(icon_names)
print("Missing in IconName:", missing)

if missing:
    # Add them to IconName
    new_icon_names = icon_names_str + " | '" + "' | '".join(missing) + "'"
    content = content.replace(icon_names_str, new_icon_names)
    with open('src/app/shared/components/icon/icon.registry.ts', 'w') as f:
        f.write(content)
