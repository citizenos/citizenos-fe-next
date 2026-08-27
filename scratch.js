const fs = require('fs');
const content = fs.readFileSync('src/app/shared/components/icon/icon-data.ts', 'utf8');
const matches = content.match(/\[\s*'topic-tab-[a-z-]+'\s*,\s*\{.*?\}\s*\]/gs);
if (matches) {
  matches.forEach(m => console.log(m.substring(0, 50) + '...'));
}
