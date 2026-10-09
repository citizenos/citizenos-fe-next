import re

with open('src/app/features/dashboard/dashboard.component.html', 'r') as f:
    content = f.read()

# Replace variables
content = content.replace('groups$ | async', 'myGroups()')
content = content.replace('topics$ | async', 'myTopics()')
content = content.replace('publicgroups$ | async', 'publicGroups()')
content = content.replace('publictopics$ | async', 'publicTopics()')
content = content.replace('news$ | async', 'newsItems()')

# *ngIf with multiple conditions
# *ngIf="mygroups.length > 0 && (publicGroups()) as groups;" -> @if(mygroups.length > 0) { ... }
# We can just manually fix this or use a simple regex for most *ngIf
# Actually, Angular 22 provides a migration tool. Let's run it!
