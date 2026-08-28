import re

files = [
    'src/app/features/topics/topic-view/components/argument/argument.component.scss',
    'src/app/features/topics/topic-view/components/argument-reply/argument-reply.component.scss'
]

for file_path in files:
    with open(file_path, 'r') as f:
        content = f.read()
    
    # Remove the bad :host at the top
    content = content.replace(":host {\n  display: contents;\n}\n\n", "")
    
    # Add it after @use "mixins";
    content = content.replace('@use "mixins";', '@use "mixins";\n\n:host {\n  display: contents;\n}')
    
    with open(file_path, 'w') as f:
        f.write(content)

