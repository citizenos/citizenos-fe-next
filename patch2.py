import re

file_path = 'src/app/features/topics/topic-view/components/topic-discussion/topic-discussion.component.ts'
with open(file_path, 'r') as f:
    content = f.read()

replacement = """
  flattenedArguments = computed(() => {
    let results = JSON.parse(JSON.stringify(this.arguments()));
    const argArray: any[] = [];
    const countTree = (parentNode: any, currentNode: any) => {
      argArray.push(currentNode);
      if (currentNode.replies && currentNode.replies.rows && currentNode.replies.rows.length > 0) {
        currentNode.replies.rows.forEach((reply: any) => {
          if (parentNode.type !== this.argumentService.ARGUMENT_TYPES.reply) {
            countTree(reply, reply);
          } else {
            countTree(parentNode, reply);
            const replyClone = { ...reply };
            replyClone.replies = { count: 0, rows: [] };
            if (!parentNode.children) parentNode.children = [];
            parentNode.children.push(replyClone);
          }
        });
      }
      if (currentNode.type === this.argumentService.ARGUMENT_TYPES.reply && currentNode.parent) {
        const parent = argArray.find((arg: any) => arg.id === currentNode.parent.id);
        if (parent) {
          currentNode.parent = Object.assign(currentNode.parent, parent);
        }
      }
    };

    results.forEach((row: any) => {
      countTree(row, row);
      row.replies.count = row.replies?.rows?.length || 0;
      row.replies?.rows?.forEach((reply: any) => {
        if (reply.children?.length) {
          row.replies.count += reply.children.length;
        }
      });
    });
    return results;
  });
"""

content = re.sub(r'  flattenedArguments = computed\(\(\) => \{\n    return this\.arguments\(\);\n  \}\);', replacement.strip(), content)

with open(file_path, 'w') as f:
    f.write(content)
