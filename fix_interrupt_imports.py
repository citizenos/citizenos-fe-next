import re

with open('src/app/shared/components/interrupt-dialog/interrupt-dialog.component.ts', 'r') as f:
    content = f.read()

content = "import { IconComponent } from '../icon/icon.component';\n" + content

# The imports array looks like: imports: [TranslateModule, DialogCloseDirective],
content = re.sub(
    r"imports:\s*\[([^\]]+)\]",
    r"imports: [\1, IconComponent]",
    content
)

with open('src/app/shared/components/interrupt-dialog/interrupt-dialog.component.ts', 'w') as f:
    f.write(content)
