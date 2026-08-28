import re

file_path = 'src/app/features/topics/topic-view/topic-view.component.ts'
with open(file_path, 'r') as f:
    content = f.read()

replacement = """  joinTopic(topic: Topic) {
    if (!this.userStore.isAuthenticated()) {
      // TODO: (Migration Note)
      // See ei ole päris vana loogika. Vanas rakenduses avanes nupule vajutades otse "login dialog" aken.
      // Hetkel on ajutine lahendus suunata kasutaja login lehele redirectSuccess parameetriga.
      // Tuleb hiljem taastada vana käitumine, kui login dialoog on uues rakenduses implementeeritud.
      this.router.navigate(['/', this.translate.currentLang, 'account', 'login'], { queryParams: { redirectSuccess: window.location.href } });
      return;
    }"""

content = content.replace("""  joinTopic(topic: Topic) {\n    if (!this.userStore.isAuthenticated()) {\n      this.router.navigate(['/', this.translate.currentLang, 'account', 'login'], { queryParams: { redirectSuccess: window.location.href } });\n      return;\n    }""", replacement)

with open(file_path, 'w') as f:
    f.write(content)

