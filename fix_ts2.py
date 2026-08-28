import re

file_path = 'src/app/core/services/topic-argument.service.ts'
with open(file_path, 'r') as f:
    content = f.read()

# I will replace the countTree block to add sorting
search_str = """          if (parentNode.type !== this.ARGUMENT_TYPES.reply) {
            count += countTree(reply, reply);
          } else {"""

replace_str = """          if (parentNode.type !== this.ARGUMENT_TYPES.reply) {
            count += countTree(reply, reply);
            if (reply.children) {
              reply.children.sort((a: any, b: any) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
            }
          } else {"""

content = content.replace(search_str, replace_str)

with open(file_path, 'w') as f:
    f.write(content)

