import re

with open('src/styles.scss', 'r') as f:
    content = f.read()

# Add to .dialog_header
header_repl = """    &.delete { background-color: var(--color-error-background); color: var(--color-danger); }
    &.ideation { background-color: var(--color-dialog-ideation); color: var(--color-text-main); }
    &.voting { background-color: var(--color-argument-pro-light); color: var(--color-success); }
    &.follow_up { background-color: var(--color-dialog-follow-up); color: var(--color-dialog-follow-up-text); }"""
content = re.sub(r'&\.delete \{ background-color: var\(--color-error-background\); color: var\(--color-danger\); \}', header_repl, content)

# Add to .dialog_tabs_wrap
tabs_repl = """  .dialog_tabs_wrap {
    width: 100%;
    display: flex;
    padding: 0 16px;
    gap: 8px;
    background-color: var(--color-dialog);
    
    &.voting { background-color: var(--color-argument-pro-light); }
    &.follow_up { background-color: var(--color-dialog-follow-up); }"""
content = re.sub(r'\.dialog_tabs_wrap \{\n    width: 100%;\n    display: flex;\n    padding: 0 16px;\n    gap: 8px;\n    background-color: var\(--color-dialog\);', tabs_repl, content)

# Add to .dialog_footer
footer_repl = """  .dialog_footer {
    display: flex;
    background-color: var(--color-dialog);
    &.error { background-color: var(--color-error-background); }
    &.warning { background-color: var(--color-warn-background); }
    &.info { background-color: var(--color-info-background); }
    &.voting { background-color: var(--color-argument-pro-light); }
    &.follow_up { background-color: var(--color-dialog-follow-up); }"""
content = re.sub(r'\.dialog_footer \{\n    display: flex;\n    background-color: var\(--color-dialog\);', footer_repl, content)

with open('src/styles.scss', 'w') as f:
    f.write(content)
