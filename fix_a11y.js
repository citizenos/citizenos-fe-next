const fs = require('fs');
const file = 'src/app/features/topics/vote-create/components/step-vote-settings/step-vote-settings.component.html';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(/\(click\)="setType\('regular'\)"/g, '(click)="setType(\'regular\')" (keydown.enter)="setType(\'regular\')" tabindex="0"');
content = content.replace(/\(click\)="setType\('multiple'\)"/g, '(click)="setType(\'multiple\')" (keydown.enter)="setType(\'multiple\')" tabindex="0"');
content = content.replace(/\(click\)="setType\('ideation'\)"/g, '(click)="setType(\'ideation\')" (keydown.enter)="setType(\'ideation\')" tabindex="0"');

content = content.replace(/\(click\)="togglePredefined\(opt\); \$event\.stopPropagation\(\);"/g, '(click)="togglePredefined(opt); $event.stopPropagation();" (keydown.enter)="togglePredefined(opt); $event.stopPropagation();" tabindex="0"');
content = content.replace(/\(click\)="toggleOption\('Neutral'\); \$event\.stopPropagation\(\);"/g, '(click)="toggleOption(\'Neutral\'); $event.stopPropagation();" (keydown.enter)="toggleOption(\'Neutral\'); $event.stopPropagation();" tabindex="0"');
content = content.replace(/\(click\)="toggleOption\('Veto'\); \$event\.stopPropagation\(\);"/g, '(click)="toggleOption(\'Veto\'); $event.stopPropagation();" (keydown.enter)="toggleOption(\'Veto\'); $event.stopPropagation();" tabindex="0"');

content = content.replace(/\(click\)="toggleAllIdeas\(\); \$event\.stopPropagation\(\);"/g, '(click)="toggleAllIdeas(); $event.stopPropagation();" (keydown.enter)="toggleAllIdeas(); $event.stopPropagation();" tabindex="0"');
content = content.replace(/\(click\)="toggleFolder\(folder, \$event\); \$event\.stopPropagation\(\);"/g, '(click)="toggleFolder(folder, $event); $event.stopPropagation();" (keydown.enter)="toggleFolder(folder, $event); $event.stopPropagation();" tabindex="0"');
content = content.replace(/\(click\)="toggleFolderExpand\(folder\.id, \$event\); \$event\.stopPropagation\(\);"/g, '(click)="toggleFolderExpand(folder.id, $event); $event.stopPropagation();" (keydown.enter)="toggleFolderExpand(folder.id, $event); $event.stopPropagation();" tabindex="0"');
content = content.replace(/\(click\)="toggleIdea\(idea, \$event\); \$event\.stopPropagation\(\);"/g, '(click)="toggleIdea(idea, $event); $event.stopPropagation();" (keydown.enter)="toggleIdea(idea, $event); $event.stopPropagation();" tabindex="0"');

content = content.replace(/\(click\)="onUpdate\(\{authType: 'soft'\}\)"/g, '(click)="onUpdate({authType: \'soft\'})" (keydown.enter)="onUpdate({authType: \'soft\'})" tabindex="0"');
content = content.replace(/\(click\)="onUpdate\(\{authType: 'hard', delegationIsAllowed: false\}\)"/g, '(click)="onUpdate({authType: \'hard\', delegationIsAllowed: false})" (keydown.enter)="onUpdate({authType: \'hard\', delegationIsAllowed: false})" tabindex="0"');
content = content.replace(/\(click\)="toggleDelegation\(\)"/g, '(click)="toggleDelegation()" (keydown.enter)="toggleDelegation()" tabindex="0"');

content = content.replace(/<label class="checkbox" \[class\.selected\]="isPredefinedSelected\(opt\)">\s*<span class="bold"/g, '<label class="checkbox" [class.selected]="isPredefinedSelected(opt)">\n                        <input type="checkbox" [checked]="isPredefinedSelected(opt)">\n                        <span class="bold"');
content = content.replace(/<label class="checkbox" \[class\.selected\]="isPredefinedSelected\('Neutral'\)">\s*<span class="bold"/g, '<label class="checkbox" [class.selected]="isPredefinedSelected(\'Neutral\')">\n                        <input type="checkbox" [checked]="isPredefinedSelected(\'Neutral\')">\n                        <span class="bold"');
content = content.replace(/<label class="checkbox" \[class\.selected\]="isPredefinedSelected\('Veto'\)">\s*<span class="bold"/g, '<label class="checkbox" [class.selected]="isPredefinedSelected(\'Veto\')">\n                        <input type="checkbox" [checked]="isPredefinedSelected(\'Veto\')">\n                        <span class="bold"');

content = content.replace(/<label class="checkbox" \[class\.selected\]="vote\(\)\.delegationIsAllowed">\s*<span class="bold"/g, '<label class="checkbox" [class.selected]="vote().delegationIsAllowed">\n              <input type="checkbox" [checked]="vote().delegationIsAllowed">\n              <span class="bold"');

fs.writeFileSync(file, content, 'utf8');
