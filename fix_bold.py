import re

# Fix global dropdown
file_path = 'src/app/shared/components/dropdown/dropdown.component.ts'
with open(file_path, 'r') as f:
    content = f.read()

content = content.replace('font-weight: 600;', 'font-weight: 400;')

with open(file_path, 'w') as f:
    f.write(content)


# Fix mobile dropdown filters
file_path = 'src/app/features/topics/topic-view/components/topic-discussion/topic-discussion.component.scss'
with open(file_path, 'r') as f:
    content = f.read()

replacement = """    .selected_item {
      font-size: 13px;
    }"""
content = re.sub(r'    \.selected_item \{[\s\S]*?    \}', replacement, content)

with open(file_path, 'w') as f:
    f.write(content)

