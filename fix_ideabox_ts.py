import re

with open("src/app/features/topics/topic-view/components/ideabox/ideabox.component.ts", "r") as f:
    ts = f.read()

target = """  vote(value: number) {
    if (!this.userStore.isAuthenticated()) {
        // Show login logic? Or just return?
        return;
    }
    if (!this.canVote()) return;"""

replacement = """  vote(value: number) {
    if (!this.userStore.isAuthenticated()) {
      this.router.navigate(['/', this.translate.currentLang, 'account', 'login'], {
        queryParams: { redirectSuccess: this.router.url }
      });
      return;
    }
    if (!this.canVote()) return;"""

if target in ts:
    ts = ts.replace(target, replacement)

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

# Check if Router is imported, and add it
if "import { Router }" not in ts:
    ts = ts.replace("import { Component", "import { Router }\nimport { Component")

with open("src/app/features/topics/topic-view/components/ideabox/ideabox.component.ts", "w") as f:
    f.write(ts)

print("Done")
