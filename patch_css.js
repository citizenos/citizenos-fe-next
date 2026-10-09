const fs = require('fs');
let file = fs.readFileSync('src/app/features/topics/topic-create/components/step-topic-info/step-topic-info.component.scss', 'utf8');

file = file.replace(/  border-left: 8px solid var\(--color-info-background\);\n\n  &\.open \{\n    border-left-color: var\(--color-info-background\);\n  \}\n\n  &\.active \{\n    border-left-color: var\(--color-info\);\n    border-bottom: 2px solid var\(--color-info\);\n    color: var\(--color-discussion\);\n  \}/, `  border-left: 8px solid;

  &.discussion {
    border-left-color: var(--color-dialog-discussion-contrast, #d7d0ea);
    &.active, &.open {
      border-left-color: var(--color-dialog-discussion, #6143b0);
      border-bottom: 2px solid var(--color-dialog-discussion, #6143b0);
      color: var(--color-dialog-discussion, #6143b0);
    }
  }

  &.ideation {
    border-left-color: var(--color-dialog-ideation-contrast, #ffecb3);
    &.active, &.open {
      border-left-color: var(--color-dialog-ideation, #ffc107);
      border-bottom: 2px solid var(--color-dialog-ideation, #ffc107);
      color: var(--color-dialog-ideation, #ffc107);
    }
  }

  &.voting {
    border-left-color: var(--color-dialog-voting-contrast, #c1d8eb);
    &.active, &.open {
      border-left-color: var(--color-dialog-voting, #1168a8);
      border-bottom: 2px solid var(--color-dialog-voting, #1168a8);
      color: var(--color-dialog-voting, #1168a8);
    }
  }`);

fs.writeFileSync('src/app/features/topics/topic-create/components/step-topic-info/step-topic-info.component.scss', file);
