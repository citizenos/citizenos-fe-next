import re

with open("src/app/features/topics/topic-view/components/topic-ideation/topic-ideation.component.html", "r") as f:
    content = f.read()

# Replace Edit Ideation SVG
content = re.sub(
    r'<div class="icon_wrap">\s*<svg[^>]*>.*?<\/svg>\s*<\/div>\s*<span>\{\{\s*\'COMPONENTS\.TOPIC_IDEATION\.OPT_EDIT_IDEATION\'',
    r'<div class="icon_wrap">\n                  <cos-icon name="edit"></cos-icon>\n                </div>\n                <span>{{ \'COMPONENTS.TOPIC_IDEATION.OPT_EDIT_IDEATION\'',
    content, flags=re.DOTALL
)

# Replace Download Ideas SVG
content = re.sub(
    r'<div class="icon_wrap">\s*<svg[^>]*>.*?<\/svg>\s*<\/div>\s*<span>\{\{\s*\'COMPONENTS\.TOPIC_IDEATION\.OPT_DOWNLOAD_IDEAS\'',
    r'<div class="icon_wrap">\n                  <cos-icon name="download"></cos-icon>\n                </div>\n                <span>{{ \'COMPONENTS.TOPIC_IDEATION.OPT_DOWNLOAD_IDEAS\'',
    content, flags=re.DOTALL
)

# Replace Close Ideation SVG
content = re.sub(
    r'<div class="icon_wrap">\s*<svg[^>]*>.*?<\/svg>\s*<\/div>\s*<span>\{\{\s*\'COMPONENTS\.TOPIC_IDEATION\.OPT_CLOSE_IDEATION\'',
    r'<div class="icon_wrap">\n                  <cos-icon name="lock"></cos-icon>\n                </div>\n                <span>{{ \'COMPONENTS.TOPIC_IDEATION.OPT_CLOSE_IDEATION\'',
    content, flags=re.DOTALL
)

# In the new Platform 2.0 design, a typical "Manage" button in headers is a standard light button.
# Let's use `<cos-button trigger variant="light" [iconMode]="true" customIconSize="24" icon="more-vertical-legacy">` ?
# The user explicitly called it "manage nupp". If it says "Manage idea gathering", it should not be icon-only on desktop.
# Let's change the raw button to cos-button.
content = re.sub(
    r'<button type="button" class="btn_medium_close mobile_hidden" trigger>\s*<cos-icon name="more-vertical"><\/cos-icon>\s*<span>\{\{\s*\'COMPONENTS\.TOPIC_IDEATION\.BTN_IDEATION_ACTIONS\'\s*\|\s*translate\s*\}\}<\/span>\s*<\/button>\s*<button type="button" id="mobile_actions" class="btn_medium_close icon mobile_show" trigger>\s*<cos-icon name="more-vertical"><\/cos-icon>\s*<\/button>',
    r'<cos-button trigger variant="light" icon="more-vertical" class="mobile_hidden">{{ \'COMPONENTS.TOPIC_IDEATION.BTN_IDEATION_ACTIONS\' | translate }}</cos-button>\n          <cos-button trigger variant="light" [iconMode]="true" customIconSize="24" icon="more-vertical" class="mobile_show" id="mobile_actions"></cos-button>',
    content, flags=re.DOTALL
)

with open("src/app/features/topics/topic-view/components/topic-ideation/topic-ideation.component.html", "w") as f:
    f.write(content)
