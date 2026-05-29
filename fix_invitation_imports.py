import re

with open('src/app/shared/components/invitation-dialog/invitation-dialog.component.ts', 'r') as f:
    content = f.read()

# The imports array looks like: imports: [TranslateModule, DialogCloseDirective, InitialsComponent, NotificationComponent, UpperCasePipe, A11yModule],
content = re.sub(
    r"imports:\s*\[([^\]]+)\]",
    r"imports: [\1, IconComponent]",
    content
)

with open('src/app/shared/components/invitation-dialog/invitation-dialog.component.ts', 'w') as f:
    f.write(content)
