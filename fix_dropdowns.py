import re

with open("src/app/features/topics/topic-view/components/topic-ideation/topic-ideation.component.html", "r") as f:
    html = f.read()

# I will just write a regex to replace the old cosDropdown pattern with the new cos-dropdown component
# It's better to just manually craft the exact replacement chunks

def replace_type(html):
    old = """<div class="dropdown_input">
                            <div class="dropdown" cosDropdown>
                                <div selection class="selection">
                                    <div class="selected_item">
                                        <div class="label">{{ 'COMPONENTS.TOPIC_IDEATION.IDEA_FILTER_TYPE' | translate }}</div>
                                        @if (!selectedType()) {
                                            <span>{{ 'COMPONENTS.TOPIC_IDEATION.FILTER_ALL' | translate }}</span>
                                        } @else if (selectedType() === 'iCreated') {
                                            <span>{{ 'COMPONENTS.TOPIC_IDEATION.FILTER_TYPE_YOUR_IDEAS' | translate }}</span>
                                        } @else if (selectedType() === 'favourite') {
                                            <span>{{ 'COMPONENTS.TOPIC_IDEATION.FILTER_TYPE_FAVOURITES' | translate }}</span>
                                        } @else if (selectedType() === 'showModerated') {
                                            <span>{{ 'COMPONENTS.TOPIC_IDEATION.FILTER_TYPE_MODERATED' | translate }}</span>
                                        }
                                    </div>
                                    <cos-icon name="chevron-down"></cos-icon>
                                </div>
                                <div options class="options">
                                    <div class="option" (click)="setType('')" (keydown.enter)="setType('')" role="button" tabindex="0">
                                        <span>{{ 'COMPONENTS.TOPIC_IDEATION.FILTER_ALL' | translate }}</span>
                                    </div>
                                    <div class="option" (click)="setType('iCreated')" (keydown.enter)="setType('iCreated')" role="button" tabindex="0">
                                        <span>{{ 'COMPONENTS.TOPIC_IDEATION.FILTER_TYPE_YOUR_IDEAS' | translate }}</span>
                                    </div>
                                    <div class="option" (click)="setType('favourite')" (keydown.enter)="setType('favourite')" role="button" tabindex="0">
                                        <span>{{ 'COMPONENTS.TOPIC_IDEATION.FILTER_TYPE_FAVOURITES' | translate }}</span>
                                    </div>
                                    @if (topic().status === TopicService.STATUSES.ideation) {
                                        <div class="option" (click)="setType('showModerated')" (keydown.enter)="setType('showModerated')" role="button" tabindex="0">
                                            <span>{{ 'COMPONENTS.TOPIC_IDEATION.FILTER_TYPE_MODERATED' | translate }}</span>
                                        </div>
                                    }
                                </div>
                            </div>
                        </div>"""
    
    new = """<div class="dropdown_input">
                            <cos-dropdown [placeholder]="'COMPONENTS.TOPIC_IDEATION.IDEA_FILTER_TYPE' | translate">
                                <div selection>
                                    @if (!selectedType()) {
                                        <span>{{ 'COMPONENTS.TOPIC_IDEATION.FILTER_ALL' | translate }}</span>
                                    } @else if (selectedType() === 'iCreated') {
                                        <span>{{ 'COMPONENTS.TOPIC_IDEATION.FILTER_TYPE_YOUR_IDEAS' | translate }}</span>
                                    } @else if (selectedType() === 'favourite') {
                                        <span>{{ 'COMPONENTS.TOPIC_IDEATION.FILTER_TYPE_FAVOURITES' | translate }}</span>
                                    } @else if (selectedType() === 'showModerated') {
                                        <span>{{ 'COMPONENTS.TOPIC_IDEATION.FILTER_TYPE_MODERATED' | translate }}</span>
                                    }
                                </div>
                                <div options>
                                    <div class="option" (click)="setType('')" (keydown.enter)="setType('')" role="button" tabindex="0">
                                        <span>{{ 'COMPONENTS.TOPIC_IDEATION.FILTER_ALL' | translate }}</span>
                                    </div>
                                    <div class="option" (click)="setType('iCreated')" (keydown.enter)="setType('iCreated')" role="button" tabindex="0">
                                        <span>{{ 'COMPONENTS.TOPIC_IDEATION.FILTER_TYPE_YOUR_IDEAS' | translate }}</span>
                                    </div>
                                    <div class="option" (click)="setType('favourite')" (keydown.enter)="setType('favourite')" role="button" tabindex="0">
                                        <span>{{ 'COMPONENTS.TOPIC_IDEATION.FILTER_TYPE_FAVOURITES' | translate }}</span>
                                    </div>
                                    @if (topic().status === TopicService.STATUSES.ideation) {
                                        <div class="option" (click)="setType('showModerated')" (keydown.enter)="setType('showModerated')" role="button" tabindex="0">
                                            <span>{{ 'COMPONENTS.TOPIC_IDEATION.FILTER_TYPE_MODERATED' | translate }}</span>
                                        </div>
                                    }
                                </div>
                            </cos-dropdown>
                        </div>"""
    return html.replace(old, new)

def replace_order(html):
    old = """<div class="dropdown_input">
                            <div class="dropdown" cosDropdown>
                                <div selection class="selection">
                                    <div class="selected_item">
                                        <div class="label">{{ 'COMPONENTS.TOPIC_IDEATION.IDEA_FILTER_ORDER' | translate }}</div>
                                        @if (!selectedOrder()) {
                                            <span>{{ 'COMPONENTS.TOPIC_IDEATION.FILTER_ALL' | translate }}</span>
                                        } @else if (selectedOrder() === 'likes') {
                                            <span>{{ 'COMPONENTS.TOPIC_IDEATION.FILTER_ORDER_MOST_LIKED' | translate }}</span>
                                        } @else if (selectedOrder() === 'recent') {
                                            <span>{{ 'COMPONENTS.TOPIC_IDEATION.FILTER_ORDER_MOST_RECENT' | translate }}</span>
                                        } @else if (selectedOrder() === 'replies') {
                                            <span>{{ 'COMPONENTS.TOPIC_IDEATION.FILTER_ORDER_MOST_REPLIES' | translate }}</span>
                                        }
                                    </div>
                                    <cos-icon name="chevron-down"></cos-icon>
                                </div>
                                <div options class="options">
                                    <div class="option" (click)="orderBy('')" (keydown.enter)="orderBy('')" role="button" tabindex="0">
                                        <span>{{ 'COMPONENTS.TOPIC_IDEATION.FILTER_ALL' | translate }}</span>
                                    </div>
                                    <div class="option" (click)="orderBy('likes')" (keydown.enter)="orderBy('likes')" role="button" tabindex="0">
                                        <span>{{ 'COMPONENTS.TOPIC_IDEATION.FILTER_ORDER_MOST_LIKED' | translate }}</span>
                                    </div>
                                    <div class="option" (click)="orderBy('recent')" (keydown.enter)="orderBy('recent')" role="button" tabindex="0">
                                        <span>{{ 'COMPONENTS.TOPIC_IDEATION.FILTER_ORDER_MOST_RECENT' | translate }}</span>
                                    </div>
                                    <div class="option" (click)="orderBy('replies')" (keydown.enter)="orderBy('replies')" role="button" tabindex="0">
                                        <span>{{ 'COMPONENTS.TOPIC_IDEATION.FILTER_ORDER_MOST_REPLIES' | translate }}</span>
                                    </div>
                                </div>
                            </div>
                        </div>"""
    new = """<div class="dropdown_input">
                            <cos-dropdown [placeholder]="'COMPONENTS.TOPIC_IDEATION.IDEA_FILTER_ORDER' | translate">
                                <div selection>
                                    @if (!selectedOrder()) {
                                        <span>{{ 'COMPONENTS.TOPIC_IDEATION.FILTER_ALL' | translate }}</span>
                                    } @else if (selectedOrder() === 'likes') {
                                        <span>{{ 'COMPONENTS.TOPIC_IDEATION.FILTER_ORDER_MOST_LIKED' | translate }}</span>
                                    } @else if (selectedOrder() === 'recent') {
                                        <span>{{ 'COMPONENTS.TOPIC_IDEATION.FILTER_ORDER_MOST_RECENT' | translate }}</span>
                                    } @else if (selectedOrder() === 'replies') {
                                        <span>{{ 'COMPONENTS.TOPIC_IDEATION.FILTER_ORDER_MOST_REPLIES' | translate }}</span>
                                    }
                                </div>
                                <div options>
                                    <div class="option" (click)="orderBy('')" (keydown.enter)="orderBy('')" role="button" tabindex="0">
                                        <span>{{ 'COMPONENTS.TOPIC_IDEATION.FILTER_ALL' | translate }}</span>
                                    </div>
                                    <div class="option" (click)="orderBy('likes')" (keydown.enter)="orderBy('likes')" role="button" tabindex="0">
                                        <span>{{ 'COMPONENTS.TOPIC_IDEATION.FILTER_ORDER_MOST_LIKED' | translate }}</span>
                                    </div>
                                    <div class="option" (click)="orderBy('recent')" (keydown.enter)="orderBy('recent')" role="button" tabindex="0">
                                        <span>{{ 'COMPONENTS.TOPIC_IDEATION.FILTER_ORDER_MOST_RECENT' | translate }}</span>
                                    </div>
                                    <div class="option" (click)="orderBy('replies')" (keydown.enter)="orderBy('replies')" role="button" tabindex="0">
                                        <span>{{ 'COMPONENTS.TOPIC_IDEATION.FILTER_ORDER_MOST_REPLIES' | translate }}</span>
                                    </div>
                                </div>
                            </cos-dropdown>
                        </div>"""
    return html.replace(old, new)

def replace_participants(html):
    old = """<div class="dropdown_input">
                            <div class="dropdown" cosDropdown>
                                <div selection class="selection">
                                    <div class="selected_item">
                                        <div class="label">{{ 'COMPONENTS.TOPIC_IDEATION.IDEA_FILTER_PARTICIPANTS' | translate }}</div>
                                        @if (!selectedParticipants()) {
                                            <span>{{ 'COMPONENTS.TOPIC_IDEATION.FILTER_ALL' | translate }}</span>
                                        } @else {
                                            <span>{{ selectedParticipants()?.name }}</span>
                                        }
                                    </div>
                                    <cos-icon name="chevron-down"></cos-icon>
                                </div>
                                <div options class="options">
                                    <div class="option" (click)="setParticipant(null)" (keydown.enter)="setParticipant(null)" role="button" tabindex="0">
                                        <span>{{ 'COMPONENTS.TOPIC_IDEATION.FILTER_ALL' | translate }}</span>
                                    </div>
                                    @for (user of users(); track user.id) {
                                        <div class="option" (click)="setParticipant(user)" (keydown.enter)="setParticipant(user)" role="button" tabindex="0">
                                            <span>{{ user.name }}</span>
                                        </div>
                                    }
                                </div>
                            </div>
                        </div>"""
    new = """<div class="dropdown_input">
                            <cos-dropdown [placeholder]="'COMPONENTS.TOPIC_IDEATION.IDEA_FILTER_PARTICIPANTS' | translate">
                                <div selection>
                                    @if (!selectedParticipants()) {
                                        <span>{{ 'COMPONENTS.TOPIC_IDEATION.FILTER_ALL' | translate }}</span>
                                    } @else {
                                        <span>{{ selectedParticipants()?.name }}</span>
                                    }
                                </div>
                                <div options>
                                    <div class="option" (click)="setParticipant(null)" (keydown.enter)="setParticipant(null)" role="button" tabindex="0">
                                        <span>{{ 'COMPONENTS.TOPIC_IDEATION.FILTER_ALL' | translate }}</span>
                                    </div>
                                    @for (user of users(); track user.id) {
                                        <div class="option" (click)="setParticipant(user)" (keydown.enter)="setParticipant(user)" role="button" tabindex="0">
                                            <span>{{ user.name }}</span>
                                        </div>
                                    }
                                </div>
                            </cos-dropdown>
                        </div>"""
    return html.replace(old, new)

def replace_age(html):
    old = """<div class="dropdown_input">
                                <div class="dropdown dropdown_selector" cosDropdown [multipleChoice]="true">
                                    <div selection class="selection">
                                        <div class="selected_item">
                                            <div class="label">{{ 'COMPONENTS.TOPIC_IDEATION.IDEA_FILTER_AGE' | translate }}</div>
                                            @if (!selectedAge() || selectedAge().length === 0) {
                                                <span>{{ 'COMPONENTS.TOPIC_IDEATION.FILTER_ALL' | translate }}</span>
                                            } @else {
                                                <span>{{ selectedAge().join(', ') }}</span>
                                            }
                                        </div>
                                        <cos-icon name="chevron-down"></cos-icon>
                                    </div>
                                    <div options class="options">
                                        <div class="option" (click)="setAge('')" (keydown.enter)="setAge('')" role="button" tabindex="0">
                                            <div class="checkbox" [class.checked]="!selectedAge() || selectedAge().length === 0"></div>
                                            <span>{{ 'COMPONENTS.TOPIC_IDEATION.FILTER_ALL' | translate }}</span>
                                        </div>
                                        @for (age of ideaAges(); track age) {
                                            <div class="option" (click)="setAge(age)" (keydown.enter)="setAge(age)" role="button" tabindex="0">
                                                <div class="checkbox" [class.checked]="selectedAge() && selectedAge().includes(age.toString())"></div>
                                                <span>{{ age }}</span>
                                            </div>
                                        }
                                    </div>
                                </div>
                            </div>"""
    new = """<div class="dropdown_input">
                                <cos-dropdown [placeholder]="'COMPONENTS.TOPIC_IDEATION.IDEA_FILTER_AGE' | translate">
                                    <div selection>
                                        @if (!selectedAge() || selectedAge().length === 0) {
                                            <span>{{ 'COMPONENTS.TOPIC_IDEATION.FILTER_ALL' | translate }}</span>
                                        } @else {
                                            <span>{{ selectedAge().join(', ') }}</span>
                                        }
                                    </div>
                                    <div options>
                                        <div class="option" (click)="setAge('')" (keydown.enter)="setAge('')" role="button" tabindex="0">
                                            <div class="checkbox" [class.checked]="!selectedAge() || selectedAge().length === 0"></div>
                                            <span>{{ 'COMPONENTS.TOPIC_IDEATION.FILTER_ALL' | translate }}</span>
                                        </div>
                                        @for (age of ideaAges(); track age) {
                                            <div class="option" (click)="setAge(age)" (keydown.enter)="setAge(age)" role="button" tabindex="0">
                                                <div class="checkbox" [class.checked]="selectedAge() && selectedAge().includes(age.toString())"></div>
                                                <span>{{ age }}</span>
                                            </div>
                                        }
                                    </div>
                                </cos-dropdown>
                            </div>"""
    return html.replace(old, new)

def replace_gender(html):
    old = """<div class="dropdown_input">
                                <div class="dropdown" cosDropdown>
                                    <div selection class="selection">
                                        <div class="selected_item">
                                            <div class="label">{{ 'COMPONENTS.TOPIC_IDEATION.IDEA_FILTER_GENDER' | translate }}</div>
                                            @if (!selectedGender()) {
                                                <span>{{ 'COMPONENTS.TOPIC_IDEATION.FILTER_ALL' | translate }}</span>
                                            } @else {
                                                <span>{{ 'COMPONENTS.TOPIC_IDEATION.GENDER_' + selectedGender() | uppercase | translate }}</span>
                                            }
                                        </div>
                                        <cos-icon name="chevron-down"></cos-icon>
                                    </div>
                                    <div options class="options">
                                        <div class="option" (click)="setGender('')" (keydown.enter)="setGender('')" role="button" tabindex="0">
                                            <span>{{ 'COMPONENTS.TOPIC_IDEATION.FILTER_ALL' | translate }}</span>
                                        </div>
                                        <div class="option" (click)="setGender('male')" (keydown.enter)="setGender('male')" role="button" tabindex="0">
                                            <span>{{ 'COMPONENTS.TOPIC_IDEATION.GENDER_MALE' | translate }}</span>
                                        </div>
                                        <div class="option" (click)="setGender('female')" (keydown.enter)="setGender('female')" role="button" tabindex="0">
                                            <span>{{ 'COMPONENTS.TOPIC_IDEATION.GENDER_FEMALE' | translate }}</span>
                                        </div>
                                        <div class="option" (click)="setGender('other')" (keydown.enter)="setGender('other')" role="button" tabindex="0">
                                            <span>{{ 'COMPONENTS.TOPIC_IDEATION.GENDER_OTHER' | translate }}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>"""
    new = """<div class="dropdown_input">
                                <cos-dropdown [placeholder]="'COMPONENTS.TOPIC_IDEATION.IDEA_FILTER_GENDER' | translate">
                                    <div selection>
                                        @if (!selectedGender()) {
                                            <span>{{ 'COMPONENTS.TOPIC_IDEATION.FILTER_ALL' | translate }}</span>
                                        } @else {
                                            <span>{{ 'COMPONENTS.TOPIC_IDEATION.GENDER_' + selectedGender() | uppercase | translate }}</span>
                                        }
                                    </div>
                                    <div options>
                                        <div class="option" (click)="setGender('')" (keydown.enter)="setGender('')" role="button" tabindex="0">
                                            <span>{{ 'COMPONENTS.TOPIC_IDEATION.FILTER_ALL' | translate }}</span>
                                        </div>
                                        <div class="option" (click)="setGender('male')" (keydown.enter)="setGender('male')" role="button" tabindex="0">
                                            <span>{{ 'COMPONENTS.TOPIC_IDEATION.GENDER_MALE' | translate }}</span>
                                        </div>
                                        <div class="option" (click)="setGender('female')" (keydown.enter)="setGender('female')" role="button" tabindex="0">
                                            <span>{{ 'COMPONENTS.TOPIC_IDEATION.GENDER_FEMALE' | translate }}</span>
                                        </div>
                                        <div class="option" (click)="setGender('other')" (keydown.enter)="setGender('other')" role="button" tabindex="0">
                                            <span>{{ 'COMPONENTS.TOPIC_IDEATION.GENDER_OTHER' | translate }}</span>
                                        </div>
                                    </div>
                                </cos-dropdown>
                            </div>"""
    return html.replace(old, new)

def replace_residence(html):
    old = """<div class="dropdown_input">
                                <div class="dropdown" cosDropdown>
                                    <div selection class="selection">
                                        <div class="selected_item">
                                            <div class="label">{{ 'COMPONENTS.TOPIC_IDEATION.IDEA_FILTER_RESIDENCE' | translate }}</div>
                                            @if (!selectedResidence()) {
                                                <span>{{ 'COMPONENTS.TOPIC_IDEATION.FILTER_ALL' | translate }}</span>
                                            } @else if (selectedResidence().startsWith('other:')) {
                                                <span>{{ 'COMPONENTS.TOPIC_IDEATION.RESIDENCE_OTHER' | translate }}</span>
                                            } @else {
                                                <span>{{ selectedResidence() }}</span>
                                            }
                                        </div>
                                        <cos-icon name="chevron-down"></cos-icon>
                                    </div>
                                    <div options class="options">
                                        <div class="option" (click)="setResidence('')" (keydown.enter)="setResidence('')" role="button" tabindex="0">
                                            <span>{{ 'COMPONENTS.TOPIC_IDEATION.FILTER_ALL' | translate }}</span>
                                        </div>
                                        @for (residence of ideaResidences(); track residence) {
                                            <div class="option" (click)="setResidence(residence)" (keydown.enter)="setResidence(residence)" role="button" tabindex="0">
                                                @if (residence.startsWith('other:')) {
                                                    <span>{{ 'COMPONENTS.TOPIC_IDEATION.RESIDENCE_OTHER' | translate }}</span>
                                                } @else {
                                                    <span>{{ residence }}</span>
                                                }
                                            </div>
                                        }
                                    </div>
                                </div>
                            </div>"""
    new = """<div class="dropdown_input">
                                <cos-dropdown [placeholder]="'COMPONENTS.TOPIC_IDEATION.IDEA_FILTER_RESIDENCE' | translate">
                                    <div selection>
                                        @if (!selectedResidence()) {
                                            <span>{{ 'COMPONENTS.TOPIC_IDEATION.FILTER_ALL' | translate }}</span>
                                        } @else if (selectedResidence().startsWith('other:')) {
                                            <span>{{ 'COMPONENTS.TOPIC_IDEATION.RESIDENCE_OTHER' | translate }}</span>
                                        } @else {
                                            <span>{{ selectedResidence() }}</span>
                                        }
                                    </div>
                                    <div options>
                                        <div class="option" (click)="setResidence('')" (keydown.enter)="setResidence('')" role="button" tabindex="0">
                                            <span>{{ 'COMPONENTS.TOPIC_IDEATION.FILTER_ALL' | translate }}</span>
                                        </div>
                                        @for (residence of ideaResidences(); track residence) {
                                            <div class="option" (click)="setResidence(residence)" (keydown.enter)="setResidence(residence)" role="button" tabindex="0">
                                                @if (residence.startsWith('other:')) {
                                                    <span>{{ 'COMPONENTS.TOPIC_IDEATION.RESIDENCE_OTHER' | translate }}</span>
                                                } @else {
                                                    <span>{{ residence }}</span>
                                                }
                                            </div>
                                        }
                                    </div>
                                </cos-dropdown>
                            </div>"""
    return html.replace(old, new)


html = replace_type(html)
html = replace_order(html)
html = replace_participants(html)
html = replace_age(html)
html = replace_gender(html)
html = replace_residence(html)

with open("src/app/features/topics/topic-view/components/topic-ideation/topic-ideation.component.html", "w") as f:
    f.write(html)
print("done")
