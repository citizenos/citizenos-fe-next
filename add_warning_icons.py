import re

with open('src/app/shared/components/icon/icon.registry.ts', 'r') as f:
    content = f.read()

# Add to IconName
icon_names = "'warning-legacy' | 'vote-delegated-legacy'"
content = re.sub(r"('close-circle-legacy')", r"\1 | " + icon_names, content)

# Add to ICON_REGISTRY
svgs = """
    ['warning-legacy', { viewBox: '0 0 16 16', content: '<path fill-rule="evenodd" clip-rule="evenodd" d="M8.89438 1.78863C8.52586 1.05158 7.47405 1.05158 7.10553 1.78863L0.723562 14.5526C0.391112 15.2175 0.874608 15.9998 1.61799 15.9998H14.3819C15.1253 15.9998 15.6088 15.2175 15.2763 14.5526L8.89438 1.78863ZM6.99996 6.99977C6.99996 6.44749 7.44767 5.99977 7.99996 5.99977C8.55224 5.99977 8.99996 6.44749 8.99996 6.99977V9.99977C8.99996 10.5521 8.55224 10.9998 7.99996 10.9998C7.44767 10.9998 6.99996 10.5521 6.99996 9.99977V6.99977ZM6.99996 12.9998C6.99996 12.4475 7.44767 11.9998 7.99996 11.9998C8.55224 11.9998 8.99996 12.4475 8.99996 12.9998C8.99996 13.5521 8.55224 13.9998 7.99996 13.9998C7.44767 13.9998 6.99996 13.5521 6.99996 12.9998Z" fill="currentColor" />' }],
    ['vote-delegated-legacy', { viewBox: '0 0 40 40', content: '<rect width="40" height="40" rx="20" fill="currentColor" /><path d="M26.3432 15.9229L27.0634 10L21.1505 10.7214L23.1001 12.6743L15.7221 20.0647L17.1292 21.4742L24.5072 14.0838L26.3432 15.9229Z" fill="white" /><path d="M17.9282 29L28 18.9113L26.5929 17.5018L17.9352 26.174L13.4071 21.6524L12 23.0618L17.9282 29Z" fill="white" />' }],
"""

content = re.sub(r"(    \['close-circle-legacy', \{[^}]*\} \])", r"\1,\n" + svgs, content)

with open('src/app/shared/components/icon/icon.registry.ts', 'w') as f:
    f.write(content)
