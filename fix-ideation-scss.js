const fs = require('fs');
const file = 'src/app/features/topics/topic-view/components/topic-ideation/topic-ideation.component.scss';
let scss = fs.readFileSync(file, 'utf8');

// Add padding to ideation_wrap instead of :host, but use padding-top: 0
if (!scss.includes('.ideation_wrap {')) {
  scss = scss.replace('.ideation_header {', `.ideation_wrap {\n  padding: 0 32px 32px 32px;\n  @include mixins.mobile {\n    padding: 0 16px 16px 16px;\n  }\n}\n\n.ideation_header {`);
}

// Make sure ideation_header spans the full width and offsets the wrap padding
scss = scss.replace(
  /.ideation_header \{[\s\S]*?padding: 16px 24px;/,
  `.ideation_header {\n  display: flex;\n  flex-direction: row;\n  justify-content: space-between;\n  align-items: center;\n  padding: 24px 32px;\n  margin: 0 -32px 32px -32px;\n  @include mixins.mobile {\n    padding: 16px;\n    margin: 0 -16px 24px -16px;\n  }`
);

fs.writeFileSync(file, scss);
