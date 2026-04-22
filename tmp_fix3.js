const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.resolve(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(file));
        } else {
            results.push(file);
        }
    });
    return results;
}

const allFiles = walk('/home/ilmar/citizenos/citizenos-fe-next/src/app/features/topics');

const scssFiles = allFiles.filter(f => f.endsWith('.scss'));
scssFiles.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    
    content = content.replace(/@include h1;/g, '/* @include h1; */');
    content = content.replace(/@include h2;/g, '/* @include h2; */');
    content = content.replace(/@include tabs_tablet;/g, '/* @include tabs_tablet; */');
    
    fs.writeFileSync(file, content);
});

console.log('Fixed SCSS files');
