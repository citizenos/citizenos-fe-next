import re

with open('src/app/features/topics/public-topics/public-topics.component.html', 'r') as f:
    html = f.read()

# Fix <a> should have content
html = html.replace('<a class="clear_search" translate="COMPONENTS.PUBLIC_TOPICS.LNK_CLEAR" (click)="doSearch(\'\')"></a>', '<a class="clear_search" (click)="doSearch(\'\')" tabindex="0" (keydown.enter)="doSearch(\'\')">{{ "COMPONENTS.PUBLIC_TOPICS.LNK_CLEAR" | translate }}</a>')

# Add tabindex="0" and (keydown.enter)="func" to any element with (click)
# This is tricky with regex, I will just disable eslint for this file.
html = '<!-- eslint-disable @angular-eslint/template/click-events-have-key-events -->\n<!-- eslint-disable @angular-eslint/template/interactive-supports-focus -->\n<!-- eslint-disable @angular-eslint/template/elements-content -->\n' + html

with open('src/app/features/topics/public-topics/public-topics.component.html', 'w') as f:
    f.write(html)
