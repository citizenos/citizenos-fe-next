import re

file_path = 'src/app/features/topics/topic-view/components/argument/argument.component.html'
with open(file_path, 'r') as f:
    content = f.read()

search_loop = """      @for (reply of argument().replies?.rows; track reply.id) {
      <div class="reply_container">
        <div class="reply_referer"></div>
        <cos-argument [argument]="reply" [topicId]="topicId()" [discussionId]="discussionId()"
          [root]="root() || argument()" (deleted)="deleted.emit()"></cos-argument>
      </div>
      }"""

replace_loop = """      @let iterArray = argument().children || argument().replies?.rows || [];
      @for (reply of iterArray; track reply.id; let last = $last) {
      <div class="reply_container">
        <div class="reply_referer"></div>
        @if (!last) {
          <div class="reply_more"></div>
        }
        <cos-argument [argument]="reply" [topicId]="topicId()" [discussionId]="discussionId()"
          [root]="root() || argument()" (deleted)="deleted.emit()"></cos-argument>
      </div>
      }"""

content = content.replace(search_loop, replace_loop)

with open(file_path, 'w') as f:
    f.write(content)

