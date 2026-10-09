import re

with open("src/app/features/home/home.component.html", "r", encoding="utf-8") as f:
    html = f.read()

svg_code = """<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9.38602 14.8088L17.5256 6L19 7.59558L9.38602 18L5 13.2534L6.47436 11.6578L9.38602 14.8088Z" fill="#4D5C6A" />
          </svg>"""

html = html.replace('<cos-icon name="home-icon-legacy" size="24"></cos-icon>', svg_code)
html = html.replace('<img src="/assets/imgs/group image.png" alt="Group Feature">', '<img src="/assets/imgs/group image.png">')

# Let's also check for any missing classes.
# The patch showed:
# -<div class="page_content" id="home_wrap">
# +<div id="home_wrap" class="page_content">
# That's fine.

with open("src/app/features/home/home.component.html", "w", encoding="utf-8") as f:
    f.write(html)
