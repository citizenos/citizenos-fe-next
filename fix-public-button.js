const fs = require('fs');
let html = fs.readFileSync('src/app/features/groups/group-detail/group-detail.component.html', 'utf8');

const target = `              @if (isAdmin()) {
                <cos-button [routerLink]="['/', translate.currentLang, 'topics', 'create']" [queryParams]="{ groupId: group.id }">{{ 'VIEWS.GROUP.BTN_CREATE_TOPIC' | translate }}</cos-button>
              }
            </div>`;

const replacement = `              @if (isAdmin()) {
                <cos-button [routerLink]="['/', translate.currentLang, 'topics', 'create']" [queryParams]="{ groupId: group.id }">{{ 'VIEWS.GROUP.BTN_CREATE_TOPIC' | translate }}</cos-button>
              } @else {
                <cos-button [routerLink]="['/', translate.currentLang, 'topics']">{{ 'VIEWS.GROUP.BTN_NAV_PUBLIC_TOPICS' | translate }}</cos-button>
              }
            </div>`;

html = html.replace(target, replacement);
fs.writeFileSync('src/app/features/groups/group-detail/group-detail.component.html', html);
