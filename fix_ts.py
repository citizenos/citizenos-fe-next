import re

file_path = 'src/app/core/services/topic-argument.service.ts'
with open(file_path, 'r') as f:
    content = f.read()

method_to_add = """  private processArguments(rows: Argument[]): Argument[] {
    const results = [...rows];
    const argArray: any[] = [];
    
    const countTree = (parentNode: any, currentNode: any): number => {
      let count = 0;
      argArray.push(currentNode);
      
      if (currentNode.replies && currentNode.replies.rows && currentNode.replies.rows.length > 0) {
        currentNode.replies.rows.forEach((reply: any) => {
          count++;
          if (parentNode.type !== this.ARGUMENT_TYPES.reply) {
            count += countTree(reply, reply);
          } else {
            count += countTree(parentNode, reply);
            const replyClone = { ...reply };
            replyClone.replies = { count: 0, rows: [] };
            if (!parentNode.children) parentNode.children = [];
            parentNode.children.push(replyClone);
          }
        });
      }
      
      if (currentNode.type === this.ARGUMENT_TYPES.reply && currentNode.parent) {
        const parent = argArray.find(arg => arg.id === currentNode.parent.id);
        if (parent) {
          currentNode.parent = Object.assign({}, currentNode.parent, parent);
        }
      }
      
      return count;
    };

    results.forEach((row: any) => {
      if (!row.replies) row.replies = { count: 0, rows: [] };
      row.replies.count = countTree(row, row);
    });

    return results;
  }
"""

content = content.replace("  getArguments(params?: TopicArgumentParams): Observable<ArgumentListResponse> {", method_to_add + "\n  getArguments(params?: TopicArgumentParams): Observable<ArgumentListResponse> {")

content = content.replace("rows: res.data?.rows ?? [],", "rows: res.data?.rows ? this.processArguments(res.data.rows) : [],")

with open(file_path, 'w') as f:
    f.write(content)

