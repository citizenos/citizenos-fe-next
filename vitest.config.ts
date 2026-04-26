import { defineConfig, Plugin } from 'vitest/config';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';

function angularInlineResources(): Plugin {
  return {
    name: 'angular-inline-resources',
    transform(code: string, id: string) {
      if (!id.endsWith('.ts') || (!code.includes('templateUrl') && !code.includes('styleUrls') && !code.includes('styleUrl'))) {
        return;
      }

      let result = code;

      result = result.replace(/templateUrl:\s*['"`]([^'"`]+)['"`]/g, (_, url) => {
        try {
          const path = join(dirname(id), url);
          const content = readFileSync(path, 'utf8').replace(/`/g, '\\`').replace(/\$\{/g, '\\${');
          return `template: \`${content}\``;
        } catch {
          return `template: ''`;
        }
      });

      result = result.replace(/styleUrls:\s*\[[^\]]*\]/gs, 'styles: []');
      result = result.replace(/styleUrl:\s*['"`][^'"`]*['"`]/g, 'styles: []');

      return result;
    }
  };
}

export default defineConfig({
  plugins: [angularInlineResources()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test-setup.ts'],
  },
});
