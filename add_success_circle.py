import re

with open('src/app/shared/components/icon/icon.registry.ts', 'r') as f:
    content = f.read()

# Add to IconName
icon_names = "'success-circle-legacy'"
content = re.sub(r"('admin-badge-legacy')", r"\1 | " + icon_names, content)

# Add to ICON_REGISTRY
svgs = """
    ['success-circle-legacy', { viewBox: '0 0 24 24', content: '<rect width="24" height="24" rx="12" fill="currentColor" /><path fill-rule="evenodd" clip-rule="evenodd" d="M18.9849 6.13908C19.2395 6.35122 19.2739 6.72956 19.0617 6.98413L10.0617 17.7841C9.94734 17.9214 9.77773 18.0005 9.59905 18C9.42038 17.9995 9.25123 17.9194 9.13764 17.7814L4.93764 12.6814C4.72699 12.4256 4.76358 12.0475 5.01937 11.8369C5.27517 11.6262 5.6533 11.6628 5.86396 11.9186L9.60353 16.4595L18.1399 6.2159C18.352 5.96134 18.7303 5.92694 18.9849 6.13908Z" fill="white" stroke="white" stroke-linecap="round" stroke-linejoin="round" />' }],
"""

content = re.sub(r"(    \['admin-badge-legacy', \{[^}]*\} \])", r"\1,\n" + svgs, content)

with open('src/app/shared/components/icon/icon.registry.ts', 'w') as f:
    f.write(content)
