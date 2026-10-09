import re

with open("src/app/features/topics/topic-view/components/topic-ideation/topic-ideation.component.scss", "r") as f:
    scss = f.read()

# Remove the `.setting_button { ... }` block entirely because mobile_hidden/mobile_show handles it, and we don't need custom border-radius now that we use cos-button.
scss = re.sub(r'\s*\.setting_button \{[^}]+\}[^}]+\}', '', scss, flags=re.DOTALL)

with open("src/app/features/topics/topic-view/components/topic-ideation/topic-ideation.component.scss", "w") as f:
    f.write(scss)
