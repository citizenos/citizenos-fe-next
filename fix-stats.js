const fs = require('fs');
let html = fs.readFileSync('src/app/features/groups/group-detail/group-detail.component.html', 'utf8');

const target = `          <div id="description_right">
            <cos-activities-button [groupId]="group.id"></cos-activities-button>
            <div id="info_items_wrap">
              <div class="info_item">
                <cos-icon name="user" size="24"></cos-icon>
                <div class="info_number">{{ group.members.users.count }}</div>
              </div>
              <div class="info_item">
                <cos-icon name="status-in-progress" [size]="16" color="#1168A8"></cos-icon>
                <div class="info_number">{{ group.members.topics?.count?.inProgress || 0 }}</div>
              </div>`;

const replacement = `          <div id="description_right">
            <cos-activities-button [groupId]="group.id"></cos-activities-button>
            <div id="info_items_wrap">
              <div class="info_item">
                <cos-icon name="user" size="24"></cos-icon>
                <div class="info_value b1"><span class="bold">{{ group.members.users.count }}</span> <span class="mobile_show">{{ 'VIEWS.GROUP.SECTION_INFO_MEMBERS' | translate }}</span></div>
              </div>
              <div class="info_item">
                <cos-icon name="topic" size="24"></cos-icon>
                <div class="info_value b1"><span class="bold">{{ group.members.topics?.count?.total || 0 }}</span> <span class="mobile_show">{{ 'VIEWS.GROUP.SECTION_INFO_TOPICS' | translate }}</span></div>
              </div>
              <div class="info_item">
                <cos-icon name="status-in-progress" [size]="16" color="#1168A8"></cos-icon>
                <div class="info_number">{{ group.members.topics?.count?.inProgress || 0 }}</div>
              </div>`;

html = html.replace(target, replacement);
fs.writeFileSync('src/app/features/groups/group-detail/group-detail.component.html', html);
