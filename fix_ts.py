with open('src/app/features/dashboard/dashboard.component.ts', 'r') as f:
    text = f.read()

if 'NgClass' not in text:
    text = text.replace("import { DatePipe, isPlatformBrowser } from '@angular/common';", "import { DatePipe, isPlatformBrowser, NgClass } from '@angular/common';")
    text = text.replace("imports: [RouterLink, DatePipe,", "imports: [RouterLink, DatePipe, NgClass,")

with open('src/app/features/dashboard/dashboard.component.ts', 'w') as f:
    f.write(text)
