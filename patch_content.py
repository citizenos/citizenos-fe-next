import re

with open('src/styles.scss', 'r') as f:
    content = f.read()

# Add padding: 16px to .dialog_content
content = re.sub(r'(\.dialog_content \{\n    width: 100%;\n    display: flex;\n    flex-direction: column;\n    background-color: var\(--color-dialog-background\);)', r'\1\n    padding: 16px;', content)

with open('src/styles.scss', 'w') as f:
    f.write(content)
