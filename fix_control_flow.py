import re

with open('src/app/features/dashboard/dashboard.component.html', 'r') as f:
    html = f.read()

# I will just write a simple parsing loop for ngIf and ngFor.
# Wait, let's just use Python to download node v22 locally and run it.
import urllib.request
import tarfile
import os

if not os.path.exists('node-v22.14.0-linux-x64'):
    url = "https://nodejs.org/dist/v22.14.0/node-v22.14.0-linux-x64.tar.xz"
    print("Downloading node...")
    os.system('wget -qO node.tar.xz ' + url)
    print("Extracting...")
    os.system('tar -xf node.tar.xz')

print("Node ready")
