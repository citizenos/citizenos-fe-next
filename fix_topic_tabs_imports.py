import re

with open('src/app/features/topics/topic-view/components/topic-tabs/topic-tabs.component.ts', 'r') as f:
    content = f.read()

if 'IconComponent' not in content:
    content = "import { IconComponent } from '../../../../../shared/components/icon/icon.component';\n" + content
    content = re.sub(
        r"imports:\s*\[([^\]]+)\]",
        r"imports: [\1, IconComponent]",
        content
    )

    with open('src/app/features/topics/topic-view/components/topic-tabs/topic-tabs.component.ts', 'w') as f:
        f.write(content)
