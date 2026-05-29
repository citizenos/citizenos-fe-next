import re

with open('src/app/features/topics/topic-view/components/topic-tabs/topic-tabs.component.html', 'r') as f:
    content = f.read()

replacements = [
    # favourite
    (r'<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">\s*<path\s*d="M12.4961 16.1318[^"]*"\s*stroke="#2C3B47" stroke-width="2" />\s*</svg>',
     '<cos-icon name="favourite" [size]="24" color="#2C3B47"></cos-icon>'),

    # favourite-filled
    (r'<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">\s*<path\s*d="M12.5812 15.1863[^"]*"\s*fill="#2C3B47" stroke="#2C3B47" stroke-width="2" />\s*</svg>',
     '<cos-icon name="favourite-filled" [size]="24" color="#2C3B47"></cos-icon>'),
]

for pattern, replacement in replacements:
    content = re.sub(pattern, replacement, content)

with open('src/app/features/topics/topic-view/components/topic-tabs/topic-tabs.component.html', 'w') as f:
    f.write(content)
