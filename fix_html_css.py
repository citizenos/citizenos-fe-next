import re

with open("src/app/features/topics/topic-view/components/topic-ideation/topic-ideation.component.scss", "r") as f:
    scss = f.read()

# We need to replace .ideation_header entirely.
# Let's find it.
start = scss.find('.ideation_header {')
# We need to find the matching closing brace. Since we know we can just replace the block.
# Actually I'll just use regex.

new_header_scss = """
.ideation_header {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  background-color: var(--color-dialog-ideation-contrast);
  border-radius: 16px 16px 0 0;
  gap: 16px;

  @include mixins.mobile {
    flex-direction: column;
    align-items: flex-start;
    padding: 16px;
  }

  .header_left {
    display: flex;
    align-items: center;
    gap: 12px;

    .question {
      font-size: 20px;
      font-style: normal;
      font-weight: 600;
      line-height: 28px;
    }
  }

  .header_right {
    display: flex;
    align-items: center;
    gap: 24px;

    @include mixins.mobile {
      width: 100%;
      justify-content: space-between;
    }

    .deadline_wrap {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 14px;
      font-weight: 600;
      color: var(--color-text-main);
    }
  }
}
"""

scss = re.sub(r'\.ideation_header\s*\{.*?(?=\n\.ideation_question|\n#mobile_actions|\n\.tabs_wrap|\n\.ideation_content|\n\.ideas_wrap)', new_header_scss, scss, flags=re.DOTALL)

with open("src/app/features/topics/topic-view/components/topic-ideation/topic-ideation.component.scss", "w") as f:
    f.write(scss)
