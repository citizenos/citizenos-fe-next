import re

file_path = 'src/app/features/topics/topic-view/components/argument/argument.component.html'
with open(file_path, 'r') as f:
    content = f.read()

# We want to move the </div> at line 146 to line 130
# Currently at line 129 there is a </div> that closes .argument_content_wrap
# Line 146 closes .argument_wrap
# Line 147 closes .argument
# Let's do it cleanly by searching and replacing

search_str = """    </div>

    @if (showReplyForm()) {"""

replace_str = """    </div>
  </div>

  @if (showReplyForm()) {"""

content = content.replace(search_str, replace_str)

# Now we must remove the `</div>` that was at line 146
# The end of the file looks like:
#     </div>
#     }
#   </div>
# </div>
#
# @if (mobileActions()) {

search_str2 = """    </div>
    }
  </div>
</div>

@if (mobileActions()) {"""

replace_str2 = """    </div>
    }
</div>

@if (mobileActions()) {"""

content = content.replace(search_str2, replace_str2)


# I also need to add the `.reply_more` div!
search_loop = """      @for (reply of argument().replies?.rows; track reply.id) {
      <div class="reply_container">
        <div class="reply_referer"></div>
        <cos-argument [argument]="reply" [topicId]="topicId()" [discussionId]="discussionId()"
          [root]="root() || argument()" (deleted)="deleted.emit()"></cos-argument>
      </div>
      }"""

replace_loop = """      @for (reply of argument().replies?.rows; track reply.id; let last = $last) {
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

