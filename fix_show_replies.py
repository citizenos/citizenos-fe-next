import re

file_path = 'src/app/features/topics/topic-view/components/argument/argument.component.ts'
with open(file_path, 'r') as f:
    content = f.read()

content = content.replace("showReplies = signal(false);", "showReplies = model(false);")

with open(file_path, 'w') as f:
    f.write(content)

file_path = 'src/app/features/topics/topic-view/components/argument/argument.component.html'
with open(file_path, 'r') as f:
    content = f.read()

# Hide button for replies
content = content.replace("@if ((argument().replies?.count || 0) > 0) {", "@if ((argument().replies?.count || 0) > 0 && argument().type !== 'reply') {")

# Pass showReplies down
content = content.replace("[root]=\"root() || argument()\" (deleted)=\"deleted.emit()\"></cos-argument>", "[root]=\"root() || argument()\" [showReplies]=\"showReplies()\" (deleted)=\"deleted.emit()\"></cos-argument>")

with open(file_path, 'w') as f:
    f.write(content)

