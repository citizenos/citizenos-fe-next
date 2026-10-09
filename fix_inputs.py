import re
with open("src/app/features/topics/public-topics/public-topics.component.html", "r") as f:
    text = f.read()

text = text.replace('/>', '>')

with open("src/app/features/topics/public-topics/public-topics.component.html", "w") as f:
    f.write(text)
