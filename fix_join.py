import re

file_path = 'src/app/features/topics/topic-view/topic-view.component.ts'
with open(file_path, 'r') as f:
    content = f.read()

replacement = """  joinTopic(topic: Topic) {
    if (!this.userStore.isAuthenticated()) {
      this.router.navigate(['/', this.translate.currentLang, 'account', 'login'], { queryParams: { redirectSuccess: window.location.href } });
      return;
    }

    this.topicService.joinPublic(topic.id)"""

content = content.replace("  joinTopic(topic: Topic) {\n    this.topicService.joinPublic(topic.id)", replacement)

with open(file_path, 'w') as f:
    f.write(content)

