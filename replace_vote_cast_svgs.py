import re

with open('src/app/features/topics/topic-view/components/topic-vote-cast/topic-vote-cast.component.html', 'r') as f:
    content = f.read()

replacements = [
    # vote-delegated-legacy
    (r'<svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">\s*<rect width="40" height="40" rx="20" fill="#5AB467" />\s*<path\s*d="M26.3432 15.9229[^"]*"\s*fill="white" />\s*<path d="M17.9282 29L28 18.9113L26.5929 17.5018L17.9352 26.174L13.4071 21.6524L12 23.0618L17.9282 29Z"\s*fill="white" />\s*</svg>',
     '<cos-icon name="vote-delegated-legacy" [size]="40" color="#5AB467"></cos-icon>'),
]

for pattern, replacement in replacements:
    content = re.sub(pattern, replacement, content)

with open('src/app/features/topics/topic-view/components/topic-vote-cast/topic-vote-cast.component.html', 'w') as f:
    f.write(content)
