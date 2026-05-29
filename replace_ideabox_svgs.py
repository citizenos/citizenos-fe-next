import re

with open('src/app/features/topics/topic-view/components/ideabox/ideabox.component.html', 'r') as f:
    content = f.read()

replacements = [
    # idea-like-legacy
    (r'<svg width="17" height="17" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg">\s*<mask id="path-1-inside-1_12557_36360_header"[^>]*>\s*<path fill-rule="evenodd" clip-rule="evenodd" d="M4.5 8.23052[^"]*"\s*/>\s*</mask>\s*<path d="M11.3421 14.1109[^"]*"\s*fill="#2C3B47"\s*/>\s*<rect x="9" y="0.5" width="2" height="1" rx="0.5" transform="rotate\(90 9 0.5\)" fill="#2C3B47"\s*/>\s*<path d="M8.5 5C9.97794[^"]*"\s*fill="#2C3B47"\s*/>\s*<path d="M5.5 8.23052[^"]*"\s*fill="#2C3B47"\s*/>\s*</svg>',
     '<cos-icon name="idea-like-legacy" [size]="17" color="#2C3B47"></cos-icon>'),

    # idea-like-active-legacy
    (r'<svg width="16" height="17" viewBox="0 0 16 17" fill="none" xmlns="http://www.w3.org/2000/svg">\s*<path fill-rule="evenodd" clip-rule="evenodd" d="M8 0.5C8.27614[^"]*"\s*fill="#E4B722"\s*/>\s*</svg>',
     '<cos-icon name="idea-like-active-legacy" [size]="16" color="#E4B722"></cos-icon>'),

    # favourite-legacy (outline)
    (r'<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">\s*<path d="M8.33541 12.3292[^"]*"\s*stroke="#2C3B47" stroke-width="1.5"\s*/>\s*</svg>',
     '<cos-icon name="favourite-legacy" [size]="16" color="#2C3B47"></cos-icon>'),

    # favourite-filled-legacy (filled)
    (r'<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">\s*<path d="M8.33541 12.3292[^"]*"\s*fill="#2C3B47" stroke="#2C3B47" stroke-width="1.5"\s*/>\s*</svg>',
     '<cos-icon name="favourite-filled-legacy" [size]="16" color="#2C3B47"></cos-icon>'),
     
    # status-draft (line 73)
    (r'<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">\s*<path d="M8.8143 4.18517[^"]*"\s*fill="#727C84"\s*/>\s*</svg>',
     '<cos-icon name="status-draft" [size]="16" color="#727C84"></cos-icon>'),
     
    # more-vertical-legacy (line 85)
    (r'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">\s*<path fill-rule="evenodd" clip-rule="evenodd" d="M9.33301 4.0013[^"]*"\s*fill="#2C3B47"\s*/>\s*</svg>',
     '<cos-icon name="more-vertical-legacy" [size]="16" color="#2C3B47"></cos-icon>'),

    # favourite-legacy (outline) (line 93)
    (r'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">\s*<path d="M8.33541 12.3292[^"]*"\s*fill="#2C3B47" stroke="#2C3B47" stroke-width="1.5"\s*/>\s*</svg>',
     '<cos-icon name="favourite-filled-legacy" [size]="16" color="#2C3B47"></cos-icon>'), # wait line 93 is favourite-legacy but it says fill="#2C3B47" stroke="#2C3B47", so it's favourite-filled-legacy!
     
    # folder-add-legacy (line 102)
    (r'<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">\s*<path d="M2.05 13C1.77 13[^"]*"\s*fill="#2C3B47"\s*/>\s*</svg>',
     '<cos-icon name="folder-add-legacy" [size]="16" color="#2C3B47"></cos-icon>'),
     
    # status-draft (line 113)
    (r'<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">\s*<path d="M8.8143 4.18517[^"]*"\s*fill="#2C3B47"\s*/>\s*</svg>',
     '<cos-icon name="status-draft" [size]="16" color="#2C3B47"></cos-icon>'),

    # report (line 123)
    (r'<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">\s*<circle cx="8" cy="8" r="5.5" fill="#2C3B47" stroke="#2C3B47"\s*/>\s*<path fill-rule="evenodd" clip-rule="evenodd" d="M4.83552 4.12842[^"]*"\s*fill="white"\s*/>\s*</svg>',
     '<cos-icon name="report" [size]="16" color="#2C3B47"></cos-icon>'),
     
    # trash-draft (line 142)
    (r'<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">\s*<path fill-rule="evenodd" clip-rule="evenodd" d="M10 3H6V4H10V3ZM11 4V3[^"]*"\s*fill="#2C3B47"\s*/>\s*</svg>',
     '<cos-icon name="trash-draft" [size]="16" color="#2C3B47"></cos-icon>'),
]

for pattern, replacement in replacements:
    content = re.sub(pattern, replacement, content)

with open('src/app/features/topics/topic-view/components/ideabox/ideabox.component.html', 'w') as f:
    f.write(content)
