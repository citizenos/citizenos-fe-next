import re

file_path = 'src/styles.scss'
with open(file_path, 'r') as f:
    content = f.read()

replacement = """%btn-big-base {
  gap: 8px;
  max-height: 48px;
  min-height: 48px;
  min-width: 48px;
  padding: 8px 24px;
  border-radius: 48px;
  font-weight: 600;
  font-size: 16px;
  line-height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.2s ease-in-out, color 0.2s ease-in-out, border-color 0.2s ease-in-out;

  &.icon {
    padding: 0;
    width: 48px;
  }
}"""

content = content.replace("""%btn-big-base {
  gap: 8px;
  max-height: 48px;
  min-height: 48px;
  min-width: 48px;
  padding: 8px 24px;
  border-radius: 48px;
  font-weight: 600;
  font-size: 16px;
  line-height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.2s ease-in-out, color 0.2s ease-in-out, border-color 0.2s ease-in-out;
}""", replacement)

with open(file_path, 'w') as f:
    f.write(content)

