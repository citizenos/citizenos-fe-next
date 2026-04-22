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
const tsFiles = allFiles.filter(f => f.endsWith('.ts'));
const htmlFiles = allFiles.filter(f => f.endsWith('.html'));

tsFiles.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/import \{ AuthService \} from '.*?auth\.service';/g, "import { UserStore } from '../../../../../core/state/user.store';");
  // Also we have some imports with different levels of ../
  content = content.replace(/import \{ AuthService \}.*?;/g, "import { UserStore } from '../../../../../core/state/user.store';");
  
  content = content.replace(/auth = inject<any>\(AuthService\);/g, "userStore = inject(UserStore);");
  content = content.replace(/auth = inject\(AuthService\);/g, "userStore = inject(UserStore);");
  
  content = content.replace(/get isLoggedIn\(\) \{\s+return this\.auth\.loggedIn\$\(\);\s+\}/g, "get isLoggedIn() { return this.userStore.isAuthenticated; }");
  
  content = content.replace(/AuthService/g, "UserStore");
  content = content.replace(/mockAuthService/g, "mockUserStore");

  // Fix the "any" injected type if any
  content = content.replace(/auth = inject<any>\(UserStore\);/g, "userStore = inject(UserStore);");
  content = content.replace(/mockUserStore = {\s+loggedIn\$: \(\) => true\s+};/g, 'mockUserStore = {\n    isAuthenticated: () => true\n  };');
  
  // Also fix imports array for components
  // In topic-view.component.ts I had `../../../core` for paths.
  content = content.replace(/\.\.\/\.\.\/\.\.\/\.\.\/core\/state\/user\.store/g, '../../../core/state/user.store');
  // I also have `../../../core/interfaces/topic` etc to fix in topic-view.component.ts.
  
  if (file.endsWith('topic-view.component.ts')) {
    content = content.replace(/\.\.\/\.\.\/\.\.\/\.\.\/core/g, '../../../core');
  }
  if (file.endsWith('topic-view.component.spec.ts')) {
    content = content.replace(/\.\.\/\.\.\/\.\.\/\.\.\/core/g, '../../../core');
  }

  // Same for topic-state-items.spec.ts, which error TS2307: Cannot find module
  // `../../../../../core/state/user.store` may be correct.
  
  fs.writeFileSync(file, content);
});

htmlFiles.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/isLoggedIn \| async/g, "isLoggedIn()");
  fs.writeFileSync(file, content);
});
console.log('Fixed UserStore replacements');
