import re

with open('src/app/features/dashboard/dashboard.component.html', 'r') as f:
    text = f.read()

# 1. Structural directives replacements that Angular CLI didn't handle well
text = text.replace('*ngIf="groups$ | async as groups;"', '*ngIf="myGroups() as groups;"')
text = text.replace('*ngIf="groups$ | async as groups"', '*ngIf="myGroups() as groups"')
text = text.replace('*ngIf="groups$ | async as mygroups"', '*ngIf="myGroups() as mygroups"')
text = text.replace('*ngIf="mygroups.length > 0 && (publicgroups$ | async) as groups;"', '*ngIf="mygroups.length > 0 && publicGroups() as groups;"')
text = text.replace('*ngIf="publicgroups$ | async as groups;"', '*ngIf="publicGroups() as groups;"')
text = text.replace('*ngIf="publictopics$ | async as topics;"', '*ngIf="publicTopics() as topics;"')
text = text.replace('*ngIf="topics$ | async as topics"', '*ngIf="myTopics() as topics"')
text = text.replace('*ngIf="news$ | async as news; defer"', '*ngIf="newsItems() as news"')
text = text.replace('*ngIf="news[i].imageUrl"', '*ngIf="news[i].imageUrl"')

text = text.replace('showNoEngagements()', 'hasNoEngagements()')
text = text.replace('showCreateMenu()', 'toggleCreate()')

# 2. Components mapping
text = text.replace('<topicbox', '<cos-topic-card')
text = text.replace('</topicbox>', '</cos-topic-card>')
text = text.replace('<group-box', '<cos-group-card')
text = text.replace('</group-box>', '</cos-group-card>')
text = text.replace('<public-group-box', '<cos-group-card mode="public"')
text = text.replace('</public-group-box>', '</cos-group-card>')
text = text.replace('<page-header', '<app-page-list-header')
text = text.replace('</page-header>', '</app-page-list-header>')
text = text.replace('[TourItem]', '[cosTourItem]')

# 3. ngClass removals from cos-topic-card
text = text.replace('[ngClass]="topic.categories"', '')

# Fix `<ng-container *ngIf="wWidth() ...">` -> `@if (...) {`
text = re.sub(r'<ng-container \*ngIf="wWidth\(\) <= 1024 && wWidth\(\) > 560">(.*?)</ng-container>', r'@if (wWidth() <= 1024 && wWidth() > 560) {\1}', text, flags=re.DOTALL)
text = re.sub(r'<ng-container \*ngIf="wWidth\(\) > 1024 \|\| wWidth\(\) <= 560">(.*?)</ng-container>', r'@if (wWidth() > 1024 || wWidth() <= 560) {\1}', text, flags=re.DOTALL)

with open('src/app/features/dashboard/dashboard.component.html', 'w') as f:
    f.write(text)
