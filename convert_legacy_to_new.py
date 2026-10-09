import re

with open('src/app/features/dashboard/dashboard.component.html.legacy', 'r') as f:
    html = f.read()

# Replace async pipes
html = html.replace('groups$ | async as groups;', 'myGroups() as groups;')
html = html.replace('groups$ | async as groups', 'myGroups() as groups')
html = html.replace('mygroups.length > 0 && (publicgroups$ | async) as groups;', 'myGroups().length > 0 && publicGroups() as groups')
html = html.replace('publicgroups$ | async as groups;', 'publicGroups() as groups')
html = html.replace('publictopics$ | async as topics;', 'publicTopics() as topics')
html = html.replace('topics$ | async as topics', 'myTopics() as topics')
html = html.replace('news$ | async as news; defer', 'newsItems() as news; defer')
html = html.replace('groups.length > 0', 'groups.length > 0')

# Convert structural directives to new control flow using simple replacements where possible.
# Actually, since the template is just 854 lines, let me just install node 22 to do the control flow migration!
