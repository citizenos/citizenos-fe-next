import re
with open('src/app/features/dashboard/dashboard.component.html', 'r') as f:
    text = f.read()

# Let's see what *ngIf we have
import subprocess
out = subprocess.check_output(['grep', '-o', r'\*ngIf="[^"]*"', 'src/app/features/dashboard/dashboard.component.html'], text=True)
print(set(out.splitlines()))

out2 = subprocess.check_output(['grep', '-o', r'\*ngFor="[^"]*"', 'src/app/features/dashboard/dashboard.component.html'], text=True)
print(set(out2.splitlines()))
