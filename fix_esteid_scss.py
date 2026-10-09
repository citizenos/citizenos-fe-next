import re

with open('src/app/features/topics/topic-view/components/topic-vote-sign-esteid/topic-vote-sign-esteid.component.scss', 'r') as f:
    content = f.read()

# Increase specificity for .checkmark and .checkbox
content = content.replace('.checkmark {', '.checkbox .checkmark {')
content = content.replace('.checkmark::after {', '.checkbox .checkmark::after {')

with open('src/app/features/topics/topic-view/components/topic-vote-sign-esteid/topic-vote-sign-esteid.component.scss', 'w') as f:
    f.write(content)

with open('src/app/features/topics/topic-view/components/topic-vote-sign-smartid/topic-vote-sign-smartid.component.scss', 'r') as f:
    content = f.read()

# Increase specificity for .checkmark and .checkbox
content = content.replace('.checkmark {', '.checkbox .checkmark {')
content = content.replace('.checkmark::after {', '.checkbox .checkmark::after {')

with open('src/app/features/topics/topic-view/components/topic-vote-sign-smartid/topic-vote-sign-smartid.component.scss', 'w') as f:
    f.write(content)
