import re

with open('src/app/features/dashboard/dashboard.component.ts', 'r') as f:
    text = f.read()

# Add wWidth signal
insert_wWidth = """  private platformId = inject(PLATFORM_ID);
  readonly wWidth = signal(1024);
  
  @HostListener('window:resize')
  onResize() {
    if (isPlatformBrowser(this.platformId)) {
      this.wWidth.set(window.innerWidth);
    }
  }

  trackByTopic(index: number, element: any): number {
    return typeof element.id === 'string' ? parseInt(element.id, 10) : element.id;
  }
"""

if 'readonly wWidth' not in text:
    text = text.replace('private platformId = inject(PLATFORM_ID);', insert_wWidth)
    
    # We also need to add window.innerWidth to ngOnInit if possible, but the HostListener works if it fires. Actually we should init it:
    text = text.replace("localStorage.setItem('show-dashboard-tour', 'true');\n    }", "localStorage.setItem('show-dashboard-tour', 'true');\n    }\n    if (isPlatformBrowser(this.platformId)) {\n      this.wWidth.set(window.innerWidth);\n    }")

with open('src/app/features/dashboard/dashboard.component.ts', 'w') as f:
    f.write(text)
