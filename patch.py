import re

file_path = 'src/app/core/services/topic-argument.service.ts'
with open(file_path, 'r') as f:
    content = f.read()

# Remove processArguments method
content = re.sub(r'  private processArguments.*?\n  getArguments', '  getArguments', content, flags=re.DOTALL)

# In getArguments, do not call processArguments
content = content.replace('rows: res.data?.rows ? this.processArguments(res.data.rows) : [],', 'rows: res.data?.rows || [],')

with open(file_path, 'w') as f:
    f.write(content)
