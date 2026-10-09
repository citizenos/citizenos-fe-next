import re

with open("src/app/features/topics/topic-view/components/topic-ideation/topic-ideation.component.html", "r") as f:
    content = f.read()

# The header_section ends with </div> right after question if we remove the @if (canUpdate()...) block.
# Let's find the start of the @if (canUpdate()...) block in the header_section and the @if (ideation().deadline) block.
start_idx = content.find("      @if (canUpdate() && (canEditDeadline() || !hasIdeationEndedExpired())) {")
end_idx = content.find("    @if (ideation().deadline) {")

if start_idx != -1 and end_idx != -1:
    # We want to remove the @if (canUpdate()) block up to the closing </div> of header_section.
    # Wait, the closing </div> of header_section is right before @if (ideation().deadline).
    # No, it's:
    #     </div>
    #
    #     @if (ideation().deadline) {
    # So we want to replace the whole thing.
    
    # Let's just find the entire ideation_header block and replace it.
    header_start = content.find('<div class="ideation_header">')
    header_end = content.find('<div class="ideation_content">')
    
    if header_start != -1 and header_end != -1:
        new_header = """  <div class="ideation_header">
    <div class="header_section">
      <div class="question">{{ ideation().question }}</div>
    </div>
  </div>

  """
        content = content[:header_start] + new_header + content[header_end:]
        with open("src/app/features/topics/topic-view/components/topic-ideation/topic-ideation.component.html", "w") as f:
            f.write(content)
        print("Success HTML")
    else:
        print("Failed HTML bounds")
else:
    print("Failed finding specific blocks")

with open("src/app/features/topics/topic-view/components/topic-ideation/topic-ideation.component.scss", "r") as f:
    scss = f.read()

# We need to remove .data_section, .button_dropdown, .line_separator, #mobile_actions, .setting_button from SCSS
scss = re.sub(r'\s*\.data_section \{[^}]+\}[^}]+\}', '', scss, flags=re.DOTALL)
scss = re.sub(r'\s*\.button_dropdown \{.*?\s*\}\s*\}', '', scss, flags=re.DOTALL)
scss = re.sub(r'\s*\.line_separator \{[^}]+\}', '', scss, flags=re.DOTALL)
scss = re.sub(r'\s*#mobile_actions \{[^}]+\}', '', scss, flags=re.DOTALL)
scss = re.sub(r'\s*\.setting_button \{[^}]+\}[^}]+\}', '', scss, flags=re.DOTALL)
scss = re.sub(r'\s*\.ideation_deadline \{[^}]+\}[^}]+\}', '', scss, flags=re.DOTALL)

with open("src/app/features/topics/topic-ideation.scss.tmp", "w") as f:
    f.write(scss)
