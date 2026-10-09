import re

with open('src/app/features/dashboard/dashboard.component.html', 'r') as f:
    text = f.read()

text = text.replace('<topicbox', '<cos-topic-card')
text = text.replace('</topicbox>', '</cos-topic-card>')

text = text.replace('<group-box', '<cos-group-card')
text = text.replace('</group-box>', '</cos-group-card>')

text = text.replace('<public-group-box [group]="group"', '<cos-group-card [group]="group" mode="public"')
text = text.replace('</public-group-box>', '</cos-group-card>')

text = text.replace('[TourItem]', '[cosTourItem]')

# For `@if (true; defer) {`
text = text.replace('@if (true; defer) {', '@defer (on viewport) {')

with open('src/app/features/dashboard/dashboard.component.html', 'w') as f:
    f.write(text)
