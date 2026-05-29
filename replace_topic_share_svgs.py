import re

with open('src/app/features/topics/topic-view/components/topic-share/topic-share.component.html', 'r') as f:
    content = f.read()

replacements = [
    # success-circle-legacy
    (r'<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">\s*<rect width="24" height="24" rx="12" fill="#5AB467" />\s*<path fill-rule="evenodd" clip-rule="evenodd"\s*d="M18.9849 6.13908[^"]*"\s*fill="white" stroke="white" stroke-linecap="round" stroke-linejoin="round" />\s*</svg>',
     '<cos-icon name="success-circle-legacy" [size]="24" color="#5AB467"></cos-icon>'),
]

for pattern, replacement in replacements:
    content = re.sub(pattern, replacement, content)

with open('src/app/features/topics/topic-view/components/topic-share/topic-share.component.html', 'w') as f:
    f.write(content)
