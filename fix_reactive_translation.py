import re

# TS FILE
file_path = 'src/app/features/topics/topic-view/components/topic-discussion/topic-discussion.component.ts'
with open(file_path, 'r') as f:
    content = f.read()

replacement = """  getActiveTypeFilters() {
    if (this.selectedTypes().length === 3 || this.selectedTypes().length === 0) return ['COMPONENTS.TOPIC_ARGUMENTS.FILTER_TYPE_ALL'];
    return this.selectedTypes().map(t => this.argumentTypes.find(at => at.value === t)?.title || '');
  }

  getActiveOrderFilterText() {
    return this.orderByOptions.find(o => o.value === this.selectedOrder())?.title || '';
  }"""

content = re.sub(r'  getActiveTypeFilterText\(\) \{[\s\S]*?  getActiveOrderFilterText\(\) \{[\s\S]*?  \}', replacement, content)

with open(file_path, 'w') as f:
    f.write(content)

# HTML FILE
html_path = 'src/app/features/topics/topic-view/components/topic-discussion/topic-discussion.component.html'
with open(html_path, 'r') as f:
    html_content = f.read()

html_content = html_content.replace(
    '<span>{{ getActiveTypeFilterText() }}</span>',
    '''<span>
            @for (key of getActiveTypeFilters(); track key; let last = $last) {
              {{ key | translate }}{{ !last ? ', ' : '' }}
            }
          </span>'''
)

html_content = html_content.replace(
    '<span>{{ getActiveOrderFilterText() }}</span>',
    '<span>{{ getActiveOrderFilterText() | translate }}</span>'
)

# And also for mobile filters, I need to check if they use `getActiveTypeFilterText` or `getActiveOrderFilterText`
html_content = html_content.replace(
    '{{ getActiveTypeFilterText() }}',
    '''@for (key of getActiveTypeFilters(); track key; let last = $last) {
                {{ key | translate }}{{ !last ? ', ' : '' }}
              }'''
)

html_content = html_content.replace(
    '{{ getActiveOrderFilterText() }}',
    '{{ getActiveOrderFilterText() | translate }}'
)

with open(html_path, 'w') as f:
    f.write(html_content)

