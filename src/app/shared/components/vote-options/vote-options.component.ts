import { Component, input, output, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { VoteOption } from '../../../core/interfaces/vote';
import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'cos-vote-options',
  standalone: true,
  imports: [CommonModule, TranslateModule, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './vote-options.component.html',
  styleUrls: ['./vote-options.component.scss']
})
export class VoteOptionsComponent {
  options = input.required<VoteOption[]>();
  maxChoices = input<number>(1);
  disabled = input<boolean>(false);
  canVote = input<boolean>(true);
  showLockIcon = input<boolean>(false);
  selectionChange = output<VoteOption>();
  viewIdea = output<VoteOption>();

  isSelected(opt: VoteOption): boolean {
    return !!opt.selected;
  }

  toggleOption(opt: VoteOption) {
    if (!this.disabled() && this.canVote()) {
      this.selectionChange.emit(opt);
    }
  }
}
