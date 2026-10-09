#!/bin/bash
LEGACY="../citizenos-fe/src/app/ideation/components/idea/idea-dialog.component.scss"
NEXT="src/app/features/topics/topic-view/components/idea-dialog/idea-dialog.component.scss"

HOST_BLOCK=$(awk '/^:host \{/{flag=1} flag; /^\}/{if(flag){flag=0; exit}}' "$NEXT" 2>/dev/null)
MIXINS=$(grep -h '@use "mixins";' "$LEGACY" 2>/dev/null || true)

echo "$MIXINS" > "$NEXT"
if [ ! -z "$HOST_BLOCK" ]; then
    echo "$HOST_BLOCK" >> "$NEXT"
fi
cat "$LEGACY" | sed '/@use "mixins";/d' >> "$NEXT"
