import re

with open('src/app/shared/components/icon/icon.registry.ts', 'r') as f:
    content = f.read()

# Add to IconName
icon_names = "'deadline-legacy' | 'close-circle-legacy'"
content = re.sub(r"('success-circle-legacy')", r"\1 | " + icon_names, content)

# Add to ICON_REGISTRY
svgs = """
    ['deadline-legacy', { viewBox: '0 0 24 24', content: '<path fill-rule="evenodd" clip-rule="evenodd" d="M8 2C7.44772 2 7 2.44772 7 3V4H6C4.89543 4 4 4.89543 4 6V18C4 19.1046 4.89543 20 6 20H18C19.1046 20 20 19.1046 20 18V6C20 4.89543 19.1046 4 18 4H17V3C17 2.44772 16.5523 2 16 2C15.4477 2 15 2.44772 15 3V4H9V3C9 2.44772 8.55228 2 8 2ZM6 8H18V18H6V8ZM9 6V5H7V6H9ZM17 5V6H15V5H17ZM11.0332 9.55428C11.0152 9.25392 11.2438 9 11.5322 9H12.4678C12.7562 9 12.9848 9.25392 12.9668 9.55428L12.5293 13.5108C12.5128 13.7858 12.2943 14 12.0303 14H11.9697C11.7057 14 11.4872 13.7858 11.4707 13.5108L11.0332 9.55428ZM13 15.9565C13 16.5328 12.5523 17 12 17C11.4477 17 11 16.5328 11 15.9565C11 15.3802 11.4477 14.913 12 14.913C12.5523 14.913 13 15.3802 13 15.9565Z" fill="currentColor" />' }],
    ['close-circle-legacy', { viewBox: '0 0 16 16', content: '<circle cx="8" cy="8" r="5.5" fill="currentColor" /><path d="M11 5L5 11" stroke="white" stroke-width="1.4" /><path d="M5 5L11 11" stroke="white" stroke-width="1.4" />' }],
"""

content = re.sub(r"(    \['success-circle-legacy', \{[^}]*\} \])", r"\1,\n" + svgs, content)

with open('src/app/shared/components/icon/icon.registry.ts', 'w') as f:
    f.write(content)
