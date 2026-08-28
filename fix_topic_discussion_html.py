import re

file_path = 'src/app/features/topics/topic-view/components/topic-discussion/topic-discussion.component.html'
with open(file_path, 'r') as f:
    content = f.read()

# Remove `| translate` from getActiveTypeFilterText() and getActiveOrderFilterText()
content = content.replace('getActiveTypeFilterText() | translate | uppercase', 'getActiveTypeFilterText() | uppercase')
content = content.replace('getActiveOrderFilterText() | translate | uppercase', 'getActiveOrderFilterText() | uppercase')

# Add the placeholder translation keys if they don't exist?
# Actually, the user said "placeholder ... on osalt katki".
# Let's see what the placeholder is right now:
# [placeholder]="'COMPONENTS.TOPIC_ARGUMENTS.FILTER_TYPE' | translate"
# Since it doesn't exist, we should use 'LNK_FILTER' or just add 'FILTER_TYPE' to en.json/et.json.
# Wait, I will just add FILTER_TYPE and FILTER_ORDER_BY to both json files.

with open(file_path, 'w') as f:
    f.write(content)

