import re

file_path = 'src/app/features/topics/topic-view/components/topic-discussion/topic-discussion.component.ts'
with open(file_path, 'r') as f:
    content = f.read()

replacement = """  getActiveTypeFilterText() {
    if (this.selectedTypes().length === 3 || this.selectedTypes().length === 0) return this.translate.instant('COMPONENTS.TOPIC_ARGUMENTS.FILTER_TYPE_ALL');
    return this.selectedTypes().map(t => this.translate.instant(this.argumentTypes.find(at => at.value === t)?.title || '')).join(', ');
  }

  getActiveOrderFilterText() {
    return this.translate.instant(this.orderByOptions.find(o => o.value === this.selectedOrder())?.title || '');
  }"""

content = re.sub(r'  getActiveTypeFilterText\(\) \{[\s\S]*?  \}', replacement, content)

with open(file_path, 'w') as f:
    f.write(content)

