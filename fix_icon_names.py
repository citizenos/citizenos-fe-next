import re

with open('src/app/shared/components/icon/icon.registry.ts', 'r') as f:
    content = f.read()

# Add missing icon names to IconName
missing = [
    'error-circle-legacy', 'trash-lines-legacy', 'close-legacy', 'admin-badge-legacy',
    'success-circle-legacy', 'deadline-legacy', 'close-circle-legacy', 'warning-legacy',
    'vote-delegated-legacy'
]

replacement = "'folder-add-legacy' | '" + "' | '".join(missing) + "';"
content = re.sub(r"'folder-add-legacy';", replacement, content)

# Check if they are in ICON_REGISTRY
with open('src/app/shared/components/icon/icon.registry.ts', 'w') as f:
    f.write(content)
