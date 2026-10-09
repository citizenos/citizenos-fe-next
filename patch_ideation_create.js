const fs = require('fs');
let html = fs.readFileSync('src/app/features/topics/ideation-create/ideation-create.component.html', 'utf8');

html = html.replace('<cos-create-wizard-shell', '<cos-create-wizard-shell\n  [hasSidebar]="true"');
html = html.replace(/<cos-topic-ideation/g, '<app-topic-ideation');
html = html.replace(/<\/cos-topic-ideation>/g, '</app-topic-ideation>');

fs.writeFileSync('src/app/features/topics/ideation-create/ideation-create.component.html', html);

let ts = fs.readFileSync('src/app/features/topics/ideation-create/ideation-create.component.ts', 'utf8');
ts = ts.replace(/import \{ StepTopicPreviewComponent \}/, "import { StepTopicPreviewComponent } from '../topic-create/components/step-topic-preview/step-topic-preview.component';\nimport { TopicIdeationComponent } from '../topic-view/components/topic-ideation/topic-ideation.component';");

ts = ts.replace(/StepTopicPreviewComponent,/, 'StepTopicPreviewComponent,\n    TopicIdeationComponent,');
fs.writeFileSync('src/app/features/topics/ideation-create/ideation-create.component.ts', ts);
