import re

with open("src/app/features/topics/topic-view/components/topic-ideation/topic-ideation.component.html", "r") as f:
    content = f.read()

# Change calendar icon for Edit deadline to edit
content = re.sub(
    r'<div class="icon_wrap">\s*<cos-icon name="calendar"><\/cos-icon>\s*<\/div>\s*<span>\{\{\s*\(ideation\(\)\.deadline \? \'COMPONENTS\.TOPIC_IDEATION\.OPT_EDIT_DEADLINE\' : \'COMPONENTS\.TOPIC_IDEATION\.OPT_ADD_DEADLINE\'\)\s*\|\s*translate\s*\}\}<\/span>',
    r'<div class="icon_wrap">\n                  <cos-icon name="edit"></cos-icon>\n                </div>\n                <span>{{ (ideation().deadline ? \'COMPONENTS.TOPIC_IDEATION.OPT_EDIT_DEADLINE\' : \'COMPONENTS.TOPIC_IDEATION.OPT_ADD_DEADLINE\') | translate }}</span>',
    content, flags=re.DOTALL
)

# Change lock icon for Close ideation to check-box
content = re.sub(
    r'<div class="icon_wrap">\s*<cos-icon name="lock"><\/cos-icon>\s*<\/div>\s*<span>\{\{\s*\'COMPONENTS\.TOPIC_IDEATION\.OPT_CLOSE_IDEATION\'\s*\|\s*translate\s*\}\}<\/span>',
    r'<div class="icon_wrap">\n                  <cos-icon name="check-box"></cos-icon>\n                </div>\n                <span>{{ \'COMPONENTS.TOPIC_IDEATION.OPT_CLOSE_IDEATION\' | translate }}</span>',
    content, flags=re.DOTALL
)

# Should I remove "Edit ideation"?
# The user's screenshot ONLY has: Edit deadline, End idea gathering.
# Let's remove "Edit ideation" since it's already in the main topic menu.
content = re.sub(
    r'<a class="option"[^>]*>\s*<div class="icon_wrap">\s*<cos-icon name="edit"><\/cos-icon>\s*<\/div>\s*<span>\{\{\s*\'COMPONENTS\.TOPIC_IDEATION\.OPT_EDIT_IDEATION\'\s*\|\s*translate\s*\}\}<\/span>\s*<\/a>\s*',
    r'',
    content, flags=re.DOTALL
)

with open("src/app/features/topics/topic-view/components/topic-ideation/topic-ideation.component.html", "w") as f:
    f.write(content)

