import re

with open('src/styles.scss', 'r') as f:
    content = f.read()

# Replace .dialog_wrap position: absolute etc.
repl = """.dialog_wrap {
  display: flex;
  align-items: center;
  flex-direction: column;
  gap: 32px;
  width: 100%;
  justify-content: center;"""
content = re.sub(r'\.dialog_wrap \{\n  display: flex;\n  align-items: center;\n  flex-direction: column;\n  gap: 32px;\n  position: absolute;\n  padding: 0 0 40px 0;\n  top: 0;\n  left: 0;\n  width: 100%;\n  min-height: 100%;\n  justify-content: center;', repl, content)

with open('src/styles.scss', 'w') as f:
    f.write(content)
