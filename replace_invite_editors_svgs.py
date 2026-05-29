import re

with open('src/app/features/topics/topic-view/components/invite-editors/invite-editors.component.html', 'r') as f:
    content = f.read()

replacements = [
    # error-circle-legacy (lines 60-65)
    (r'<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">\s*<rect width="24" height="24" rx="12" fill="#EF4025" />\s*<path\s*d="M16.3753 6.77535[^"]*"\s*fill="white" stroke="white" stroke-linecap="round" />\s*</svg>',
     '<cos-icon name="error-circle-legacy" [size]="24"></cos-icon>'),

    # trash-lines-legacy (lines 78-84)
    (r'<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">\s*<path d="M6 6.00065H7.33333L7.33333 11.334H6L6 6.00065Z" fill="#2C3B47" />\s*<path d="M10 6.00065H8.66667L8.66667 11.334H10L10 6.00065Z" fill="#2C3B47" />\s*<path fill-rule="evenodd" clip-rule="evenodd"\s*d="M11.3333 3.33398[^"]*"\s*fill="#2C3B47" />\s*</svg>',
     '<cos-icon name="trash-lines-legacy" [size]="16" color="#2C3B47"></cos-icon>'),

    # chevron-down (lines 162-164) - note: it has stroke="#727C84" stroke-width="2" which matches default chevron-down almost perfectly
    (r'<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">\s*<path d="M17 10L12 15L7 10" stroke="#727C84" stroke-width="2" stroke-linecap="round" />\s*</svg>',
     '<cos-icon name="chevron-down" [size]="24" color="#727C84"></cos-icon>'),

    # trash-lines-legacy (lines 177-183)
    (r'<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">\s*<path d="M6 6.00065H7.33333L7.33333 11.334H6L6 6.00065Z" fill="#2C3B47" />\s*<path d="M10 6.00065H8.66667L8.66667 11.334H10L10 6.00065Z" fill="#2C3B47" />\s*<path fill-rule="evenodd" clip-rule="evenodd"\s*d="M11.3333 3.33398[^"]*"\s*fill="#2C3B47" />\s*</svg>',
     '<cos-icon name="trash-lines-legacy" [size]="16" color="#2C3B47"></cos-icon>'),

    # settings-legacy (lines 193-197)
    (r'<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">\s*<path\s*d="M19.1552 13.2702[^"]*"\s*fill="#1168A8" />\s*</svg>',
     '<cos-icon name="settings-legacy" [size]="24" color="#1168A8"></cos-icon>'),

    # close-legacy (lines 205-209)
    (r'<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">\s*<path\s*d="M5.29314 17.2929[^"]*"\s*fill="#2C3B47" />\s*</svg>',
     '<cos-icon name="close-legacy" [size]="24" color="#2C3B47"></cos-icon>'),

    # admin-badge-legacy (lines 215-219)
    (r'<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">\s*<path\s*d="M5.66347 6.9425[^"]*"\s*fill="#2C3B47" />\s*</svg>',
     '<cos-icon name="admin-badge-legacy" [size]="16" color="#2C3B47"></cos-icon>'),

    # trash-draft (lines 227-231)
    (r'<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">\s*<path fill-rule="evenodd" clip-rule="evenodd"\s*d="M10 3H6V4H10V3ZM11 4V3[^"]*"\s*fill="#EF4025" />\s*</svg>',
     '<cos-icon name="trash-draft" [size]="16" color="#EF4025"></cos-icon>'),
]

for pattern, replacement in replacements:
    content = re.sub(pattern, replacement, content)

with open('src/app/features/topics/topic-view/components/invite-editors/invite-editors.component.html', 'w') as f:
    f.write(content)
