import os

html = """<div class="page_content">
  <div id="page_header">
    <div id="user_info_area">
      <div class="small_heading" [innerHTML]="'COMPONENTS.PUBLIC_TOPICS.HEADER' | translate"></div>
    </div>
    <div id="buttons_area">
      <button id="show_search" class="btn_medium_close icon" (click)="app.showSearch.set(!app.showSearch())">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path fill-rule="evenodd" clip-rule="evenodd"
            d="M14.1922 15.6064C13.0236 16.4816 11.5723 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10C17 11.5723 16.4816 13.0236 15.6064 14.1922L19.7071 18.2929C20.0976 18.6834 20.0976 19.3166 19.7071 19.7071C19.3166 20.0976 18.6834 20.0976 18.2929 19.7071L14.1922 15.6064ZM15 10C15 12.7614 12.7614 15 10 15C7.23858 15 5 12.7614 5 10C5 7.23858 7.23858 5 10 5C12.7614 5 15 7.23858 15 10Z"
            fill="#727C84" />
        </svg>
      </button>

      @if (auth.loggedIn$ | async) {
        <cos-activities-button></cos-activities-button>
      }
    </div>
  </div>
  <div id="page_filters_wrap">
    <div id="options_area" [@openClose]="moreFilters() ? 'open' : 'closed'" class="mobile_hidden">
      <div class="options_row" [class.open]="moreFilters()" [class.closed]="!moreFilters()">

        @for (filterKey of filterKeys(); track filterKey) {
          <cos-input [placeholder]="filtersData()[filterKey].placeholder | translate" class="dropdown_input">
            <div class="dropdown" [cosDropdown]>
              <div class="selection">
                <div class="selected_item">
                  @switch (filterKey) {
                    @case ('status') { <span>{{ getActiveFilterText('status', filtersData().status.selectedValue) | uppercase | translate | titlecase }}</span> }
                    @case ('category') { <span>{{ getActiveFilterText('category', filtersData().category.selectedValue) | uppercase | translate }}</span> }
                    @default { <span>{{ getActiveFilterText(filterKey, filtersData()[filterKey].selectedValue) | translate }}</span> }
                  }
                </div>
                <div>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M17 10L12 15L7 10" stroke="#2C3B47" stroke-width="2" stroke-linecap="round" />
                  </svg>
                </div>
              </div>
              <div class="options">
                @for (option of filtersData()[filterKey].items; track option.value) {
                  <div class="option" (click)="setFilterValue(filterKey, option.value)">
                    @switch (filterKey) {
                      @case ('status') { <span>{{ option.title | uppercase | translate | titlecase }}</span> }
                      @case ('category') { <span>{{ option.title | uppercase | translate }}</span> }
                      @default { <span>{{ option.title | translate }}</span> }
                    }
                  </div>
                }
              </div>
            </div>
          </cos-input>
        }

        <div class="input_area">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path fill-rule="evenodd" clip-rule="evenodd"
              d="M14.1922 15.6064C13.0236 16.4816 11.5723 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10C17 11.5723 16.4816 13.0236 15.6064 14.1922L19.7071 18.2929C20.0976 18.6834 20.0976 19.3166 19.7071 19.7071C19.3166 20.0976 18.6834 20.0976 18.2929 19.7071L14.1922 15.6064ZM15 10C15 12.7614 12.7614 15 10 15C7.23858 15 5 12.7614 5 10C5 7.23858 7.23858 5 10 5C12.7614 5 15 7.23858 15 10Z"
              fill="#727C84" />
          </svg>
          <cos-input [placeholder]="'COMPONENTS.PUBLIC_TOPICS.PLACEHOLDER_SEARCH' | translate">
            <input type="text" [ngModel]="searchInput()" (ngModelChange)="doSearch($event)"
              [placeholder]="'COMPONENTS.PUBLIC_TOPICS.PLACEHOLDER_SEARCH' | translate">
          </cos-input>
          @if (searchInput()) {
            <a class="clear_search" translate="COMPONENTS.PUBLIC_TOPICS.LNK_CLEAR" (click)="doSearch('')"></a>
          }
        </div>
      </div>
    </div>
    <div class="filter_control_buttons mobile_hidden">
      <button class="btn_big_secondary" [class.flip]="moreFilters()" (click)="moreFilters.set(!moreFilters())">
        <div class="btn_icon"><svg width="24" height="24" viewBox="0 0 24 24" fill="none"
            xmlns="http://www.w3.org/2000/svg">
            <path d="M17 10L12 15L7 10" stroke="#2C3B47" stroke-width="2" stroke-linecap="round" />
          </svg>
        </div>
      </button>
      @if (moreFilters()) {
        <button class="btn_big_secondary icon" (click)="doClearFilters()">
          <svg width="25" height="24" viewBox="0 0 25 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M12.4999 7L12.4999 5.0001C10.7069 5.0001 8.91716 5.68333 7.55013 7.05036C5.05581 9.54468 4.83742 13.4531 6.89495 16.195C7.22643 16.6368 7.23355 17.2664 6.84302 17.657C6.4525 18.0475 5.81399 18.0504 5.46866 17.6194C2.6374 14.0857 2.85982 8.91224 6.13592 5.63614C7.89308 3.87898 10.1981 3.0001 12.4999 3.0001L12.4999 1L16.4999 4L12.4999 7Z"
              fill="#2C3B47" />
            <path
              d="M12.4999 19.0001C14.2929 19.0001 16.0826 18.3169 17.4496 16.9499C19.9439 14.4555 20.1623 10.5471 18.1048 7.80519C17.7733 7.36345 17.7662 6.73377 18.1567 6.34325C18.5473 5.95273 19.1858 5.94982 19.5311 6.38083C22.3624 9.91455 22.1399 15.088 18.8638 18.3641C17.1067 20.1212 14.8016 21.0001 12.4999 21.0001L12.4999 23L8.49988 20L12.4999 17L12.4999 19.0001Z"
              fill="#2C3B47" />
          </svg>
        </button>
      }
    </div>
    <div class="dropdown mobile_filters_selection mobile_show" [class.dropdown_active]="mobileFiltersList()">
      <div class="selection" (click)="mobileFiltersList.set(!mobileFiltersList())">
        <div class="selected_item" [innerHtml]="'COMPONENTS.PUBLIC_TOPICS.LBL_FILTER' | translate | titlecase"> </div>
        <button class="btn_medium_plain icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M17 10L12 15L7 10" stroke="#2C3B47" stroke-width="2" stroke-linecap="round" />
          </svg>
        </button>
      </div>

      <div class="options filter_options">
        @for (filterKey of filterKeys(); track filterKey) {
          <a class="filter_option" (click)="setMobileOpen(filterKey)">
            <span class="filter_option_text">{{ filtersData()[filterKey].placeholder | translate }}</span>
            @switch (filterKey) {
              @case ('status') { <span class="bold">{{ getActiveFilterText('status', filtersData().status.selectedValue) | uppercase | translate | titlecase }}</span> }
              @case ('category') { <span class="bold">{{ getActiveFilterText('category', filtersData().category.selectedValue) | uppercase | translate }}</span> }
              @default { <span class="bold">{{ getActiveFilterText(filterKey, filtersData()[filterKey].selectedValue) | translate }}</span> }
            }
          </a>
        }

        <button (click)="doClearFilters()" class="btn_medium_plain">
          <svg width="25" height="24" viewBox="0 0 25 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M12.4999 7L12.4999 5.0001C10.7069 5.0001 8.91716 5.68333 7.55013 7.05036C5.05581 9.54468 4.83742 13.4531 6.89495 16.195C7.22643 16.6368 7.23355 17.2664 6.84302 17.657C6.4525 18.0475 5.81399 18.0504 5.46866 17.6194C2.6374 14.0857 2.85982 8.91224 6.13592 5.63614C7.89308 3.87898 10.1981 3.0001 12.4999 3.0001L12.4999 1L16.4999 4L12.4999 7Z"
              fill="#2C3B47" />
            <path
              d="M12.4999 19.0001C14.2929 19.0001 16.0826 18.3169 17.4496 16.9499C19.9439 14.4555 20.1623 10.5471 18.1048 7.80519C17.7733 7.36345 17.7662 6.73377 18.1567 6.34325C18.5473 5.95273 19.1858 5.94982 19.5311 6.38083C22.3624 9.91455 22.1399 15.088 18.8638 18.3641C17.1067 20.1212 14.8016 21.0001 12.4999 21.0001L12.4999 23L8.49988 20L12.4999 17L12.4999 19.0001Z"
              fill="#2C3B47" />
          </svg>
          <span translate="COMPONENTS.PUBLIC_TOPICS.BTN_RESET_FILTERS"></span>
        </button>
        <div class="input_area">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path fill-rule="evenodd" clip-rule="evenodd"
              d="M14.1922 15.6064C13.0236 16.4816 11.5723 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10C17 11.5723 16.4816 13.0236 15.6064 14.1922L19.7071 18.2929C20.0976 18.6834 20.0976 19.3166 19.7071 19.7071C19.3166 20.0976 18.6834 20.0976 18.2929 19.7071L14.1922 15.6064ZM15 10C15 12.7614 12.7614 15 10 15C7.23858 15 5 12.7614 5 10C5 7.23858 7.23858 5 10 5C12.7614 5 15 7.23858 15 10Z"
              fill="#727C84" />
          </svg>
          <cos-input [placeholder]="'COMPONENTS.PUBLIC_TOPICS.PLACEHOLDER_SEARCH' | translate">
            <input type="text" [ngModel]="searchInput()" (ngModelChange)="doSearch($event)"
              [placeholder]="'COMPONENTS.PUBLIC_TOPICS.PLACEHOLDER_SEARCH' | translate">
          </cos-input>
        </div>
      </div>
    </div>

    @if (hasMobileOpen()) {
      <div class="overlay" (click)="closeMobileFilter()"></div>
    }

    <div class="mobile_filters_wrap" [class.active]="hasMobileOpen()">
      @for (filterKey of filterKeys(); track filterKey) {
        @if (filtersData()[filterKey].isMobileOpen) {
          <div class="options button_options">
            @switch (filterKey) {
              @case ('country') {
                <cos-typeahead class="dropdown dropdown_input dropdown_wrapper" activeClass="dropdown_active" [term]="countrySearch()" [placeholder]="'VIEWS.MY_TOPICS.FILTER_COUNTRY' | translate" (search)="searchCountry($event)">
                  <a class="btn_medium_close icon" (click)="closeMobileFilter()">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M6.70711 5.29289C6.31658 4.90237 5.68342 4.90237 5.29289 5.29289C4.90237 5.68342 4.90237 6.31658 5.29289 6.70711L10.5858 12L5.29289 17.2929C4.90237 17.6834 4.90237 18.3166 5.29289 18.7071C5.68342 19.0976 6.31658 19.0976 6.70711 18.7071L12 13.4142L17.2929 18.7071C17.6834 19.0976 18.3166 19.0976 18.7071 18.7071C19.0976 18.3166 19.0976 17.6834 18.7071 17.2929L13.4142 12L18.7071 6.70711C19.0976 6.31658 19.0976 5.68342 18.7071 5.29289C18.3166 4.90237 17.6834 4.90237 17.2929 5.29289L12 10.5858L6.70711 5.29289Z" fill="#2C3B47" />
                    </svg>
                  </a>
                </cos-typeahead>
              }
              @case ('language') {
                <cos-typeahead class="dropdown dropdown_input dropdown_wrapper" activeClass="dropdown_active" [term]="languageSearch()" [placeholder]="'VIEWS.MY_TOPICS.FILTER_LANGUAGE' | translate" (search)="searchLanguage($event)">
                  <a class="btn_medium_close icon" (click)="closeMobileFilter()">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M6.70711 5.29289C6.31658 4.90237 5.68342 4.90237 5.29289 5.29289C4.90237 5.68342 4.90237 6.31658 5.29289 6.70711L10.5858 12L5.29289 17.2929C4.90237 17.6834 4.90237 18.3166 5.29289 18.7071C5.68342 19.0976 6.31658 19.0976 6.70711 18.7071L12 13.4142L17.2929 18.7071C17.6834 19.0976 18.3166 19.0976 18.7071 18.7071C19.0976 18.3166 19.0976 17.6834 18.7071 17.2929L13.4142 12L18.7071 6.70711C19.0976 6.31658 19.0976 5.68342 18.7071 5.29289C18.3166 4.90237 17.6834 4.90237 17.2929 5.29289L12 10.5858L6.70711 5.29289Z" fill="#2C3B47" />
                    </svg>
                  </a>
                </cos-typeahead>
              }
              @default {
                <a class="btn_medium_close icon" (click)="closeMobileFilter()">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M6.70711 5.29289C6.31658 4.90237 5.68342 4.90237 5.29289 5.29289C4.90237 5.68342 4.90237 6.31658 5.29289 6.70711L10.5858 12L5.29289 17.2929C4.90237 17.6834 4.90237 18.3166 5.29289 18.7071C5.68342 19.0976 6.31658 19.0976 6.70711 18.7071L12 13.4142L17.2929 18.7071C17.6834 19.0976 18.3166 19.0976 18.7071 18.7071C19.0976 18.3166 19.0976 17.6834 18.7071 17.2929L13.4142 12L18.7071 6.70711C19.0976 6.31658 19.0976 5.68342 18.7071 5.29289C18.3166 4.90237 17.6834 4.90237 17.2929 5.29289L12 10.5858L6.70711 5.29289Z" fill="#2C3B47" />
                  </svg>
                </a>
              }
            }

            <div class="options_wrapper">
              @switch (filterKey) {
                @case ('country') {
                  <label class="checkbox" (click)="setPreSelectedValue('country', 'all')">
                    <span translate="VIEWS.MY_TOPICS.FILTER_ALL"></span>
                    <input type="radio" name="country">
                    <span class="checkmark"></span>
                  </label>
                  @for (country of displayedCountries(); track country.name) {
                    <label class="checkbox" (click)="setPreSelectedValue('country', country.name)">
                      <span>{{ country.name }}</span>
                      <input type="radio" name="country" [checked]="filtersData().country.preSelectedValue === country.name">
                      <span class="checkmark"></span>
                    </label>
                  }
                }
                @case ('language') {
                  <label class="checkbox" (click)="setPreSelectedValue('language', 'all')">
                    <span translate="VIEWS.MY_GROUPS.FILTER_ALL"></span>
                    <input type="radio" name="language">
                    <span class="checkmark"></span>
                  </label>
                  @for (language of displayedLanguages(); track language.name) {
                    <label class="checkbox" (click)="setPreSelectedValue('language', language.name)">
                      <span>{{ language.name }}</span>
                      <input type="radio" name="language" [checked]="filtersData().language.preSelectedValue === language.name">
                      <span class="checkmark"></span>
                    </label>
                  }
                }
                @default {
                  @for (option of filtersData()[filterKey].items; track option.value) {
                    <label class="checkbox" (click)="setPreSelectedValue(filterKey, option.value)">
                      @switch (filterKey) {
                        @case ('status') { <span>{{ option.title | uppercase | translate | titlecase }}</span> }
                        @case ('category') { <span>{{ option.title | uppercase | translate }}</span> }
                        @default { <span>{{ option.title | translate }}</span> }
                      }
                      <input type="radio" [name]="filterKey" [checked]="filtersData()[filterKey].preSelectedValue === option.value">
                      <span class="checkmark"></span>
                    </label>
                  }
                }
              }
            </div>
    
            <button class="btn_medium_secondary" (click)="applyMobileFilter(filterKey); closeMobileFilter();"
              translate="VIEWS.MY_TOPICS.BTN_APPLY"></button>
          </div>
        }
      }
    </div>
  </div>
  <div class="topics_content">
    @for (topic of topics(); track topic.id) {
      <cos-topic-card [topic]="topic"></cos-topic-card>
    }
  </div>
  <div class="pagination_wrap">
    <cos-pagination (selectPage)="loadPage($event)" [totalPages]="totalPages()" [page]="currentPage()"></cos-pagination>
  </div>
</div>
"""

ts = """import {
  Component,
  ChangeDetectionStrategy,
  inject,
  signal,
  computed,
  debounced,
  effect,
} from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { PublicTopicService } from '../../../core/services/public-topic.service';
import { TopicCardComponent } from '../../../shared/components/topic-card/topic-card.component';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';
import { ActivitiesButtonComponent } from '../../../shared/components/activities-button/activities-button.component';
import { TOPIC_STATUSES, TOPIC_CATEGORIES } from '../../../core/constants/topic.constants';
import { SeoService } from '../../../core/services/seo.service';
import { countries } from '../../../core/constants/countries';
import { languages } from '../../../core/constants/all-languages';
import { AppStateService } from '../../../core/services/app-state.service';
import { UserStore } from '../../../core/state/user.state';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { CosDropdownDirective } from '../../../shared/directives/cos-dropdown.directive';
import { InputComponent } from '../../../shared/components/input/input.component';
import { TypeaheadComponent } from '../../../shared/components/typeahead/typeahead.component';

@Component({
  selector: 'cos-public-topics',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    FormsModule,
    TranslateModule,
    TopicCardComponent,
    PaginationComponent,
    ActivitiesButtonComponent,
    CosDropdownDirective,
    InputComponent,
    TypeaheadComponent
  ],
  templateUrl: './public-topics.component.html',
  styleUrl: './public-topics.component.scss',
  animations: [
    trigger('openClose', [
      state('open', style({
        'maxHeight': '300px',
      })),
      state('closed', style({
        'maxHeight': '50px',
      })),
      transition('open <=> closed', [
        animate('0.2s ease-in-out')
      ])
    ])
  ]
})
export class PublicTopicsComponent {
  private topicService = inject(PublicTopicService);
  private seoService = inject(SeoService);
  app = inject(AppStateService);
  auth = { loggedIn$: computed(() => UserStore.isAuthenticated()) };

  private sortedCountries = [...countries].sort((a, b) => a.name.localeCompare(b.name));
  private sortedLanguages = [...languages].sort((a, b) => a.name.localeCompare(b.name));

  moreFilters = signal(false);
  searchInput = signal('');
  debouncedSearch = debounced(this.searchInput, 300);
  
  countrySearch = signal('');
  languageSearch = signal('');
  mobileFiltersList = signal(false);

  filtersData = signal<Record<string, any>>({
    status: {
      isMobileOpen: false,
      placeholder: 'COMPONENTS.PUBLIC_TOPICS.FILTER_STATUS',
      selectedValue: '',
      preSelectedValue: '',
      items: [
        { title: 'TXT_TOPIC_STATUS_ALL', value: 'all' },
        { title: 'COMPONENTS.PUBLIC_TOPICS.FILTER_TOPICS_MODERATED', value: 'showModerated' },
        ...Object.keys(TOPIC_STATUSES).map(s => ({ title: `TXT_TOPIC_STATUS_${s.toUpperCase()}`, value: s })),
      ]
    },
    category: {
      isMobileOpen: false,
      placeholder: 'COMPONENTS.PUBLIC_TOPICS.FILTER_CATEGORIES',
      selectedValue: '',
      preSelectedValue: '',
      items: [
        { title: 'TXT_TOPIC_CATEGORY_ALL', value: 'all' },
        ...Object.keys(TOPIC_CATEGORIES).map(c => ({ title: `TXT_TOPIC_CATEGORY_${c.toUpperCase()}`, value: c })),
      ]
    },
    country: {
      isMobileOpen: false,
      placeholder: 'VIEWS.MY_TOPICS.FILTER_COUNTRY',
      selectedValue: '',
      preSelectedValue: '',
      items: [
        { title: 'VIEWS.MY_TOPICS.FILTER_ALL', value: 'all' },
        ...this.sortedCountries.map(c => ({ title: c.name, value: c.name })),
      ]
    },
    language: {
      isMobileOpen: false,
      placeholder: 'VIEWS.MY_TOPICS.FILTER_LANGUAGE',
      selectedValue: '',
      preSelectedValue: '',
      items: [
        { title: 'VIEWS.MY_GROUPS.FILTER_ALL', value: 'all' },
        ...this.sortedLanguages.map(l => ({ title: l.name, value: l.name })),
      ]
    },
  });

  filterKeys = computed(() => Object.keys(this.filtersData()));
  hasMobileOpen = computed(() => Object.values(this.filtersData()).some((f: any) => f.isMobileOpen));

  displayedCountries = computed(() => {
    const s = this.countrySearch().toLowerCase();
    return this.sortedCountries.filter(c => c.name.toLowerCase().startsWith(s));
  });

  displayedLanguages = computed(() => {
    const s = this.languageSearch().toLowerCase();
    return this.sortedLanguages.filter(l => l.name.toLowerCase().startsWith(s));
  });

  topics = this.topicService.items;
  totalPages = this.topicService.totalPages;
  currentPage = this.topicService.page;

  constructor() {
    this.seoService.setPageTitle('COMPONENTS.PUBLIC_TOPICS.HEADER');
    this.topicService.reset();
    this.topicService.loadPage(1);

    effect(() => {
      this.topicService.setParam('search', this.debouncedSearch() || null);
    }, { allowSignalWrites: true });
  }

  getActiveFilterText(key: string, val: string) {
    const value = val === '' ? 'all' : val;
    const item = this.filtersData()[key].items.find((i: any) => i.value === value);
    return item ? item.title : '';
  }

  doSearch(val: string) {
    this.searchInput.set(val);
  }

  searchCountry(val: string) {
    this.countrySearch.set(val);
  }

  searchLanguage(val: string) {
    this.languageSearch.set(val);
  }

  setMobileOpen(key: string) {
    this.filtersData.update(data => {
      data[key].isMobileOpen = true;
      return { ...data };
    });
  }

  setPreSelectedValue(key: string, val: string) {
    this.filtersData.update(data => {
      data[key].preSelectedValue = val;
      return { ...data };
    });
  }

  applyMobileFilter(key: string) {
    const val = this.filtersData()[key].preSelectedValue;
    this.setFilterValue(key, val);
  }

  closeMobileFilter() {
    this.filtersData.update(data => {
      for (const k of Object.keys(data)) {
        data[k].isMobileOpen = false;
        data[k].preSelectedValue = '';
      }
      return { ...data };
    });
    this.countrySearch.set('');
    this.languageSearch.set('');
  }

  setFilterValue(filter: string, val: string) {
    const value = val === 'all' ? '' : val;
    
    this.filtersData.update(data => {
      data[filter].selectedValue = value;
      return { ...data };
    });

    this.topicService.reset();

    const data = this.filtersData();
    const status = data['status'].selectedValue;
    const category = data['category'].selectedValue;
    const country = data['country'].selectedValue;
    const language = data['language'].selectedValue;

    if (status) {
      if (status === 'showModerated' || status === 'favourite') {
        this.topicService.setParam(status, status);
      } else {
        this.topicService.setParam('statuses', [status]);
      }
    }
    if (category) {
      this.topicService.setParam('categories', [category]);
    }
    if (country) {
      this.topicService.setParam('country', country);
    }
    if (language) {
      this.topicService.setParam('language', language);
    }

    if (this.searchInput()) {
      this.topicService.setParam('search', this.searchInput());
    }
    
    this.topicService.loadPage(1);
  }

  doClearFilters() {
    this.filtersData.update(data => {
      for (const k of Object.keys(data)) {
        data[k].selectedValue = '';
      }
      return { ...data };
    });
    this.topicService.reset();
    if (this.searchInput()) {
      this.topicService.setParam('search', this.searchInput());
    }
    this.topicService.loadPage(1);
  }

  loadPage(page: number) {
    this.topicService.loadPage(page);
  }
}
"""

with open('src/app/features/topics/public-topics/public-topics.component.html', 'w') as f:
    f.write(html)
with open('src/app/features/topics/public-topics/public-topics.component.ts', 'w') as f:
    f.write(ts)

import shutil
shutil.copy('/home/ilmar/citizenos/citizenos-fe/src/app/public-topics/components/topics/topics.component.scss', 'src/app/features/topics/public-topics/public-topics.component.scss')
