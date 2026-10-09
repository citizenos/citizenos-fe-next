import re

with open("src/app/features/topics/topic-view/components/topic-ideation/topic-ideation.component.ts", "r") as f:
    content = f.read()

content = re.sub(r'  canEditDeadline\(\) \{.*?\n  \}', '', content, flags=re.DOTALL)
content = re.sub(r'  closeIdeation\(\) \{.*?\n  \}', '', content, flags=re.DOTALL)
content = re.sub(r'  exportIdeas\(\) \{.*?\n  \}', '', content, flags=re.DOTALL)
content = re.sub(r'  editDeadline\(\) \{.*?\n  \}', '', content, flags=re.DOTALL)

with open("src/app/features/topics/topic-view/components/topic-ideation/topic-ideation.component.ts", "w") as f:
    f.write(content)
