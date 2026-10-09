# A script to manually inspect and replace simple icons in dashboard.component.html with cos-icon
import re

with open("src/app/features/dashboard/dashboard.component.html", "r") as f:
    html = f.read()

# E.g. View all links arrow-right
#             ><svg
#              width="24"
#              height="24"
#              viewBox="0 0 24 24"
#              ...
#              <path ... />
#            </svg>

arrow_right_svg = """<svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fill-rule="evenodd"
                clip-rule="evenodd"
                d="M10.7423 5.37895C10.4299 5.06653 9.9234 5.06653 9.61098 5.37895C9.29856 5.69137 9.29856 6.1979 9.61098 6.51032L15.0993 11.9987L9.60945 17.4886C9.29703 17.801 9.29703 18.3075 9.60945 18.6199C9.92187 18.9324 10.4284 18.9324 10.7408 18.6199L16.7963 12.5644C17.1088 12.252 17.1088 11.7455 16.7963 11.4331L10.7423 5.37895Z"
                fill="#2C3B47"
              />
            </svg>"""

html = html.replace(arrow_right_svg, '<cos-icon name="arrow-right" size="24"></cos-icon>')

# What about the big illustrations? The user said "ikoonide jaoks" (for icons). The big illustrations should stay SVG or be moved to assets.
# But there are other icons like "nav-create" or "plus"

with open("src/app/features/dashboard/dashboard.component.html", "w") as f:
    f.write(html)
print("Done")
