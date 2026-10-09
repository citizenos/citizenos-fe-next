import re

with open('src/app/features/topics/public-topics/public-topics.component.html', 'r') as f:
    html = f.read()

# Fix the inputs
html = html.replace('<input type="radio" name="country" [checked]="filtersData().country.preSelectedValue === country.name">', '<input type="radio" name="country" [checked]="filtersData().country.preSelectedValue === country.name" />')
html = html.replace('<input type="radio" name="language" [checked]="filtersData().language.preSelectedValue === language.name">', '<input type="radio" name="language" [checked]="filtersData().language.preSelectedValue === language.name" />')
html = html.replace('<input type="radio" [name]="filterKey" [checked]="filtersData()[filterKey].preSelectedValue === option.value">', '<input type="radio" [name]="filterKey" [checked]="filtersData()[filterKey].preSelectedValue === option.value" />')

with open('src/app/features/topics/public-topics/public-topics.component.html', 'w') as f:
    f.write(html)

with open('src/app/features/topics/public-topics/public-topics.component.ts', 'r') as f:
    ts = f.read()

ts = ts.replace('this.debouncedSearch()', 'this.debouncedSearch.value()')

with open('src/app/features/topics/public-topics/public-topics.component.ts', 'w') as f:
    f.write(ts)
