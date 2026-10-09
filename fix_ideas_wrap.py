import re

with open("src/app/features/topics/topic-view/components/topic-ideation/topic-ideation.component.html", "r") as f:
    content = f.read()

# We know the block starts with: <div class="ideas_wrap">
# and ends right before: <div class="pagination_wrap">

target_start = '<div class="ideas_wrap">'
target_end = '<div class="pagination_wrap">'

start_idx = content.find(target_start)
end_idx = content.find(target_end)

if start_idx != -1 and end_idx != -1:
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

            """
    
    # Wait, where does start_idx start? At `<div class="ideas_wrap">`. But in the original file, it has leading spaces.
    # We will just replace everything from `target_start` up to `target_end`
    content = content[:start_idx] + new_block + content[end_idx:]

    with open("src/app/features/topics/topic-view/components/topic-ideation/topic-ideation.component.html", "w") as f:
        f.write(content)
    print("Replaced!")
else:
    print("Could not find start or end index!")

