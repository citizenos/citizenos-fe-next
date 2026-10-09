import re

with open('src/app/features/dashboard/dashboard.component.html', 'r') as f:
    text = f.read()

# Replace async pipes
text = text.replace('groups$ | async as groups;', 'myGroups() as groups;')
text = text.replace('groups$ | async as groups', 'myGroups() as groups')
text = text.replace('groups$ | async as mygroups', 'myGroups() as mygroups')
text = text.replace('mygroups.length > 0 && (publicgroups$ | async) as groups;', 'myGroups().length > 0 && publicGroups() as groups;')
text = text.replace('publicgroups$ | async as groups;', 'publicGroups() as groups;')
text = text.replace('publictopics$ | async as topics;', 'publicTopics() as topics;')
text = text.replace('topics$ | async as topics', 'myTopics() as topics')
text = text.replace('news$ | async as news; defer', 'newsItems() as news')
text = text.replace('news$ | async as news', 'newsItems() as news')
text = text.replace('showNoEngagements()', 'hasNoEngagements()')
text = text.replace('showCreateMenu()', 'toggleCreate()')

# Manual ngIf for those tricky ng-containers
text = re.sub(r'<ng-container \*ngIf="wWidth\(\) <= 1024 && wWidth\(\) > 560">(.*?)</ng-container>', r'@if (wWidth() <= 1024 && wWidth() > 560) {\1}', text, flags=re.DOTALL)
text = re.sub(r'<ng-container \*ngIf="wWidth\(\) > 1024 \|\| wWidth\(\) <= 560">(.*?)</ng-container>', r'@if (wWidth() > 1024 || wWidth() <= 560) {\1}', text, flags=re.DOTALL)

with open('src/app/features/dashboard/dashboard.component.html', 'w') as f:
    f.write(text)
