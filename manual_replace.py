import re

with open('src/app/features/dashboard/dashboard.component.html', 'r') as f:
    text = f.read()

text = re.sub(r'<ng-container \*ngIf="wWidth\(\) <= 1024 && wWidth\(\) > 560">(.*?)</ng-container>', r'@if (wWidth() <= 1024 && wWidth() > 560) {\1}', text, flags=re.DOTALL)
text = re.sub(r'<ng-container \*ngIf="wWidth\(\) > 1024 \|\| wWidth\(\) <= 560">(.*?)</ng-container>', r'@if (wWidth() > 1024 || wWidth() <= 560) {\1}', text, flags=re.DOTALL)

with open('src/app/features/dashboard/dashboard.component.html', 'w') as f:
    f.write(text)
