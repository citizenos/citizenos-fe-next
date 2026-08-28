import re

file_path = 'src/app/features/topics/topic-view/components/topic-discussion/topic-discussion.component.html'
with open(file_path, 'r') as f:
    content = f.read()

content = content.replace(' | uppercase', '')

with open(file_path, 'w') as f:
    f.write(content)

