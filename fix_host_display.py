import re

file_path = 'src/app/features/topics/topic-view/components/argument/argument.component.scss'
with open(file_path, 'r') as f:
    content = f.read()

# Add :host { display: contents; } at the top
content = ":host {\n  display: contents;\n}\n\n" + content

with open(file_path, 'w') as f:
    f.write(content)

