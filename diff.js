const fs = require('fs');
const oldCode = fs.readFileSync('/home/ilmar/citizenos/citizenos-fe/src/app/topic/components/topic-arguments/topic-arguments.component.ts', 'utf8');
const oldTree = oldCode.substring(oldCode.indexOf('const countTree ='), oldCode.indexOf('results.forEach((row: any,)'));
const newCode = fs.readFileSync('src/app/core/services/topic-argument.service.ts', 'utf8');
const newTree = newCode.substring(newCode.indexOf('const countTree ='), newCode.indexOf('results.forEach((row: any)'));
console.log("OLD:\n" + oldTree);
console.log("NEW:\n" + newTree);
