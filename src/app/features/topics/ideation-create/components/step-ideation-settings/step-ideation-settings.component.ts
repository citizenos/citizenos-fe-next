import { Component, model, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';
import { Ideation } from '../../../../../core/interfaces/ideation';
import { InputComponent } from '../../../../../shared/components/input/input.component';
import { ToggleComponent } from '../../../../../shared/components/toggle/toggle.component';
import { MarkdownDirective } from '../../../../../shared/directives/markdown.directive';
import { DeadlinePickerComponent } from '../../../../../shared/components/deadline-picker/deadline-picker.component';

@Component({
  selector: 'cos-step-ideation-settings',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    FormsModule,
    InputComponent,
    ToggleComponent,
    MarkdownDirective,
    DeadlinePickerComponent
  ],
  template: `
    <div class="step-container">
      <div class="create_content_section">
        <div class="number_wrap mobile_hidden">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="16" height="16" rx="8" fill="white" />
            <path d="M12.6558 9.32812C11.2233 8.52002 9.79067 7.71195 8.35815 6.90385C8.47123 7.10587 8.5843 7.30788 8.71632 7.4916V7.47328C8.71632 7.2345 8.58432 6.99582 8.35815 6.88553C6.92564 6.07743 5.49303 5.26936 4.06051 4.46126C3.26884 4.02046 2.55253 5.21426 3.3442 5.65493C4.77672 6.46303 6.20933 7.2711 7.64185 8.0792C7.52877 7.87718 7.41569 7.67517 7.28368 7.49145V7.50977C7.28368 7.74856 7.41569 7.98723 7.64185 8.09752C9.07436 8.90563 10.507 9.71369 11.9395 10.5218C12.7312 10.9626 13.4475 9.76892 12.6558 9.32812Z" fill="#EF4025" />
            <path d="M8.71632 7.4916L8.71634 2.66112C8.71634 1.77963 7.30264 1.77963 7.30264 2.66112V7.49117C7.30264 8.3728 8.71632 8.37323 8.71632 7.4916Z" fill="#EF4025" />
            <path d="M8.71627 12.3388V7.50873C8.71627 6.62723 7.30257 6.62723 7.30257 7.50873V12.3388C7.30257 13.2204 8.71627 13.2204 8.71627 12.3388Z" fill="#EF4025" />
            <path d="M4.06051 10.5208C6.92563 8.90464 9.7907 7.28856 12.6558 5.69076C13.4475 5.24996 12.7311 4.05625 11.9395 4.49708C9.07435 6.11326 6.20929 7.72933 3.3442 9.32714C2.55253 9.76783 3.26886 10.9615 4.06051 10.5208Z" fill="#EF4025" />
          </svg>
          <div>1</div>
        </div>
        <div class="section_content_wrap">
          <div class="header_wrap">
            <div class="number_wrap mobile_show">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="16" height="16" rx="8" fill="white" />
            <path d="M12.6558 9.32812C11.2233 8.52002 9.79067 7.71195 8.35815 6.90385C8.47123 7.10587 8.5843 7.30788 8.71632 7.4916V7.47328C8.71632 7.2345 8.58432 6.99582 8.35815 6.88553C6.92564 6.07743 5.49303 5.26936 4.06051 4.46126C3.26884 4.02046 2.55253 5.21426 3.3442 5.65493C4.77672 6.46303 6.20933 7.2711 7.64185 8.0792C7.52877 7.87718 7.41569 7.67517 7.28368 7.49145V7.50977C7.28368 7.74856 7.41569 7.98723 7.64185 8.09752C9.07436 8.90563 10.507 9.71369 11.9395 10.5218C12.7312 10.9626 13.4475 9.76892 12.6558 9.32812Z" fill="#EF4025" />
            <path d="M8.71632 7.4916L8.71634 2.66112C8.71634 1.77963 7.30264 1.77963 7.30264 2.66112V7.49117C7.30264 8.3728 8.71632 8.37323 8.71632 7.4916Z" fill="#EF4025" />
            <path d="M8.71627 12.3388V7.50873C8.71627 6.62723 7.30257 6.62723 7.30257 7.50873V12.3388C7.30257 13.2204 8.71627 13.2204 8.71627 12.3388Z" fill="#EF4025" />
            <path d="M4.06051 10.5208C6.92563 8.90464 9.7907 7.28856 12.6558 5.69076C13.4475 5.24996 12.7311 4.05625 11.9395 4.49708C9.07435 6.11326 6.20929 7.72933 3.3442 9.32714C2.55253 9.76783 3.26886 10.9615 4.06051 10.5208Z" fill="#EF4025" />
          </svg>
              <div>1</div>
            </div>
            <div class="small_heading" translate="VIEWS.IDEATION_CREATE.SETTINGS_HEADING_IDEATION_QUESTION"></div>
            <div class="mobile_hidden" translate="VIEWS.IDEATION_CREATE.SETTINGS_HEADING_IDEATION_QUESTION_DESC"></div>
          </div>
          <div class="mobile_show" translate="VIEWS.IDEATION_CREATE.SETTINGS_HEADING_IDEATION_QUESTION_DESC"></div>
          
          <cos-input [placeholder]="'VIEWS.IDEATION_CREATE.SETTINGS_IDEATION_QUESTION_PLACEHOLDER' | translate">
            <input
              type="text"
              id="ideation-question"
              [(ngModel)]="ideation().question"
              (ngModelChange)="onIdeationUpdate()"
            />
          </cos-input>
        </div>
      </div>

      <div class="create_content_section">
        <div class="number_wrap mobile_hidden">
          <div>2</div>
        </div>
        <div class="section_content_wrap">
          <div class="header_wrap">
            <div class="number_wrap mobile_show"><div>2</div></div>
            <div class="small_heading" translate="VIEWS.IDEATION_CREATE.SETTINGS_HEADING_IDEATION_DEADLINE"></div>
            <div class="mobile_hidden" translate="VIEWS.IDEATION_CREATE.SETTINGS_HEADING_IDEATION_DEADLINE_DESC"></div>
          </div>
          <div class="mobile_show" translate="VIEWS.IDEATION_CREATE.SETTINGS_HEADING_IDEATION_DEADLINE_DESC"></div>
          
          <cos-deadline-picker
            theme="ideation"
            [deadline]="getDeadlineDate()"
            [showReminder]="false"
            [toggleLabel]="'VIEWS.IDEATION_CREATE.SETTINGS_HEADING_IDEATION_DEADLINE'"
            (deadlineChange)="onDeadlineChange($event)"
          ></cos-deadline-picker>
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
          <div class="mobile_show" translate="VIEWS.IDEATION_CREATE.SETTINGS_HEADING_ADVANCED_SETTINGS_DESC"></div>

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

          <div class="radio_wrap template_area ideation">
            <div class="radio_text_wrap">
              <div class="radio_lable_wrap setting_toggle">
                <span class="bold" translate="VIEWS.IDEATION_CREATE.LBL_CREATE_ITEA_TEMPLATE" [translateParams]="{
                    value: (enableTemplate() ? 'TOGGLE_ON' : 'TOGGLE_OFF') | translate
                  }"></span>
                <cos-toggle [model]="enableTemplate()" (click)="onToggleTemplate()"></cos-toggle>
              </div>
              <div class="radio_description">
                <span translate="VIEWS.IDEATION_CREATE.LBL_CREATE_ITEA_TEMPLATE_DESC"></span>
              </div>
            </div>

            <div class="template_area_wrap" [class.hidden]="!enableTemplate()">
              <textarea
                cosMarkdown
                [limit]="0"
                name="idea_template"
                id="idea_template"
                [item]="ideation().template || ''"
                (itemChange)="updateTemplate($event)"
                [placeholder]="'COMPONENTS.ADD_IDEA.PLACEHOLDER_EXPLAIN_YOUR_IDEA' | translate"
              ></textarea>
            </div>
          </div>

        </div>
      </div>
    </div>
  `,
  styleUrl: './step-ideation-settings.component.scss'
})
export class StepIdeationSettingsComponent {
  ideation = model.required<Partial<Ideation>>();
  ideationUpdate = output<Partial<Ideation>>();

  demographicKeys = ['age', 'gender', 'residence', 'education'];

  getDeadlineDate(): Date | null {
    const d = this.ideation().deadline;
    return d ? new Date(d) : null;
  }

  onDeadlineChange(date: Date | null) {
    this.ideation.update(i => ({
      ...i,
      deadline: date ? date.toISOString() : null
    }));
    this.onIdeationUpdate();
  }

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

  enableTemplate(): boolean {
    return !!this.ideation().template;
  }

  onToggleTemplate() {
    const current = this.ideation();
    this.ideation.update(i => ({
      ...i,
      template: current.template ? null : ''
    }));
    this.onIdeationUpdate();
  }

  updateTemplate(content: string) {
    this.ideation.update(i => ({
      ...i,
      template: content
    }));
    this.onIdeationUpdate();
  }

  isDemographicRequired(key: string): boolean {
    const config = this.ideation().demographicsConfig;
    return !!(config && config[key] && config[key].required);
  }

  toggleDemographic(key: string, event: Event) {
    const target = event.target as HTMLInputElement;
    const checked = target.checked;
    let config = this.ideation().demographicsConfig || {};
    
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
