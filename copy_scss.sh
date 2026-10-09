#!/bin/bash
LEGACY_DIR="../citizenos-fe/src/app/ideation/components"
NEXT_DIR="src/app/features/topics/topic-view/components"

for folder in "$LEGACY_DIR"/*/; do
    comp=$(basename "$folder")
    if [ -d "$NEXT_DIR/$comp" ]; then
        if [ -f "$folder/$comp.component.scss" ]; then
            echo "Copying SCSS for $comp"
            
            # Preserve :host block if it exists in Next SCSS
            HOST_BLOCK=$(awk '/^:host \{/{flag=1} flag; /^\}/{if(flag){flag=0; exit}}' "$NEXT_DIR/$comp/$comp.component.scss" 2>/dev/null)
            
            # Some components like topic-ideation need the mixins import
            MIXINS=$(grep -h '@use "mixins";' "$folder/$comp.component.scss" 2>/dev/null || true)
            
            # Combine them
            echo "$MIXINS" > "$NEXT_DIR/$comp/$comp.component.scss"
            if [ ! -z "$HOST_BLOCK" ]; then
                echo "$HOST_BLOCK" >> "$NEXT_DIR/$comp/$comp.component.scss"
            fi
            
            # Append legacy SCSS without the mixin import
            cat "$folder/$comp.component.scss" | sed '/@use "mixins";/d' >> "$NEXT_DIR/$comp/$comp.component.scss"
        fi
    fi
done
