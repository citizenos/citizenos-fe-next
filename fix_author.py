import re

file_path = 'src/app/features/topics/topic-view/components/argument/argument.component.ts'
with open(file_path, 'r') as f:
    content = f.read()

search_func = """  getParentAuthor() {
    const arg = this.argument();
    if (arg.parent?.id === this.root()?.id) {
      return this.root()?.creator?.name || '';
    }

    const parentReply = this.root()?.replies?.rows.find((a: Argument) => a.id === arg.parent?.id);
    if (parentReply) {
      return parentReply.creator?.name || '';
    }
    return '';
  }"""

replace_func = """  getParentAuthor() {
    const arg = this.argument();
    if ((arg.parent as any)?.creator?.name) {
      return (arg.parent as any).creator.name;
    }
    if (arg.parent?.id === this.root()?.id) {
      return this.root()?.creator?.name || '';
    }
    const parentReply = this.root()?.replies?.rows?.find((a: Argument) => a.id === arg.parent?.id);
    if (parentReply) {
      return parentReply.creator?.name || '';
    }
    return '';
  }"""

content = content.replace(search_func, replace_func)

with open(file_path, 'w') as f:
    f.write(content)

