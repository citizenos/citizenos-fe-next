import re

with open("src/app/features/topics/topic-view/components/topic-ideation/topic-ideation.component.html", "r") as f:
    content = f.read()

start_str = '        <div class="ideas_wrap">\n            @if (loading() && !ideas().length) {\n'
end_str = '            @if (tabSelected() === \'ideas\' && topic().status === TopicService.STATUSES.ideation) {\n                <div class="bottom_actions mobile_hidden">\n                    <button type="button" class="btn_medium_submit" (click)="addIdea()" [disabled]="hasIdeationEnded()">\n                        <span>{{ \'COMPONENTS.TOPIC_IDEATION.BTN_ADD_YOUR_IDEA\' | translate }}</span>\n                    </button>\n                </div>\n            }\n        }\n\n    @if (tabSelected() === \'folders\') {'

start_idx = content.find(start_str)

if start_idx != -1:
    print("Found start_idx!")

    # Wait, the closing of ideas_wrap is at line 386 which is:
    end_str2 = '        </div>\n    }\n\n    @if (tabSelected() === \'folders\') {'
    end_idx2 = content.find(end_str2)
    
    if end_idx2 != -1:
        print("Found end_idx2!")
        
        new_block = """        @if (loading() && !ideas().length) {
            <div class="loading">{{ 'COMPONENTS.TOPIC_IDEATION.LBL_LOADING' | translate }}</div>
        }

        @if (!ideas().length && !filtersSet() && !loading()) {
            <cos-no-feature-yet background="discussion">
                <div class="description_heading">{{ 'COMPONENTS.TOPIC_IDEATION.NO_IDEAS_HEADING' | translate }}</div>
                <div class="button">
                    <button type="button" class="btn_medium_submit" (click)="addIdea()" [disabled]="hasIdeationEnded()">
                        <cos-icon name="plus"></cos-icon>
                        <span>{{ 'COMPONENTS.TOPIC_IDEATION.NO_IDEAS_BTN_ADD' | translate }}</span>
                    </button>
                </div>
            </cos-no-feature-yet>
        }

        @if (ideas().length > 0 && filtersSet()) {
            <div class="items_found">{{ 'COMPONENTS.TOPIC_IDEATION.ITEMS_FOUND_WITH_FILTERS' | translate: { count: ideasCount() } }}</div>
        }

        @if (ideas().length === 0 && filtersSet() && !loading()) {
            <div class="no_items_found">{{ 'COMPONENTS.TOPIC_IDEATION.NO_ITEMS_FOUND' | translate }}</div>
        }

        @if (ideas().length > 0) {
            <div class="ideas_wrap">
                @for (idea of ideas(); track idea.id) {
                    <app-ideabox
                        [idea]="idea"
                        [topic]="topic()"
                        [ideation]="ideation()"
                        (ideaDeleted)="onIdeaDeleted($event)"
                        (ideaUpdated)="onIdeaUpdated($event)" />
                }
            </div>
        }

        <div class="pagination_wrap">
            @if (ideasCount() > PAGE_SIZE) {
                <cos-pagination
                    class="ideation"
                    [page]="currentPage()"
                    [totalPages]="Math.ceil(ideasCount() / PAGE_SIZE)"
                    (selectPage)="onPageChange($event)" />
            }
        </div>

        @if (tabSelected() === 'ideas' && topic().status === TopicService.STATUSES.ideation) {
            <div class="bottom_actions mobile_hidden">
                <button type="button" class="btn_medium_submit" (click)="addIdea()" [disabled]="hasIdeationEnded()">
                    <span>{{ 'COMPONENTS.TOPIC_IDEATION.BTN_ADD_YOUR_IDEA' | translate }}</span>
                </button>
            </div>
        }
"""
        # Note we are replacing everything from start_idx up to end_idx2 (excluding end_str2 itself, so we keep `    }\n\n    @if (tabSelected() === 'folders') {`)
        # Wait, if we keep end_str2, then we keep `</div>` from end_str2?
        # No, end_str2 starts with `        </div>\n    }\n` 
        # If we replaced from start_idx to end_idx2, we remove everything inside, and then we prepend new_block to end_str2! BUT WAIT! We want to REMOVE the `</div>` from end_str2 because we no longer have an outer `ideas_wrap`!
        # So we actually want to replace `        </div>\n    }\n` with `    }\n`!
        
        # Let's adjust end_idx to include the `        </div>\n`
        
        end_idx3 = content.find("        </div>\n    }\n\n    @if (tabSelected() === 'folders') {")
        
        content = content[:start_idx] + new_block + "    }\n\n    @if (tabSelected() === 'folders') {" + content[end_idx3 + len("        </div>\n    }\n\n    @if (tabSelected() === 'folders') {"):]
        
        with open("src/app/features/topics/topic-view/components/topic-ideation/topic-ideation.component.html", "w") as f:
            f.write(content)
        print("Success!")
    else:
        print("Could not find end_idx!")
else:
    print("Could not find start_idx!")

