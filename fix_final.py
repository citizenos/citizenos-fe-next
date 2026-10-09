with open('src/app/features/dashboard/dashboard.component.html', 'r') as f:
    text = f.read()

text = text.replace('<app-page-list-header', '<cos-page-header')
text = text.replace('</app-page-list-header>', '</cos-page-header>')
text = text.replace('@if (true; defer) {', '')

# Remove extra } for the @if
# `text = text.replace('</a>\n  }\n\n</div>', '</a>\n\n</div>')` -> Wait, it is `@if (true; defer) {`. It has a matching brace. Let's just remove the start and the matching brace manually or via regex.
# Actually I can just replace `@if (true; defer) {` with `@defer (on viewport) {` and then it's valid angular!
text = text.replace('', '') # to undo the above, let's just do:
