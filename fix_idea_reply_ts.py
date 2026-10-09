import re

with open("src/app/features/topics/topic-view/components/idea-reply/idea-reply.component.ts", "r") as f:
    ts = f.read()

target = """  doArgumentVote(value: number) {
    if (!this.userStore.isAuthenticated()) return;"""

replacement = """  doArgumentVote(value: number) {
    if (!this.userStore.isAuthenticated()) {
      this.router.navigate(['/', this.translate.currentLang, 'account', 'login'], {
        queryParams: { redirectSuccess: this.router.url }
      });
      return;
    }"""

if target in ts:
    ts = ts.replace(target, replacement)

# Inject router if missing
if "private router =" not in ts:
    target2 = "  private notification = inject(NotificationService);"
    replacement2 = "  private notification = inject(NotificationService);\n  private router = inject(Router);"
    ts = ts.replace(target2, replacement2)

with open("src/app/features/topics/topic-view/components/idea-reply/idea-reply.component.ts", "w") as f:
    f.write(ts)

print("Done")
