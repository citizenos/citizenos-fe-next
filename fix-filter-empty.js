const fs = require('fs');
let html = fs.readFileSync('src/app/features/groups/group-detail/group-detail.component.html', 'utf8');

const target = `              } @else {
                <cos-button [routerLink]="['/', translate.currentLang, 'topics']">{{ 'VIEWS.GROUP.BTN_NAV_PUBLIC_TOPICS' | translate }}</cos-button>
              }
            </div>
          }`;

const replacement = `              } @else {
                <cos-button [routerLink]="['/', translate.currentLang, 'topics']">{{ 'VIEWS.GROUP.BTN_NAV_PUBLIC_TOPICS' | translate }}</cos-button>
              }
            </div>
          } @else {
            <div class="no_engagements empty_state">
              <div class="title" translate="VIEWS.GROUP.HEADING_NO_RESULTS"></div>
            </div>
          }`;

html = html.replace(target, replacement);
fs.writeFileSync('src/app/features/groups/group-detail/group-detail.component.html', html);
