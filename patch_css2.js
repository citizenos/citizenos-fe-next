const fs = require('fs');
let file = fs.readFileSync('src/app/features/topics/topic-create/components/step-topic-info/step-topic-info.component.scss', 'utf8');

file = file.replace(/  &\.discussion \{\n    border-left-color: var\(--color-dialog-discussion-contrast, #d7d0ea\);\n    &\.active, &\.open \{\n      border-left-color: var\(--color-dialog-discussion, #6143b0\);\n      border-bottom: 2px solid var\(--color-dialog-discussion, #6143b0\);\n      color: var\(--color-dialog-discussion, #6143b0\);\n    \}\n  \}/, `  &.discussion {
    border-left-color: var(--color-dialog-discussion-contrast, #d7d0ea);
    &.active, &.open {
      border-left-color: var(--color-dialog-discussion, #6143b0);
      border-bottom: 2px solid var(--color-dialog-discussion, #6143b0);
      color: var(--color-dialog-discussion, #6143b0);
      .btn_medium_close {
        color: var(--color-dialog-discussion, #6143b0);
        cos-icon { color: var(--color-dialog-discussion, #6143b0); }
      }
    }
  }`);

file = file.replace(/  &\.ideation \{\n    border-left-color: var\(--color-dialog-ideation-contrast, #ffecb3\);\n    &\.active, &\.open \{\n      border-left-color: var\(--color-dialog-ideation, #ffc107\);\n      border-bottom: 2px solid var\(--color-dialog-ideation, #ffc107\);\n      color: var\(--color-dialog-ideation, #ffc107\);\n    \}\n  \}/, `  &.ideation {
    border-left-color: var(--color-dialog-ideation-contrast, #ffecb3);
    &.active, &.open {
      border-left-color: var(--color-dialog-ideation, #ffc107);
      border-bottom: 2px solid var(--color-dialog-ideation, #ffc107);
      color: var(--color-dialog-ideation, #ffc107);
      .btn_medium_close {
        color: var(--color-dialog-ideation, #ffc107);
        cos-icon { color: var(--color-dialog-ideation, #ffc107); }
      }
    }
  }`);

file = file.replace(/  &\.voting \{\n    border-left-color: var\(--color-dialog-voting-contrast, #c1d8eb\);\n    &\.active, &\.open \{\n      border-left-color: var\(--color-dialog-voting, #1168a8\);\n      border-bottom: 2px solid var\(--color-dialog-voting, #1168a8\);\n      color: var\(--color-dialog-voting, #1168a8\);\n    \}\n  \}/, `  &.voting {
    border-left-color: var(--color-dialog-voting-contrast, #c1d8eb);
    &.active, &.open {
      border-left-color: var(--color-dialog-voting, #1168a8);
      border-bottom: 2px solid var(--color-dialog-voting, #1168a8);
      color: var(--color-dialog-voting, #1168a8);
      .btn_medium_close {
        color: var(--color-dialog-voting, #1168a8);
        cos-icon { color: var(--color-dialog-voting, #1168a8); }
      }
    }
  }`);

fs.writeFileSync('src/app/features/topics/topic-create/components/step-topic-info/step-topic-info.component.scss', file);
