import re

with open("src/app/features/topics/topic-view/components/topic-ideation/topic-ideation.component.html", "r") as f:
    content = f.read()

# Fix the raw SVG in the edit folder option
content = re.sub(
    r'<button type="button" class="option" \(click\)="editFolder\(folder\)".*?<\/svg>\s*<span>\{\{\s*\'CONTROL\.EDIT\'',
    r'<button type="button" class="option" (click)="editFolder(folder)">\n                                        <cos-icon name="edit"></cos-icon>\n                                        <span>{{ \'CONTROL.EDIT\'',
    content, flags=re.DOTALL
)
content = content.replace("\\'", "'")

with open("src/app/features/topics/topic-view/components/topic-ideation/topic-ideation.component.html", "w") as f:
    f.write(content)

