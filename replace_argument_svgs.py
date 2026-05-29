import re

with open('src/app/features/topics/topic-view/components/argument/argument.component.html', 'r') as f:
    content = f.read()

replacements = [
    # more-vertical-legacy
    (r'<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">\s*<path fill-rule="evenodd" clip-rule="evenodd"\s*d="M9.33325 4.00033[^"]*"\s*fill="#2C3B47" />\s*</svg>',
     '<cos-icon name="more-vertical-legacy" [size]="16" color="#2C3B47"></cos-icon>'),
    
    # status-draft
    (r'<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">\s*<path\s*d="M8.8143 4.18517[^"]*"\s*fill="#2C3B47" />\s*</svg>',
     '<cos-icon name="status-draft" [size]="16" color="#2C3B47"></cos-icon>'),
     
    # link-legacy
    (r'<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">\s*<path\s*d="M8.99965 11.8837[^"]*"\s*fill="#2C3B47" />\s*</svg>',
     '<cos-icon name="link-legacy" [size]="16" color="#2C3B47"></cos-icon>'),
     
    # report
    (r'<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">\s*<circle cx="8" cy="8" r="5.5" fill="#2C3B47" stroke="#2C3B47" />\s*<path fill-rule="evenodd" clip-rule="evenodd"\s*d="M4.83552 4.12842[^"]*"\s*fill="white" />\s*</svg>',
     '<cos-icon name="report" [size]="16" color="#2C3B47"></cos-icon>'),
     
    # history-legacy
    (r'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">\s*<path\s*d="M0 6C0.521305[^>]*/>\s*<path\s*d="M7.66374 6[^>]*/>\s*<path\s*d="M13.9968 7.75355[^>]*/>\s*<path\s*d="M14.4065 3.30213[^>]*/>\s*</svg>',
     '<cos-icon name="history-legacy" [size]="16" color="#2C3B47"></cos-icon>'),
     
    # trash-draft
    (r'<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">\s*<path fill-rule="evenodd" clip-rule="evenodd"\s*d="M10 3H6V4H10V3ZM11 4V3[^"]*"\s*fill="#2C3B47" />\s*</svg>',
     '<cos-icon name="trash-draft" [size]="16" color="#2C3B47"></cos-icon>'),
     
    # arrow-double-left-legacy
    (r'<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">\s*<path d="M11 11L8 8L11 5" stroke="#2C3B47" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>\s*<path d="M5 11L2 8L5 5" stroke="#2C3B47" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>\s*</svg>',
     '<cos-icon name="arrow-double-left-legacy" [size]="16" color="#2C3B47"></cos-icon>'),
     
    # thumbs-up-filled-legacy
    (r'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">\s*<path fill-rule="evenodd" clip-rule="evenodd"\s*d="M7.57088 1.46709[^"]*"\s*fill="#2C3B47" />\s*</svg>',
     '<cos-icon name="thumbs-up-filled-legacy" [size]="16" color="#2C3B47"></cos-icon>'),
     
    # thumbs-up-legacy
    (r'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">\s*<path\s*d="M8.12835 1.9685[^"]*"\s*stroke="#2C3B47" stroke-width="1.5" />\s*<path d="M4.5 6H2C1.44772 6 1 6.44772 1 7V12.5C1 13.0523 1.44772 13.5 2 13.5H4.5" stroke="#2C3B47"\s*stroke-width="1.5" />\s*</svg>',
     '<cos-icon name="thumbs-up-legacy" [size]="16" color="#2C3B47"></cos-icon>'),
     
    # thumbs-down-filled-legacy
    (r'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">\s*<path fill-rule="evenodd" clip-rule="evenodd"\s*d="M7.92912 13.8337[^"]*"\s*fill="#2C3B47" />\s*</svg>',
     '<cos-icon name="thumbs-down-filled-legacy" [size]="16" color="#2C3B47"></cos-icon>'),
     
    # thumbs-down-legacy
    (r'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">\s*<path\s*d="M7.37165 12.5315[^"]*"\s*stroke="#2C3B47" stroke-width="1.5" />\s*<path d="M11 8.5L13.5 8.5C14.0523 8.5 14.5 8.05228 14.5 7.5L14.5 2C14.5 1.44772 14.0523 1 13.5 1L11 1"\s*stroke="#2C3B47" stroke-width="1.5" />\s*</svg>',
     '<cos-icon name="thumbs-down-legacy" [size]="16" color="#2C3B47"></cos-icon>'),
     
    # close
    (r'<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">\s*<path\s*d="M5.29311 17.2929[^"]*"\s*fill="#2C3B47" />\s*</svg>',
     '<cos-icon name="close" [size]="24" color="#2C3B47"></cos-icon>')
]

for pattern, replacement in replacements:
    content = re.sub(pattern, replacement, content)

with open('src/app/features/topics/topic-view/components/argument/argument.component.html', 'w') as f:
    f.write(content)
