import re

files = [
    'src/app/features/topics/topic-view/components/topic-vote-sign-esteid/topic-vote-sign-esteid.component.ts',
    'src/app/features/topics/topic-view/components/topic-vote-sign-smartid/topic-vote-sign-smartid.component.ts'
]

for file in files:
    with open(file, 'r') as f:
        content = f.read()

    content = "import { IconComponent } from '../../../../shared/components/icon/icon.component';\n" + content

    content = re.sub(
        r"imports:\s*\[([^\]]+)\]",
        r"imports: [\1, IconComponent]",
        content
    )

    with open(file, 'w') as f:
        f.write(content)
