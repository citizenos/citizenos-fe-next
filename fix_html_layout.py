with open("src/app/features/topics/topic-view/components/topic-ideation/topic-ideation.component.html", "r") as f:
    content = f.read()

# We need to rewrite the entire ideation_header block.
# Let's extract it.
start = content.find('<div class="ideation_header">')
end = content.find('<div class="ideation_content">')

if start != -1 and end != -1:
    new_header = """  <div class="ideation_header">
    <div class="header_left">
      <cos-icon name="bulb" size="24" color="var(--color-text-main)"></cos-icon>
      <div class="question">{{ ideation().question }}</div>
    </div>

    <div class="header_right">
      @if (ideation().deadline) {
        <div class="deadline_wrap">
          <cos-icon name="calendar" size="20"></cos-icon>
          <span class="bold">{{ ideation().deadline | date:'dd.MM.yyyy HH:mm' }}</span>
        </div>
      }

      @if (canUpdate() && (canEditDeadline() || !hasIdeationEndedExpired())) {
        <div class="setting_button dropdown button_dropdown" cosDropdown>
          <!-- Desktop Manage button -->
          <button type="button" class="btn_manage_ideation mobile_hidden" trigger>
            <cos-icon name="more-vertical"></cos-icon>
            <span>{{ 'COMPONENTS.TOPIC_IDEATION.BTN_IDEATION_ACTIONS' | translate }}</span>
          </button>
          
          <!-- Mobile Manage button -->
          <button type="button" id="mobile_actions" class="btn_manage_ideation icon mobile_show" trigger>
             <cos-icon name="more-vertical"></cos-icon>
          </button>

          <div class="options">
            @if (canEditDeadline()) {
              <a class="option" [routerLink]="['/', translate.currentLang, 'topics', 'ideation', 'edit', topic().id]" fragment="ideation_system">
                <div class="icon_wrap">
                  <cos-icon name="edit"></cos-icon>
                </div>
                <span>{{ 'COMPONENTS.TOPIC_IDEATION.OPT_EDIT_IDEATION' | translate }}</span>
              </a>
              <div class="option" role="button" tabindex="0" (click)="editDeadline()" (keydown.enter)="editDeadline()">
                <div class="icon_wrap">
                    <cos-icon name="calendar"></cos-icon>
                </div>
                <span>{{ (ideation().deadline ? 'COMPONENTS.TOPIC_IDEATION.OPT_EDIT_DEADLINE' : 'COMPONENTS.TOPIC_IDEATION.OPT_ADD_DEADLINE') | translate }}</span>
              </div>
            }
            @if (canEdit()) {
              <div class="option" (click)="exportIdeas()" (keydown.enter)="exportIdeas()" tabindex="0" role="button">
                <div class="icon_wrap">
                  <cos-icon name="download"></cos-icon>
                </div>
                <span>{{ 'COMPONENTS.TOPIC_IDEATION.OPT_DOWNLOAD_IDEAS' | translate }}</span>
              </div>
            }
            @if (!hasIdeationEndedExpired()) {
              <div class="line_separator"></div>
              <div class="option" (click)="closeIdeation()" (keydown.enter)="closeIdeation()" tabindex="0" role="button">
                <div class="icon_wrap">
                  <cos-icon name="lock"></cos-icon>
                </div>
                <span>{{ 'COMPONENTS.TOPIC_IDEATION.OPT_CLOSE_IDEATION' | translate }}</span>
              </div>
            }
          </div>
        </div>
      }
    </div>
  </div>

"""
    content = content[:start] + new_header + "  " + content[end:]
    
    with open("src/app/features/topics/topic-view/components/topic-ideation/topic-ideation.component.html", "w") as f:
        f.write(content)
    print("Success writing HTML")
else:
    print("Failed to find bounds")
