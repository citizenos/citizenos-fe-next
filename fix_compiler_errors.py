import re

with open('src/app/features/dashboard/dashboard.component.html', 'r') as f:
    text = f.read()

text = text.replace('<page-header', '<app-page-header')
text = text.replace('</page-header>', '</app-page-header>')

text = text.replace('showNoEngagements()', 'hasNoEngagements()')
text = text.replace('showCreateMenu()', 'toggleCreate()')
text = text.replace('publicmyGroups()', 'publicGroups()')

text = text.replace('@defer (on viewport) {', '')

# Need to add @placeholder or remove defer. I just removed the start, let's remove the closing bracket.
# It's at the end of the news section.
# Actually let's just use re to remove `@defer (on viewport) {` and the matching `}`. 
# Better yet, I can just replace it with nothing and then manually remove the extra `}` at the end.
