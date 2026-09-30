import re

with open('src/app/features/dashboard/dashboard.component.html.legacy', 'r') as f:
    html = f.read()

def replace_ngif(match):
    cond = match.group(1)
    # manual fixes for conditions
    cond = cond.replace('groups$ | async as groups;', 'myGroups() as groups')
    cond = cond.replace('groups$ | async as groups', 'myGroups() as groups')
    cond = cond.replace('groups$ | async as mygroups', 'myGroups() as mygroups')
    cond = cond.replace('mygroups.length > 0 && (publicgroups$ | async) as groups;', 'myGroups().length > 0 && publicGroups() as groups')
    cond = cond.replace('publicgroups$ | async as groups;', 'publicGroups() as groups')
    cond = cond.replace('publictopics$ | async as topics;', 'publicTopics() as topics')
    cond = cond.replace('topics$ | async as topics', 'myTopics() as topics')
    cond = cond.replace('showNoEngagements()', 'hasNoEngagements()')
    cond = cond.replace('wWidth() <= 1024 && wWidth() > 560', 'wWidth() <= 1024 && wWidth() > 560') # we will need to add wWidth signal
    cond = cond.replace('wWidth() > 1024 || wWidth() <= 560', 'wWidth() > 1024 || wWidth() <= 560')
    if '; defer' in cond:
        cond = cond.replace('news$ | async as news; defer', 'newsItems() as news')
        return f'@if ({cond}) {{' # and we will add @defer later manually
    
    return f'@if ({cond}) {{'

# We'll just replace the start tags and end tags of the divs containing these directives manually or via a simple stack.
# Given it's HTML, we could use BeautifulSoup to rewrite it.
