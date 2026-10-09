const fs = require('fs');
let file = fs.readFileSync('src/app/features/topics/ideation-create/components/step-ideation-settings/step-ideation-settings.component.ts', 'utf8');

file = file.replace(/          \.mobile_show \{\n            color: var\(--color-text-muted\);\n            font-size: 14px;\n          \}\n\n          \.mobile_hidden \{/, `          .mobile_hidden {`);

file = file.replace(/        \.header_wrap \{/, `        .mobile_show {\n          color: var(--color-text-muted);\n          font-size: 14px;\n        }\n\n        .header_wrap {`);

fs.writeFileSync('src/app/features/topics/ideation-create/components/step-ideation-settings/step-ideation-settings.component.ts', file);
