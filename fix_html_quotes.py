with open("src/app/features/topics/topic-view/components/topic-ideation/topic-ideation.component.html", "r") as f:
    content = f.read()

content = content.replace("\\'", "'")

with open("src/app/features/topics/topic-view/components/topic-ideation/topic-ideation.component.html", "w") as f:
    f.write(content)
