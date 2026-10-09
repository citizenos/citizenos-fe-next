import re

with open('src/styles.scss', 'r') as f:
    content = f.read()

btn_plain = """
.btn_big_plain {
  @extend %btn-big-base;
  background: transparent;
  border: none;
  color: var(--color-text-main);
  padding: 8px 16px;
  justify-content: flex-start;

  &:hover {
    background: var(--color-blue-100);
  }
}
"""

# Insert right after .btn_big_submit_ghost block
content = re.sub(r'(\.btn_big_submit_ghost \{[\s\S]*?\n\})', r'\1\n' + btn_plain, content)

with open('src/styles.scss', 'w') as f:
    f.write(content)
