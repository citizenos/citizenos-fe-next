const fs = require('fs');
const html = fs.readFileSync('src/app/features/groups/group-detail/group-detail.component.html', 'utf8');
const lines = html.split('\n');
let divCount = 0;
lines.forEach((line, i) => {
  const opens = (line.match(/<div(\s|>)/g) || []).length;
  const closes = (line.match(/<\/div>/g) || []).length;
  if (opens || closes) {
    divCount += opens - closes;
    if (i >= 120 && i <= 220) console.log(`Line ${i+1}: +${opens} -${closes} = ${divCount}`);
  }
});
