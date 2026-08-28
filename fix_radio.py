import re

file_path = 'src/app/features/topics/topic-view/components/post-argument-form/post-argument-form.component.scss'
with open(file_path, 'r') as f:
    content = f.read()

# Replace the checked state
content = re.sub(
    r'\.radio_box input:checked ~ \.radio \{\s*background-color: var\(--color-primary\);\s*border-color: var\(--color-primary\);',
    '.radio_box input:checked ~ .radio {\n    background-color: var(--input-checkbox-background-default);\n    border-color: var(--input-checkbox-border-default);',
    content
)

# Add the hover state before the checked state
hover_state = """
  .radio_box:hover input ~ .radio {
    background-color: var(--input-checkbox-background-default);
    border-color: var(--input-checkbox-border-default);
  }

"""
content = content.replace(".radio_box input:checked ~ .radio {", hover_state + "  .radio_box input:checked ~ .radio {")

with open(file_path, 'w') as f:
    f.write(content)

