import re

with open("src/app/features/topics/topic-view/components/topic-ideation/topic-ideation.component.html", "r") as f:
    content = f.read()

# I need to change <cos-icon name="edit"></cos-icon> to <cos-icon name="edit" size="16"></cos-icon>
# and <cos-icon name="download"></cos-icon> to <cos-icon name="download" size="16"></cos-icon>
# and <cos-icon name="check-box"></cos-icon> to <cos-icon name="check-box" size="16"></cos-icon>
# Note: They are inside the .options block inside the setting_button dropdown.

# Let's target the exact string matches since they are unique enough.
content = content.replace('<cos-icon name="edit"></cos-icon>', '<cos-icon name="edit" size="16"></cos-icon>')
content = content.replace('<cos-icon name="download"></cos-icon>', '<cos-icon name="download" size="16"></cos-icon>')
content = content.replace('<cos-icon name="check-box"></cos-icon>', '<cos-icon name="check-box" size="16"></cos-icon>')

with open("src/app/features/topics/topic-view/components/topic-ideation/topic-ideation.component.html", "w") as f:
    f.write(content)
