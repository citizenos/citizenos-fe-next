import re

with open('src/app/features/topics/public-topics/public-topics.component.html', 'r') as f:
    html = f.read()

html = html.replace('[cosDropdown]', 'cosDropdown')

with open('src/app/features/topics/public-topics/public-topics.component.html', 'w') as f:
    f.write(html)
