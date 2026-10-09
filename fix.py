import re

with open('src/app/features/topics/public-topics/public-topics.component.ts', 'r') as f:
    ts = f.read()

ts = ts.replace("import { AppStateService } from '../../../core/services/app-state.service';",
                "import { GlobalSearchService } from '../../../core/services/global-search.service';")

ts = ts.replace("app = inject(AppStateService);", "app = inject(GlobalSearchService);")
ts = ts.replace("import { UserStore } from '../../../core/state/user.state';", "import { UserStore } from '../../../core/state/user.store';")
ts = ts.replace("auth = { loggedIn$: computed(() => UserStore.isAuthenticated()) };", "private userStore = inject(UserStore);\n  auth = { loggedIn$: this.userStore.isAuthenticated };")
ts = ts.replace(".topicService.setParam('search', this.debouncedSearch() || null);", ".topicService.setParam('search', this.debouncedSearch() || '');")

with open('src/app/features/topics/public-topics/public-topics.component.ts', 'w') as f:
    f.write(ts)

with open('src/app/features/topics/public-topics/public-topics.component.spec.ts', 'r') as f:
    spec = f.read()

spec = spec.replace("import { AppStateService } from '../../../core/services/app-state.service';",
                "import { GlobalSearchService } from '../../../core/services/global-search.service';")
spec = spec.replace("AppStateService", "GlobalSearchService")

with open('src/app/features/topics/public-topics/public-topics.component.spec.ts', 'w') as f:
    f.write(spec)

with open('src/app/features/topics/public-topics/public-topics.component.html', 'r') as f:
    html = f.read()
html = html.replace('auth.loggedIn$ | async', 'auth.loggedIn$()')
with open('src/app/features/topics/public-topics/public-topics.component.html', 'w') as f:
    f.write(html)
