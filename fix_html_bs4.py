import re

with open('src/app/features/dashboard/dashboard.component.html.legacy', 'r') as f:
    html = f.read()

# I will use a simple regex approach since it's just a few lines.
# For *ngIf
# find <div *ngIf="..."> ... </div>
# Actually it's easier to just do it manually with sed or a python script that iterates line by line.

html = html.replace('groups$ | async as groups;', 'myGroups() as groups')
html = html.replace('groups$ | async as groups', 'myGroups() as groups')
html = html.replace('groups$ | async as mygroups', 'myGroups() as mygroups')
html = html.replace('mygroups.length > 0 && (publicgroups$ | async) as groups;', 'myGroups().length > 0 && publicGroups() as groups')
html = html.replace('publicgroups$ | async as groups;', 'publicGroups() as groups')
html = html.replace('publictopics$ | async as topics;', 'publicTopics() as topics')
html = html.replace('topics$ | async as topics', 'myTopics() as topics')
html = html.replace('news$ | async as news; defer', 'newsItems() as news')
html = html.replace('news$ | async as news', 'newsItems() as news')

# Let's save the intermediate
with open('src/app/features/dashboard/dashboard.component.html', 'w') as f:
    f.write(html)
