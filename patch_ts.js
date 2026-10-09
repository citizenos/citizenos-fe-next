const fs = require('fs');
let file = fs.readFileSync('src/app/features/topics/topic-create/components/step-topic-info/step-topic-info.component.ts', 'utf8');

file = file.replace(/import \{ FormsModule \} from '@angular\/forms';/, "import { FormsModule } from '@angular/forms';\nimport { NgClass } from '@angular/common';");
file = file.replace(/ButtonComponent,/, 'IconComponent, NgClass,');

fs.writeFileSync('src/app/features/topics/topic-create/components/step-topic-info/step-topic-info.component.ts', file);
