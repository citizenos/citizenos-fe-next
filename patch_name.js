const fs = require('fs');
let file = fs.readFileSync('e2e/specs/ideation-visual.spec.ts', 'utf8');
file = file.replace(/topic-create-compose-baseline\.png/g, "topic-create-compose-next.png");
fs.writeFileSync('e2e/specs/ideation-visual.spec.ts', file);
