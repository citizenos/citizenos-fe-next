import re

html_path = 'src/app/features/topics/topic-view/components/topic-discussion/topic-discussion.component.html'
with open(html_path, 'r') as f:
    html_content = f.read()

html_content = html_content.replace('<span class="bold">', '<span>')

with open(html_path, 'w') as f:
    f.write(html_content)

