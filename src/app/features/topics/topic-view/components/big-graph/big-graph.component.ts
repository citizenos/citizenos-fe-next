import { Component, input, computed, ChangeDetectionStrategy } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-big-graph',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslateModule],
  templateUrl: './big-graph.component.html'
})
export class BigGraphComponent {
  options = input.required<{ rows: any[] }>();

  sortedOptions = computed(() =>
    [...(this.options().rows ?? [])].sort((a, b) => {
      const aCount = a['voteCount'] || 0;
      const bCount = b['voteCount'] || 0;
      return aCount < bCount ? 1 : aCount === bCount ? 0 : -1;
    })
  );

  getVoteCountTotal(): number {
    return (this.options().rows ?? []).reduce((sum, o) => sum + (o.voteCount || 0), 0);
  }

  getVoteValuePercentage(value: number): string {
    const total = this.getVoteCountTotal();
    if (!total || !value || value < 1) return '0';
    return `${(value / total) * 100}%`;
  }
}
