import { Component, input, output, ChangeDetectionStrategy, model, computed } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';
import { Ideation } from '../../../../../core/interfaces/ideation';
import { ToggleComponent } from '../../../../../shared/components/toggle/toggle.component';
import { InputComponent } from '../../../../../shared/components/input/input.component';
import { UpperCasePipe } from '@angular/common';

@Component({
  selector: 'cos-step-ideation-settings',
  standalone: true,
  imports: [TranslateModule, FormsModule, InputComponent, ToggleComponent, UpperCasePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="step-container">
      <div class="create_content_section">
        <div class="number_wrap mobile_hidden">
          <div>1</div>
        </div>
        <div class="section_content_wrap">
          <div class="header_wrap">
            <div class="number_wrap mobile_show"><div>1</div></div>
            <div class="small_heading" translate="VIEWS.IDEATION_CREATE.SETTINGS_HEADING_IDEATION_QUESTION"></div>
          </div>
          <cos-input [placeholder]="'VIEWS.IDEATION_CREATE.SETTINGS_IDEATION_QUESTION_PLACEHOLDER' | translate">
            <textarea
              id="ideation-question"
              [(ngModel)]="ideation().question"
              (ngModelChange)="onIdeationUpdate()"
              rows="3"
            ></textarea>
          </cos-input>
        </div>
      </div>

      <div class="create_content_section">
        <div class="number_wrap mobile_hidden">
          <div>3</div>
        </div>
        <div class="section_content_wrap">
          <div class="header_wrap">
            <div class="number_wrap mobile_show"><div>3</div></div>
            <div class="small_heading" translate="VIEWS.IDEATION_CREATE.SETTINGS_HEADING_ADVANCED_SETTINGS"></div>
            <div class="mobile_hidden" translate="VIEWS.IDEATION_CREATE.SETTINGS_HEADING_ADVANCED_SETTINGS_DESC"></div>
          </div>
          <div class="mobile_show" translate="VIEWS.IDEATION_CREATE.SETTINGS_HEADING_IDEATION_DEADLINE_DESC"></div>

          <div class="radio_wrap anonymous_area ideation">
            <div class="radio_text_wrap">
              <div class="radio_lable_wrap setting_toggle">
                <span class="bold" translate="VIEWS.IDEATION_CREATE.LBL_ALLOW_ANONYMOUS" [translateParams]="{
                    value: (ideation().allowAnonymous ? 'TOGGLE_ON' : 'TOGGLE_OFF') | translate
                  }"></span>
                <cos-toggle [model]="ideation().allowAnonymous" (click)="onToggleAnonymous()"></cos-toggle>
              </div>
              <div class="radio_description">
                <span translate="VIEWS.IDEATION_CREATE.LBL_ALLOW_ANONYMOUS_DESC"></span>
              </div>
            </div>

            <div class="anonymous_area_wrap" [class.hidden]="!ideation().allowAnonymous">
              <div class="radio_lable_wrap setting_toggle">
                <span class="bold" translate="VIEWS.IDEATION_CREATE.DEMOGRAPHICS_DATA_TITLE"></span>
              </div>
              <div class="radio_description">
                <span translate="VIEWS.IDEATION_CREATE.DEMOGRAPHICS_DATA_DESCRIPTION"></span>
              </div>

              <div class="anonymous_area_options">
                @for (key of demographicKeys; track key) {
                  <label class="checkbox">
                    <span>{{ 'VIEWS.IDEATION_CREATE.DEMOGRAPHICS_DATA_' + key | uppercase | translate }}</span>
                    <input
                      type="checkbox"
                      [checked]="isDemographicRequired(key)"
                      (change)="toggleDemographic(key, $event)"
                    />
                    <span class="checkmark"></span>
                  </label>
                }
              </div>
            </div>
          </div>

          <div class="radio_wrap ideation" [class.disabled]="ideation().allowAnonymous">
            <div class="radio_text_wrap">
              <div class="radio_lable_wrap setting_toggle">
                <span class="bold" translate="VIEWS.IDEATION_CREATE.LBL_DISABLE_REPLIES" [translateParams]="{
                    value: (ideation().disableReplies ? 'TOGGLE_ON' : 'TOGGLE_OFF') | translate
                  }"></span>
                <cos-toggle [model]="ideation().disableReplies" [disabled]="!!ideation().allowAnonymous" (click)="onToggleReplies()"></cos-toggle>
              </div>
              <div class="radio_description">
                <span translate="VIEWS.IDEATION_CREATE.LBL_DISABLE_REPLIES_DESC"></span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .step-container { display: flex; flex-direction: column; gap: 32px; }
    
    .create_content_section {
      background: var(--color-surfaces);
      border-radius: 8px;
      padding: 24px;
      display: flex;
      flex-direction: row;
      gap: 16px;

      .number_wrap {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        background: var(--color-danger);
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 600;
      }
      
      .section_content_wrap {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 16px;

        .header_wrap {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .small_heading {
          font-weight: 600;
          font-size: 16px;
        }
      }
    }

    .radio_wrap {
      border: 1px solid var(--color-border);
      border-radius: 8px;
      padding: 16px;
      
      &.disabled {
        opacity: 0.5;
        pointer-events: none;
      }
    }

    .radio_text_wrap {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .setting_toggle {
      display: flex;
      justify-content: space-between;
      align-items: center;
      .bold { font-weight: 600; }
    }

    .radio_description {
      font-size: 14px;
      color: var(--color-text-muted);
    }

    .anonymous_area_wrap {
      margin-top: 24px;
      border-top: 1px solid var(--color-border);
      padding-top: 24px;
      display: flex;
      flex-direction: column;
      gap: 8px;

      &.hidden { display: none; }
    }

    .anonymous_area_options {
      display: flex;
      gap: 16px;
      flex-wrap: wrap;
      margin-top: 8px;

      .checkbox {
        display: flex;
        align-items: center;
        gap: 8px;
        cursor: pointer;
        position: relative;
        padding-left: 28px;

        input {
          position: absolute;
          opacity: 0;
          cursor: pointer;
          height: 0;
          width: 0;
        }

        .checkmark {
          position: absolute;
          top: 0;
          left: 0;
          height: 20px;
          width: 20px;
          background-color: var(--color-surfaces);
          border: 1px solid var(--color-border-bold);
          border-radius: 4px;
        }

        &:hover input ~ .checkmark {
          background-color: var(--color-background);
        }

        input:checked ~ .checkmark {
          background-color: var(--color-link);
          border-color: var(--color-link);
        }

        .checkmark:after {
          content: "";
          position: absolute;
          display: none;
        }

        input:checked ~ .checkmark:after {
          display: block;
        }

        .checkmark:after {
          left: 6px;
          top: 2px;
          width: 5px;
          height: 10px;
          border: solid white;
          border-width: 0 2px 2px 0;
          transform: rotate(45deg);
        }
      }
    }
  `]
})
export class StepIdeationSettingsComponent {
  ideation = model.required<Partial<Ideation>>();
  ideationUpdate = output<Partial<Ideation>>();

  demographicKeys = ['age', 'gender', 'residence', 'education'];

  onIdeationUpdate() {
    this.ideationUpdate.emit(this.ideation());
  }

  onToggleAnonymous() {
    const current = this.ideation();
    this.ideation.update(i => ({
      ...i,
      allowAnonymous: !current.allowAnonymous,
      disableReplies: !current.allowAnonymous ? true : current.disableReplies
    }));
    this.onIdeationUpdate();
  }

  onToggleReplies() {
    if (this.ideation().allowAnonymous) return;
    this.ideation.update(i => ({
      ...i,
      disableReplies: !i.disableReplies
    }));
    this.onIdeationUpdate();
  }

  isDemographicRequired(key: string): boolean {
    const config = this.ideation().demographicsConfig as any;
    return config && config[key] && config[key].required;
  }

  toggleDemographic(key: string, event: any) {
    const checked = event.target.checked;
    let config = this.ideation().demographicsConfig as any || {};
    
    config = {
      ...config,
      [key]: { required: checked }
    };
    
    this.ideation.update(i => ({
      ...i,
      demographicsConfig: config
    }));
    this.onIdeationUpdate();
  }
}

