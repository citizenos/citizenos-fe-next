with open('src/app/features/home/home.component.ts', 'r') as f:
    text = f.read()

text = text.replace("import { TranslateModule } from '@ngx-translate/core';", "import { TranslateModule } from '@ngx-translate/core';\nimport { IconComponent } from '../../shared/components/icon/icon.component';")
text = text.replace("imports: [TranslateModule, CommonModule, RouterLink, ", "imports: [TranslateModule, CommonModule, RouterLink, IconComponent, ")

with open('src/app/features/home/home.component.ts', 'w') as f:
    f.write(text)
