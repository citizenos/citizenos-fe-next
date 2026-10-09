import re

with open("src/app/features/topics/topic-view/components/ideabox/ideabox.component.html", "r") as f:
    html = f.read()

target = """        <div class="vertical_line_separator"></div>

        <button type="button" class="btn_small_plain bookmark" (click)="$event.stopPropagation(); toggleFavourite()">"""

replacement = """        @if (userStore.isAuthenticated()) {
          <div class="vertical_line_separator"></div>

          <button type="button" class="btn_small_plain bookmark" (click)="$event.stopPropagation(); toggleFavourite()">"""

if target in html:
    html = html.replace(target, replacement)

target2 = """            }
        </button>
      } @else {"""

replacement2 = """            }
          </button>
        }
      } @else {"""

if target2 in html:
    html = html.replace(target2, replacement2)

with open("src/app/features/topics/topic-view/components/ideabox/ideabox.component.html", "w") as f:
    f.write(html)

print("Done")
