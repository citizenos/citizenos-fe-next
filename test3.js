const fs = require('fs');
const oldCode = fs.readFileSync('/home/ilmar/citizenos/citizenos-fe/src/app/topic/components/topic-arguments/topic-arguments.component.ts', 'utf8');
const countTreeCode = oldCode.substring(oldCode.indexOf('const countTree ='), oldCode.indexOf('results.forEach((row: any,)'));
console.log(countTreeCode);
