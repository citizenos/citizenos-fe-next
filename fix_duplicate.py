import re

file_path = 'src/app/features/topics/topic-view/components/topic-discussion/topic-discussion.component.ts'
with open(file_path, 'r') as f:
    content = f.read()

replacement = """  hasActiveFilters = computed(() => {
    return this.selectedTypes().length !== 3 || this.selectedOrder() !== 'popularity';
  });

  toggleTypeFilter(type: string) {"""

content = re.sub(r'  hasActiveFilters = computed\(\(\) => \{[\s\S]*?  toggleTypeFilter\(type: string\) \{', replacement, content)

with open(file_path, 'w') as f:
    f.write(content)

