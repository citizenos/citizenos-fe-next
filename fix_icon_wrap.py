import re

with open("src/app/features/topics/topic-view/components/topic-ideation/topic-ideation.component.html", "r") as f:
    content = f.read()

# Replace <div class="icon_wrap"> \n <cos-icon ...> </cos-icon> \n </div>
# with just the <cos-icon>
content = re.sub(
    r'<div class="icon_wrap">\s*(<cos-icon.*?</cos-icon>)\s*<\/div>',
    r'\1',
    content, flags=re.DOTALL
)

with open("src/app/features/topics/topic-view/components/topic-ideation/topic-ideation.component.html", "w") as f:
    f.write(content)

