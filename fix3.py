import re

with open('src/app/features/topics/public-topics/public-topics.component.html', 'r') as f:
    html = f.read()

# Fix filtersData().status -> filtersData()['status']
html = html.replace('filtersData().status', "filtersData()['status']")
html = html.replace('filtersData().category', "filtersData()['category']")
html = html.replace('filtersData().country', "filtersData()['country']")
html = html.replace('filtersData().language', "filtersData()['language']")

with open('src/app/features/topics/public-topics/public-topics.component.html', 'w') as f:
    f.write(html)
