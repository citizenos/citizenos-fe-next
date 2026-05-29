import re

replacements = [
    (r'<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">\s*<path fill-rule="evenodd" clip-rule="evenodd"\s*d="M8.89438 1.78863[^"]*"\s*fill="#EF4025" />\s*</svg>',
     '<cos-icon name="warning-legacy" [size]="16" color="#EF4025"></cos-icon>'),
]

files = [
    'src/app/features/topics/topic-view/components/topic-vote-sign-esteid/topic-vote-sign-esteid.component.html',
    'src/app/features/topics/topic-view/components/topic-vote-sign-smartid/topic-vote-sign-smartid.component.html'
]

for file in files:
    with open(file, 'r') as f:
        content = f.read()

    for pattern, replacement in replacements:
        content = re.sub(pattern, replacement, content)

    with open(file, 'w') as f:
        f.write(content)
