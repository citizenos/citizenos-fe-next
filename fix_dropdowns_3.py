import re

with open("src/app/features/topics/topic-view/components/topic-ideation/topic-ideation.component.html", "r") as f:
    lines = f.readlines()

new_lines = []
skip = False

for line in lines:
    if '<div class="dropdown" cosDropdown>' in line or '<div class="dropdown dropdown_selector" cosDropdown [multipleChoice]="true">' in line:
        line = line.replace('<div class="dropdown" cosDropdown>', '<cos-dropdown>')
        line = line.replace('<div class="dropdown dropdown_selector" cosDropdown [multipleChoice]="true">', '<cos-dropdown>')
    elif '<div selection class="selection">' in line:
        line = line.replace('<div selection class="selection">', '<div selection>')
    elif '<div options class="options">' in line:
        line = line.replace('<div options class="options">', '<div options>')
    elif '<div class="label">{{ \'COMPONENTS.TOPIC_IDEATION.' in line:
        # Extract translation key
        m = re.search(r"{{ '(.*?)' \| translate }}", line)
        key = m.group(1) if m else "COMPONENTS.TOPIC_IDEATION.FILTER"
        # Instead of replacing, we will drop this line entirely! But we need to add placeholder to cos-dropdown.
        # So we modify the LAST cos-dropdown we pushed.
        for i in range(len(new_lines)-1, -1, -1):
            if '<cos-dropdown>' in new_lines[i]:
                new_lines[i] = new_lines[i].replace('<cos-dropdown>', f'<cos-dropdown [placeholder]="\'{key}\' | translate">')
                break
        continue  # skip this line
    elif '<cos-icon name="chevron-down"></cos-icon>' in line:
        continue  # skip this line
    elif '</cos-dropdown>' not in line and '<!-- ' not in line:
        # Check if we are closing a cos-dropdown. We just need to replace the closing </div> of the dropdown.
        # But this is tricky. Let's just find the closing </div> of the dropdown manually or just rely on indentation.
        # The dropdown closes when indentation returns to the same level? 
        pass
    
    new_lines.append(line)

with open("src/app/features/topics/topic-view/components/topic-ideation/topic-ideation.component.html", "w") as f:
    f.writelines(new_lines)

