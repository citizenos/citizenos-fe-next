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

const allFiles = walk('/home/ilmar/citizenos/citizenos-fe-next/src/app/features/topics/topic-view');

const specFiles = allFiles.filter(f => f.endsWith('.spec.ts'));
specFiles.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    
    // Add import { vi } from 'vitest';
    if (!content.includes("from 'vitest'")) {
        content = "import { vi } from 'vitest';\n" + content;
    }

    content = content.replace(/jasmine\.createSpy\('.*?'\)/g, 'vi.fn()');
    content = content.replace(/spyOn\(/g, 'vi.spyOn(');
    content = content.replace(/\.toBeFalse\(\)/g, '.toBeFalsy()');
    
    fs.writeFileSync(file, content);
});

allFiles.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    if (file.includes('components/')) {
        content = content.replace(/\.\.\/\.\.\/\.\.\/\.\.\/core\/state\/user\.store/g, '../../../../../core/state/user.store');
    }

    if (file.endsWith('topic-view.component.html')) {
        content = content.replace(/topic\(\)\.status/g, 'topic()?.status');
    }

    if (file.endsWith('topic-view.component.ts')) {
        content = content.replace(/@HostListener\('window:resize', \['\$event'\]\)/g, "@HostListener('window:resize')");
    }

    fs.writeFileSync(file, content);
});

console.log('Fixed vitest spec files and paths');
