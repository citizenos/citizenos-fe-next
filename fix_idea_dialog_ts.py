import re

with open("src/app/features/topics/topic-view/components/idea-dialog/idea-dialog.component.ts", "r") as f:
    ts = f.read()

target1 = """  voteIdea(value: number) {
    if (!this.userStore.isAuthenticated()) return;
    if (!this.canVote()) return;"""

replacement1 = """  voteIdea(value: number) {
    if (!this.userStore.isAuthenticated()) {
      this.router.navigate(['/', this.translate.currentLang, 'account', 'login'], {
        queryParams: { redirectSuccess: this.router.url }
      });
      return;
    }
    if (!this.canVote()) return;"""

if target1 in ts:
    ts = ts.replace(target1, replacement1)

target2 = """  toggleFavourite() {
    const idea = this.idea();"""

replacement2 = """  toggleFavourite() {
    if (!this.userStore.isAuthenticated()) {
      this.router.navigate(['/', this.translate.currentLang, 'account', 'login'], {
        queryParams: { redirectSuccess: this.router.url }
      });
      return;
    }
    const idea = this.idea();"""

if target2 in ts:
    ts = ts.replace(target2, replacement2)

# Ensure router is injected
if "private router =" not in ts:
    target3 = "  private userStore = inject(UserStore);"
    replacement3 = "  private userStore = inject(UserStore);\n  private router = inject(Router);"
    ts = ts.replace(target3, replacement3)

with open("src/app/features/topics/topic-view/components/idea-dialog/idea-dialog.component.ts", "w") as f:
    f.write(ts)

print("Done")
