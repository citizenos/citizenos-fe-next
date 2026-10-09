import re

with open('src/app/features/home/home.component.html', 'r') as f:
    html = f.read()

html = html.replace('<feature-box', '<cos-feature-box')
html = html.replace('</feature-box>', '</cos-feature-box>')
html = html.replace('<topicbox', '<cos-topic-card')
html = html.replace('</topicbox>', '</cos-topic-card>')
html = html.replace('<public-group-box', '<cos-group-card')
html = html.replace('</public-group-box>', '</cos-group-card>')
html = html.replace('[ngClass]="topic.categories"', '')

with open('src/app/features/home/home.component.html', 'w') as f:
    f.write(html)
