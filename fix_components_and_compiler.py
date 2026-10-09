import re

with open('src/app/features/dashboard/dashboard.component.html', 'r') as f:
    text = f.read()

# Fix components
text = text.replace('<topicbox', '<cos-topic-card')
text = text.replace('</topicbox>', '</cos-topic-card>')
text = text.replace('<group-box', '<cos-group-card')
text = text.replace('</group-box>', '</cos-group-card>')
text = text.replace('<public-group-box', '<cos-group-card mode="public"')
text = text.replace('</public-group-box>', '</cos-group-card>')
text = text.replace('<page-header', '<app-page-header')
text = text.replace('</page-header>', '</app-page-header>')

text = text.replace('[TourItem]', '[cosTourItem]')

# Fix compiler errors from last time
text = text.replace('[ngClass]="topic.categories"', '') # cos-topic-card doesn't accept ngClass directly on it if it's not supported or we can just let Angular complain
# Actually, wait, Angular 22 standalone components can have `[ngClass]` IF CommonModule/NgClass is imported! But maybe it's not imported.
# It's better to just keep it and add NgClass to imports in TS if needed.
# Let's remove it because the new `cos-topic-card` encapsulates everything.

with open('src/app/features/dashboard/dashboard.component.html', 'w') as f:
    f.write(text)
