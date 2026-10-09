const fs = require('fs');
let file = fs.readFileSync('src/app/features/topics/topic-create/components/step-topic-info/step-topic-info.component.html', 'utf8');

file = file.replace(/      <cos-button variant="ghost" \(clicked\)="deleteTopicImage\(\); \$event\.stopPropagation\(\);" icon="trash">\n        <span class="link">{{ 'VIEWS.TOPIC_CREATE.HEADER_IMAGE_BTN_REMOVE' \| translate }}<\/span>\n      <\/cos-button>/, `      <button class="btn_medium_close bold" (click)="deleteTopicImage(); $event.stopPropagation();">
        <span class="link">{{ 'VIEWS.TOPIC_CREATE.HEADER_IMAGE_BTN_REMOVE' | translate }}</span>
        <cos-icon name="trash"></cos-icon>
      </button>`);

file = file.replace(/      <cos-button variant="ghost" \(clicked\)="toggleBlock\('headerImage'\); \$event\.stopPropagation\(\);" icon="close">\n        <span class="link">{{ 'VIEWS.TOPIC_CREATE.HEADER_IMAGE_BTN_CANCEL' \| translate }}<\/span>\n      <\/cos-button>/, `      <button class="btn_medium_close bold" (click)="toggleBlock('headerImage'); $event.stopPropagation();">
        <span class="link">{{ 'VIEWS.TOPIC_CREATE.HEADER_IMAGE_BTN_CANCEL' | translate }}</span>
        <cos-icon name="close"></cos-icon>
      </button>`);

fs.writeFileSync('src/app/features/topics/topic-create/components/step-topic-info/step-topic-info.component.html', file);
