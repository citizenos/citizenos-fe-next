import { Pipe, PipeTransform } from '@angular/core';
import { marked } from 'marked';

@Pipe({
  name: 'markdown',
  standalone: true
})
export class MarkdownPipe implements PipeTransform {
  transform(input: string | null | undefined): string {
    if (!input) return '';
    
    const renderer = new marked.Renderer();
    renderer.code = ({ text }: { text: string }) => {
      return `<code>${text}</code>`;
    };
    renderer.heading = ({ depth, text }: import('marked').Tokens.Heading) => {
      return `<h${depth}>${text}</h${depth}>`;
    };
    
    marked.use({ renderer });
    const html = marked.parse(input) as string;
    const processedHtml = html.replace(/<a/gi, '<a target="_blank"');
    return processedHtml;
  }
}
