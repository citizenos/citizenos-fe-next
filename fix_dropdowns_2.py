import re

with open("src/app/features/topics/topic-view/components/topic-ideation/topic-ideation.component.html", "r") as f:
    html = f.read()

# Replace TYPE filter
html = re.sub(
    r'<div class="dropdown" cosDropdown>\s*<div selection class="selection">\s*<div class="selected_item">\s*<div class="label">{{ \'COMPONENTS\.TOPIC_IDEATION\.IDEA_FILTER_TYPE\' \| translate }}</div>(.*?)</div>\s*<cos-icon name="chevron-down"></cos-icon>\s*</div>\s*<div options class="options">(.*?)</div>\s*</div>',
    r'<cos-dropdown [placeholder]="\'COMPONENTS.TOPIC_IDEATION.IDEA_FILTER_TYPE\' | translate">\n<div selection>\1</div>\n<div options>\2</div>\n</cos-dropdown>',
    html,
    flags=re.DOTALL
)

# Replace ORDER filter
html = re.sub(
    r'<div class="dropdown" cosDropdown>\s*<div selection class="selection">\s*<div class="selected_item">\s*<div class="label">{{ \'COMPONENTS\.TOPIC_IDEATION\.IDEA_FILTER_ORDER\' \| translate }}</div>(.*?)</div>\s*<cos-icon name="chevron-down"></cos-icon>\s*</div>\s*<div options class="options">(.*?)</div>\s*</div>',
    r'<cos-dropdown [placeholder]="\'COMPONENTS.TOPIC_IDEATION.IDEA_FILTER_ORDER\' | translate">\n<div selection>\1</div>\n<div options>\2</div>\n</cos-dropdown>',
    html,
    flags=re.DOTALL
)

# Replace PARTICIPANTS filter
html = re.sub(
    r'<div class="dropdown" cosDropdown>\s*<div selection class="selection">\s*<div class="selected_item">\s*<div class="label">{{ \'COMPONENTS\.TOPIC_IDEATION\.IDEA_FILTER_PARTICIPANTS\' \| translate }}</div>(.*?)</div>\s*<cos-icon name="chevron-down"></cos-icon>\s*</div>\s*<div options class="options">(.*?)</div>\s*</div>',
    r'<cos-dropdown [placeholder]="\'COMPONENTS.TOPIC_IDEATION.IDEA_FILTER_PARTICIPANTS\' | translate">\n<div selection>\1</div>\n<div options>\2</div>\n</cos-dropdown>',
    html,
    flags=re.DOTALL
)

# Replace AGE filter (this one has dropdown_selector and multipleChoice)
html = re.sub(
    r'<div class="dropdown dropdown_selector" cosDropdown \[multipleChoice\]="true">\s*<div selection class="selection">\s*<div class="selected_item">\s*<div class="label">{{ \'COMPONENTS\.TOPIC_IDEATION\.IDEA_FILTER_AGE\' \| translate }}</div>(.*?)</div>\s*<cos-icon name="chevron-down"></cos-icon>\s*</div>\s*<div options class="options">(.*?)</div>\s*</div>',
    r'<cos-dropdown [placeholder]="\'COMPONENTS.TOPIC_IDEATION.IDEA_FILTER_AGE\' | translate">\n<div selection>\1</div>\n<div options>\2</div>\n</cos-dropdown>',
    html,
    flags=re.DOTALL
)

# Replace GENDER filter
html = re.sub(
    r'<div class="dropdown" cosDropdown>\s*<div selection class="selection">\s*<div class="selected_item">\s*<div class="label">{{ \'COMPONENTS\.TOPIC_IDEATION\.IDEA_FILTER_GENDER\' \| translate }}</div>(.*?)</div>\s*<cos-icon name="chevron-down"></cos-icon>\s*</div>\s*<div options class="options">(.*?)</div>\s*</div>',
    r'<cos-dropdown [placeholder]="\'COMPONENTS.TOPIC_IDEATION.IDEA_FILTER_GENDER\' | translate">\n<div selection>\1</div>\n<div options>\2</div>\n</cos-dropdown>',
    html,
    flags=re.DOTALL
)

# Replace RESIDENCE filter
html = re.sub(
    r'<div class="dropdown" cosDropdown>\s*<div selection class="selection">\s*<div class="selected_item">\s*<div class="label">{{ \'COMPONENTS\.TOPIC_IDEATION\.IDEA_FILTER_RESIDENCE\' \| translate }}</div>(.*?)</div>\s*<cos-icon name="chevron-down"></cos-icon>\s*</div>\s*<div options class="options">(.*?)</div>\s*</div>',
    r'<cos-dropdown [placeholder]="\'COMPONENTS.TOPIC_IDEATION.IDEA_FILTER_RESIDENCE\' | translate">\n<div selection>\1</div>\n<div options>\2</div>\n</cos-dropdown>',
    html,
    flags=re.DOTALL
)

with open("src/app/features/topics/topic-view/components/topic-ideation/topic-ideation.component.html", "w") as f:
    f.write(html)
print("Regex replace done!")
