const fs = require('fs');
let file = fs.readFileSync('src/app/features/topics/topic-create/components/step-topic-info/step-topic-info.component.html', 'utf8');

file = file.replace(/\[ngClass\]="\['create_content_block', topic\(\)\.status \|\| 'discussion'\]"/g, 'class="create_content_block"');

fs.writeFileSync('src/app/features/topics/topic-create/components/step-topic-info/step-topic-info.component.html', file);
