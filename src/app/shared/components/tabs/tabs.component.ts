import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { IconComponent } from '../icon/icon.component';
import { IconName } from '../icon/icon.registry';

export interface TabItem {
  id: string;
  label: string;
  icon?: IconName;
}

@Component({
  selector: 'cos-tabs',
  standalone: true,
  imports: [CommonModule, TranslateModule, IconComponent],
  templateUrl: './tabs.component.html',
  styleUrl: './tabs.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CosTabsComponent {
  tabs = input.required<TabItem[]>();
  activeTab = input<string>();
  
  select = output<string>();

  onTabSelect(tabId: string) {
    this.select.emit(tabId);
  }
}
