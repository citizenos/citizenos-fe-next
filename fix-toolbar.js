const fs = require('fs');
let code = fs.readFileSync('src/app/shared/components/list-filter-toolbar/list-filter-toolbar.component.ts', 'utf8');

// The new template block we want
const targetHTML = `    <!-- Mobile specific filters styling matching citizenos-fe -->
    <div class="filter_dropdown mobile_show tablet_show">
      <div class="dropdown mobile_filters_selection" [ngClass]="{'dropdown_active': mobileFiltersOpen()}">
        <div class="selection" (click)="mobileFiltersOpen.set(!mobileFiltersOpen())">
          <div class="selected_item">{{ 'COMPONENTS.PUBLIC_TOPICS.LBL_FILTER' | translate | titlecase }}</div>
          <button type="button" class="btn_medium_plain icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M17 10L12 15L7 10" stroke="#2C3B47" stroke-width="2" stroke-linecap="round" />
            </svg>
          </button>
        </div>

        <div class="options filter_options">
          @for (filter of allFilters(); track filter.key) {
            <div class="filter_option">
              <span>{{ filter.placeholder | translate }}</span>
              <a class="bold" (click)="activeMobileFilter.set(filter.key)">
                @if (filter.selectedValue === 'all' || filter.selectedValue === '') {
                  <span>{{ 'VIEWS.GROUP.FILTER_ALL' | translate }}</span>
                }
                @if (filter.selectedValue !== 'all' && filter.selectedValue !== '') {
                  <span>{{ getActiveFilterText(filter) | translate }}</span>
                }
                <cos-icon name="chevron-right" [size]="24"></cos-icon>
              </a>
            </div>
          }
        </div>
      </div>

      <!--MOBILE_TOPIC_FILTERS-->
      @if (activeMobileFilter() !== null) {
        <div class="mobile_filter">
          <div class="options button_options">
            <label class="checkbox" (click)="selectFilter(activeMobileFilter()!, 'all')">
              <span>{{ 'TXT_TOPIC_STATUS_ALL' | translate }}</span>
              <input type="radio" [name]="activeMobileFilter()" [checked]="getActiveFilter(activeMobileFilter()!)?.selectedValue === 'all' || getActiveFilter(activeMobileFilter()!)?.selectedValue === ''">
              <span class="checkmark"></span>
            </label>
            @if (getActiveFilter(activeMobileFilter()!); as activeF) {
              @for (option of activeF.items; track option.value) {
                <label class="checkbox" (click)="selectFilter(activeF.key, option.value)">
                  <span>{{ option.title | translate }}</span>
                  <input type="radio" [name]="activeF.key" [checked]="activeF.selectedValue === option.value">
                  <span class="checkmark"></span>
                </label>
              }
            }
            <button type="button" class="btn_medium_secondary" (click)="activeMobileFilter.set(null)">{{ 'COMPONENTS.PUBLIC_TOPICS.BTN_APPLY' | translate }}</button>
          </div>
        </div>
      }
    </div>`;

const replacementHTML = `    <!-- Mobile specific filters styling matching citizenos-fe -->
    <div class="mobile_show tablet_show" id="mobile_filters">
      <div class="filter_dropdown_wrap" [ngClass]="{'open': mobileFiltersOpen()}" (click)="mobileFiltersOpen.set(!mobileFiltersOpen())">
        <div class="label">{{ 'COMPONENTS.PUBLIC_TOPICS.LBL_FILTER' | translate | titlecase }}</div>
        <div class="icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M17 10L12 15L7 10" stroke="#2C3B47" stroke-width="2" stroke-linecap="round" />
          </svg>
        </div>
      </div>
      
      @if (mobileFiltersOpen() && !activeMobileFilter()) {
        <div class="filter_dropdown">
          <div class="options">
            @for (filter of allFilters(); track filter.key) {
              <div class="filter_option" (click)="activeMobileFilter.set(filter.key)">
                <span>{{ filter.placeholder | translate }}</span>
                <a class="bold">
                  @if (filter.selectedValue === 'all' || filter.selectedValue === '') {
                    <span>{{ 'VIEWS.GROUP.FILTER_ALL' | translate }}</span>
                  }
                  @if (filter.selectedValue !== 'all' && filter.selectedValue !== '') {
                    <span>{{ getActiveFilterText(filter) | translate }}</span>
                  }
                  <cos-icon name="chevron-right" [size]="24"></cos-icon>
                </a>
              </div>
            }
          </div>
        </div>
      }

      @if (activeMobileFilter() !== null) {
        <div class="overlay" (click)="activeMobileFilter.set(null)"></div>
        <div class="mobile_filters_wrap active">
          <div class="options button_options">
            <label class="checkbox" (click)="selectFilter(activeMobileFilter()!, 'all')">
              <span>{{ 'TXT_TOPIC_STATUS_ALL' | translate | titlecase }}</span>
              <input type="radio" [name]="activeMobileFilter()" [checked]="getActiveFilter(activeMobileFilter()!)?.selectedValue === 'all' || getActiveFilter(activeMobileFilter()!)?.selectedValue === ''">
              <span class="checkmark"></span>
            </label>
            @if (getActiveFilter(activeMobileFilter()!); as activeF) {
              @for (option of activeF.items; track option.value) {
                <label class="checkbox" (click)="selectFilter(activeF.key, option.value)">
                  <span>{{ option.title | translate }}</span>
                  <input type="radio" [name]="activeF.key" [checked]="activeF.selectedValue === option.value">
                  <span class="checkmark"></span>
                </label>
              }
            }
            <button type="button" class="btn_medium_secondary" (click)="activeMobileFilter.set(null)">{{ 'COMPONENTS.PUBLIC_TOPICS.BTN_APPLY' | translate }}</button>
          </div>
        </div>
      }
    </div>`;

code = code.replace(targetHTML, replacementHTML);

const targetCSS = `    /* Mobile specific filters styling matching citizenos-fe */
    .filter_dropdown {
      display: none;
    }
    @media (max-width: 1024px) {
      .filter_dropdown {
        display: block;
        width: 100%;
        position: relative;
      }
      .mobile_filters_selection {
        background: var(--color-surfaces);
        border-radius: 16px;
        padding: 16px;
      }
      .mobile_filters_selection .selection {
        display: flex;
        justify-content: space-between;
        align-items: center;
        width: 100%;
        cursor: pointer;
      }
      .mobile_filters_selection .selected_item {
        font-size: 16px;
        font-weight: 600;
        color: var(--color-text);
      }
      .filter_options {
        display: none;
        flex-direction: column;
        gap: 16px;
        margin-top: 16px;
        padding-top: 16px;
        border-top: 1px solid var(--color-border);
      }
      .dropdown_active .filter_options {
        display: flex;
      }
      .filter_option {
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 16px;
        color: var(--color-text);
      }
      .filter_option a {
        display: flex;
        align-items: center;
        gap: 8px;
        color: var(--color-link);
        cursor: pointer;
      }
      .mobile_filter {
        position: fixed;
        bottom: 0;
        left: 0;
        width: 100%;
        background: var(--color-surfaces);
        border-radius: 16px 16px 0 0;
        padding: 24px;
        box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.1);
        z-index: 100;
      }
      .button_options {
        display: flex;
        flex-direction: column;
        gap: 16px;
      }
      .checkbox {
        display: flex;
        align-items: center;
        gap: 12px;
        cursor: pointer;
        font-size: 16px;
        padding: 8px 0;
      }
      .checkbox input[type="radio"] {
        display: none;
      }
      .checkmark {
        width: 24px;
        height: 24px;
        border-radius: 50%;
        border: 2px solid var(--color-border);
        position: relative;
      }
      .checkbox input:checked + .checkmark {
        border-color: var(--color-link);
      }
      .checkbox input:checked + .checkmark::after {
        content: '';
        position: absolute;
        width: 12px;
        height: 12px;
        background: var(--color-link);
        border-radius: 50%;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
      }
    }`;

const replacementCSS = `    /* Mobile specific filters styling matching citizenos-fe */
    #mobile_filters {
      width: 100%;
      position: relative;
    }
    .filter_dropdown_wrap {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px;
      background: var(--color-surfaces);
      border-radius: 16px;
      cursor: pointer;
    }
    .filter_dropdown_wrap.open {
      border-bottom-left-radius: 0;
      border-bottom-right-radius: 0;
    }
    .filter_dropdown_wrap .label {
      font-size: 16px;
      font-weight: 600;
      color: var(--color-text);
    }
    .filter_dropdown {
      background: var(--color-surfaces);
      border-radius: 0 0 16px 16px;
      padding: 0 16px 16px 16px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
      position: absolute;
      width: 100%;
      z-index: 10;
    }
    .filter_dropdown .options {
      display: flex;
      flex-direction: column;
      gap: 16px;
      padding-top: 16px;
      border-top: 1px solid var(--color-border);
    }
    .filter_option {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 16px;
      color: var(--color-text);
      cursor: pointer;
    }
    .filter_option a {
      display: flex;
      align-items: center;
      gap: 8px;
      color: var(--color-link);
    }
    .mobile_filters_wrap {
      position: fixed;
      bottom: 0;
      left: 0;
      width: 100%;
      background: var(--color-surfaces);
      border-radius: 16px 16px 0 0;
      padding: 24px;
      box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.1);
      z-index: 100;
      display: none;
    }
    .mobile_filters_wrap.active {
      display: block;
    }
    .overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0,0,0,0.5);
      z-index: 99;
    }
    .button_options {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    .checkbox {
      display: flex;
      align-items: center;
      gap: 12px;
      cursor: pointer;
      font-size: 16px;
      padding: 8px 0;
    }
    .checkbox input[type="radio"] {
      display: none;
    }
    .checkmark {
      width: 24px;
      height: 24px;
      border-radius: 50%;
      border: 2px solid var(--color-border);
      position: relative;
    }
    .checkbox input:checked + .checkmark {
      border-color: var(--color-link);
    }
    .checkbox input:checked + .checkmark::after {
      content: '';
      position: absolute;
      width: 12px;
      height: 12px;
      background: var(--color-link);
      border-radius: 50%;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
    }`;

code = code.replace(targetCSS, replacementCSS);
fs.writeFileSync('src/app/shared/components/list-filter-toolbar/list-filter-toolbar.component.ts', code);
