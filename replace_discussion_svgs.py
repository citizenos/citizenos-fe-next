import re

with open('src/app/features/topics/topic-view/components/topic-discussion/topic-discussion.component.html', 'r') as f:
    content = f.read()

replacements = [
    # more-vertical-legacy (2 occurrences)
    (r'<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">\s*<path fill-rule="evenodd" clip-rule="evenodd"\s*d="M14 6C14 4.9 13.1 4 12 4C10.9 4 10 4.9 10 6C10 7.1 10.9 8 12 8C13.1 8 14 7.1 14 6ZM14 18C14 16.9 13.1 16 12 16C10.9 16 10 18C10 18C10 19.1 10.9 20 12 20C13.1 20 14 19.1 14 18ZM12 10C13.1 10 14 10.9 14 12C14 13.1 13.1 14 12 14C10.9 14 10 13.1 10 12C10 10.9 10.9 10 12 10Z"\s*fill="#2C3B47" />\s*</svg>',
     '<cos-icon name="more-vertical-legacy" [size]="24" color="#2C3B47"></cos-icon>'),

    # status-draft
    (r'<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">\s*<path\s*d="M8.8143 4.18517[^"]*"\s*fill="#2C3B47" />\s*</svg>',
     '<cos-icon name="status-draft" [size]="16" color="#2C3B47"></cos-icon>'),

    # deadline-legacy
    (r'<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">\s*<path fill-rule="evenodd" clip-rule="evenodd"\s*d="M8 2C7.44772 2 7 2.44772 7 3V4H6C4.89543 4 4 4.89543 4 6V18C4 19.1046 4.89543 20 6 20H18C19.1046 20 20 19.1046 20 18V6C20 4.89543 19.1046 4 18 4H17V3C17 2.44772 16.5523 2 16 2C15.4477 2 15 2.44772 15 3V4H9V3C9 2.44772 8.55228 2 8 2ZM6 8H18V18H6V8ZM9 6V5H7V6H9ZM17 5V6H15V5H17ZM11.0332 9.55428C11.0152 9.25392 11.2438 9 11.5322 9H12.4678C12.7562 9 12.9848 9.25392 12.9668 9.55428L12.5293 13.5108C12.5128 13.7858 12.2943 14 12.0303 14H11.9697C11.7057 14 11.4872 13.7858 11.4707 13.5108L11.0332 9.55428ZM13 15.9565C13 16.5328 12.5523 17 12 17C11.4477 17 11 16.5328 11 15.9565C11 15.3802 11.4477 14.913 12 14.913C12.5523 14.913 13 15.3802 13 15.9565Z"\s*fill="#2C3B47" />\s*</svg>',
     '<cos-icon name="deadline-legacy" [size]="16" color="#2C3B47"></cos-icon>'),

    # close-circle-legacy
    (r'<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">\s*<circle cx="8" cy="8" r="5.5" fill="#2C3B47" stroke="#2C3B47" />\s*<path d="M11 5L5 11" stroke="white" stroke-width="1.4" />\s*<path d="M5 5L11 11" stroke="white" stroke-width="1.4" />\s*</svg>',
     '<cos-icon name="close-circle-legacy" [size]="16" color="#2C3B47"></cos-icon>'),

    # chevron-down
    (r'<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">\s*<path d="M17 10L12 15L7 10" stroke="#2C3B47" stroke-width="2" stroke-linecap="round" />\s*</svg>',
     '<cos-icon name="chevron-down" [size]="24" color="#2C3B47"></cos-icon>'),

    # plus-legacy
    (r'<svg width="25" height="24" viewBox="0 0 25 24" fill="none" xmlns="http://www.w3.org/2000/svg">\s*<path\s*d="M12.5 20C11.9711 20 11.5423 19.5712 11.5423 19.0423L11.5423 12.9577L5.45775 12.9577C4.9288 12.9577 4.5 12.5289 4.5 12C4.5 11.4711 4.9288 11.0423 5.45775 11.0423H11.5423V4.95775C11.5423 4.4288 11.9711 4 12.5 4C13.0289 4 13.4577 4.4288 13.4577 4.95775L13.4577 11.0423L19.5423 11.0423C20.0712 11.0423 20.5 11.4711 20.5 12C20.5 12.5289 20.0712 12.9577 19.5423 12.9577H13.4577V19.0423C13.4577 19.5712 13.0289 20 12.5 20Z"\s*fill="white" />\s*</svg>',
     '<cos-icon name="plus-legacy" [size]="24" color="white"></cos-icon>'),
]

for pattern, replacement in replacements:
    content = re.sub(pattern, replacement, content)

with open('src/app/features/topics/topic-view/components/topic-discussion/topic-discussion.component.html', 'w') as f:
    f.write(content)
