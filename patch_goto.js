const fs = require('fs');
let file = fs.readFileSync('e2e/specs/ideation-visual.spec.ts', 'utf8');
file = file.replace(/waitUntil: 'networkidle'/g, "waitUntil: 'domcontentloaded'");
fs.writeFileSync('e2e/specs/ideation-visual.spec.ts', file);
