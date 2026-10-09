import re

with open('/home/ilmar/citizenos/citizenos-fe/src/assets/styles/_buttons_new.scss', 'r') as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if '%btn_big ' in line or '%btn_big,' in line or '%btn_big{' in line:
        print(f"Start %btn_big at {i}")
        for j in range(i, min(i + 20, len(lines))):
            print(lines[j], end='')
        break
print('---')
for i, line in enumerate(lines):
    if ' $sections: ' in line:
        print(f"Start sections at {i}")
        for j in range(i, min(i + 30, len(lines))):
            print(lines[j], end='')
        break
