import re

with open('src/app/features/topics/public-topics/public-topics.component.html', 'r') as f:
    html = f.read()

html = html.replace('<activities-button *ngIf="auth.loggedIn$ | async"></activities-button>',
'''@if (auth.loggedIn$ | async) {
  <cos-activities-button></cos-activities-button>
}''')

html = html.replace('<ng-container *ngFor="let filterKey of filterKeys">',
'''@for (filterKey of filterKeys(); track filterKey) {''')

html = html.replace('<ng-container *ngFor="let option of filtersData[filterKey].items">',
'''@for (option of filtersData()[filterKey].items; track option.value) {''')

html = html.replace('filtersData[filterKey]', 'filtersData()[filterKey]')

# Switch to @switch
html = html.replace('<ng-container [ngSwitch]="filterKey">', '@switch (filterKey) {')
html = html.replace('<span *ngSwitchCase="\'status\'">', '@case (\'status\') { <span>')
html = html.replace('<span *ngSwitchCase="\'status\'" class="bold">', '@case (\'status\') { <span class="bold">')
html = html.replace('<span *ngSwitchCase="\'category\'">', '@case (\'category\') { <span>')
html = html.replace('<span *ngSwitchCase="\'category\'" class="bold">', '@case (\'category\') { <span class="bold">')
html = html.replace('<span *ngSwitchDefault>', '@default { <span>')
html = html.replace('<span *ngSwitchDefault class="bold">', '@default { <span class="bold">')
html = html.replace('</span>\n', '</span> }\n')
html = html.replace('</ng-container>', '}')

# Mobile options
html = html.replace('<search-filter\n              *ngSwitchCase="\'country\'"', '@case (\'country\') {\n<cos-typeahead class="dropdown dropdown_input dropdown_wrapper" activeClass="dropdown_active"')
html = html.replace('[search]="searchCountry.bind(this)"', '(search)="searchCountry($event)"')
html = html.replace('[close]="closeMobileFilter.bind(this)"', '')
html = html.replace('/>\n', '>\n<a class="btn_medium_close icon" (click)="closeMobileFilter()">\n<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">\n<path d="M6.70711 5.29289C6.31658 4.90237 5.68342 4.90237 5.29289 5.29289C4.90237 5.68342 4.90237 6.31658 5.29289 6.70711L10.5858 12L5.29289 17.2929C4.90237 17.6834 4.90237 18.3166 5.29289 18.7071C5.68342 19.0976 6.31658 19.0976 6.70711 18.7071L12 13.4142L17.2929 18.7071C17.6834 19.0976 18.3166 19.0976 18.7071 18.7071C19.0976 18.3166 19.0976 17.6834 18.7071 17.2929L13.4142 12L18.7071 6.70711C19.0976 6.31658 19.0976 5.68342 18.7071 5.29289C18.3166 4.90237 17.6834 4.90237 17.2929 5.29289L12 10.5858L6.70711 5.29289Z" fill="#2C3B47" />\n</svg>\n</a>\n</cos-typeahead>\n}')

html = html.replace('<search-filter\n              *ngSwitchCase="\'language\'"', '@case (\'language\') {\n<cos-typeahead class="dropdown dropdown_input dropdown_wrapper" activeClass="dropdown_active"')
html = html.replace('[search]="searchLanguage.bind(this)"', '(search)="searchLanguage($event)"')

html = html.replace('<a *ngSwitchDefault class="btn_medium_close icon" (click)="closeMobileFilter()">', '@default {\n<a class="btn_medium_close icon" (click)="closeMobileFilter()">')
html = html.replace('</a>\n', '</a>\n}\n')

# Checkbox sections
html = html.replace('<ng-container *ngSwitchCase="\'country\'">', '@case (\'country\') {')
html = html.replace('<ng-container *ngIf="countries$ | async as countries">', '@if (countries$ | async; as countries) {')
html = html.replace('<label class="checkbox" *ngFor="let country of countries" (click)="filtersData.country.preSelectedValue = country.name;">', '@for (country of countries; track country.name) {\n<label class="checkbox" (click)="filtersData().country.preSelectedValue = country.name;">')
html = html.replace('</label>\n', '</label>\n}\n')
html = html.replace('filtersData.country', 'filtersData().country')

html = html.replace('<ng-container *ngSwitchCase="\'language\'">', '@case (\'language\') {')
html = html.replace('<ng-container *ngIf="languages$ | async as languages">', '@if (languages$ | async; as languages) {')
html = html.replace('<label class="checkbox" *ngFor="let language of languages" (click)="filtersData.language.preSelectedValue = language.name;">', '@for (language of languages; track language.name) {\n<label class="checkbox" (click)="filtersData().language.preSelectedValue = language.name;">')
html = html.replace('filtersData.language', 'filtersData().language')

html = html.replace('<ng-container *ngSwitchDefault>', '@default {')

html = html.replace('<div class="options button_options" *ngIf="filtersData[filterKey].isMobileOpen">', '@if (filtersData()[filterKey].isMobileOpen) { <div class="options button_options">')
html = html.replace('</button>\n        </div>', '</button>\n        </div>\n}')

html = html.replace('[(ngModel)]="searchInput"', '[(ngModel)]="searchInput"')

# App showSearch
html = html.replace('app.showSearch', 'showSearch')

# Clear search
html = html.replace('*ngIf="searchInput"', '')
html = html.replace('<a class="clear_search" translate="COMPONENTS.PUBLIC_TOPICS.LNK_CLEAR" (click)="searchInput=\'\';doSearch(\'\')" >', '@if (searchInput()) {\n<a class="clear_search" translate="COMPONENTS.PUBLIC_TOPICS.LNK_CLEAR" (click)="searchInput.set(\'\'); doSearch(\'\')">\n}\n')

html = html.replace('searchInput=""', 'searchInput.set("")')
html = html.replace('searchInput=\'\'', 'searchInput.set(\'\')')
html = html.replace('searchInput=', 'searchInput.set()')

html = html.replace('<div class="overlay" *ngIf="hasMobileOpen" (click)="closeMobileFilter();"></div>', '@if (hasMobileOpen()) {\n<div class="overlay" (click)="closeMobileFilter()"></div>\n}')

# Topics content
html = html.replace('<ng-container *ngIf="topics$ | async as topics;">', '@if (topics$ | async; as topics) {')
html = html.replace('<topicbox [topic]="topic" *ngFor="let topic of topics; trackBy: trackByFn;"></topicbox>', '@for (topic of topics; track trackByFn($index, topic)) {\n<cos-topic-card [topic]="topic"></cos-topic-card>\n}')

html = html.replace('*ngIf="moreFilters"', '')
html = html.replace('<button class="btn_big_secondary icon"  (click)="doClearFilters()">', '@if (moreFilters()) {\n<button class="btn_big_secondary icon" (click)="doClearFilters()">')
html = html.replace('</button>\n    </div>', '</button>\n}\n</div>')
html = html.replace('moreFilters?', 'moreFilters() ?')
html = html.replace('moreFilters = !moreFilters', 'moreFilters.set(!moreFilters())')
html = html.replace('moreFilters ', 'moreFilters() ')

html = html.replace('mobileFiltersList', 'mobileFiltersList()')
html = html.replace('mobileFiltersList() = !mobileFiltersList()', 'mobileFiltersList.set(!mobileFiltersList())')
html = html.replace('hasMobileOpen', 'hasMobileOpen()')

# Write output
with open('src/app/features/topics/public-topics/public-topics.component.html', 'w') as f:
    f.write(html)
