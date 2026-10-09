const fs = require('fs');
let file = fs.readFileSync('src/app/shared/components/deadline-picker/deadline-picker.component.ts', 'utf8');

file = file.replace(/class="discussion"/, '[ngClass]="theme()"');
file = file.replace(/<'discussion' \| 'voting'>/, "<'discussion' | 'voting' | 'ideation'>");

file = file.replace(/      &.voting.selected \{/, `      &.ideation.selected {\n        background-color: var(--color-dialog-ideation, #f9f6fc);\n      }\n\n      &.voting.selected {`);

file = file.replace(/      \.deadline_wrap \{/, `      cos-calender {\n        max-width: 320px;\n        display: block;\n      }\n\n      .deadline_wrap {`);

fs.writeFileSync('src/app/shared/components/deadline-picker/deadline-picker.component.ts', file);
