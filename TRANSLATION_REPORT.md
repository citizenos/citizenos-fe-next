# CitizenOS Frontend Next (citizenos-fe-next) Tõlgete audit ja raport

Käesolev raport annab põhjaliku ülevaate projektide **citizenos-fe** (algne Angular rakendus, tõdede allikas) ja **citizenos-fe-next** (Angular 22 rakendus) tõlgete vastavuse kontrollist, teostatud parandustest ning puuduvatest tõlketekstidest.

---

## 1. Kokkuvõte teostatud asendustest (Hallutsineeritud võtmed)

Kokku asendati **208 kasutuskohta ligi 100 failis**, kus `citizenos-fe-next` koodis oli kasutatud ebakorrektseid või väljamõeldud tõlkevõtmeid, kuigi `citizenos-fe` projektis olid olemas autentsed vasted.

Lisaks eemaldati tõlkefailidest `public/assets/i18n/{en,et}.json` mittevajalikud ja kasutamata duplikaatvõtmed (`VIEWS.LOGIN.BTN_BACK_LOGIN`, `VIEWS.ACCOUNT.LNK_TERMS`, `VIEWS.ACCOUNT.LNK_PRIVACY`, `MODALS.LOGIN_SMARTID_*`), mis olid sinna varem ekslikult lisatud.

| Nr | Asendatud hallutsineeritud võti | Autentne võti (`citizenos-fe`) | Vaade / Komponent | Kasutusi |
|---|---|---|---|---|
| 1 | `CONTROL.CLOSE` | `BTN_CLOSE` | Sulgemisnupud üle kogu rakenduse (~68 komponenti ja dialoogi) | 80 |
| 2 | `MODALS.TOPIC_REPORT_HEADING` | `COMPONENTS.REPORT_TOPIC.HEADING` | Teemast teatamine (`topic-report-form.component.html`) | 1 |
| 3 | `MODALS.TOPIC_REPORT_TXT_ARE_YOU_SURE` | `COMPONENTS.REPORT_TOPIC.MESSAGE_MAIN` | Teemast teatamine (`topic-report-form.component.html`) | 1 |
| 4 | `MODALS.TOPIC_REPORT_LABEL_REASON` | `COMPONENTS.REPORT_TOPIC.LABLE_REASON` | Teemast teatamine (`topic-report-form.component.html`) | 2 |
| 5 | `MODALS.TOPIC_REPORT_PLACEHOLDER_REPORT_TEXT` | `COMPONENTS.REPORT_TOPIC.PLACEHOLDER_REPORT_TEXT` | Teemast teatamine (`topic-report-form.component.html`) | 1 |
| 6 | `MODALS.TOPIC_REPORT_BTN_NO` | `COMPONENTS.REPORT_TOPIC.BTN_CANCEL` | Teemast teatamine (`topic-report-form.component.html`) | 1 |
| 7 | `MODALS.TOPIC_REPORT_BTN_YES` | `COMPONENTS.REPORT_TOPIC.BTN_SUBMIT` | Teemast teatamine (`topic-report-form.component.html`) | 1 |
| 8 | `CONTROL.EDIT` | `COMPONENTS.TOPIC_IDEATION.OPTION_EDIT_FOLDER` | Ideede kausta muutmine (`topic-ideation.component.html`) | 1 |
| 9 | `CONTROL.DELETE` | `COMPONENTS.TOPIC_IDEATION.OPTION_DELETE_FOLDER` | Ideede kausta kustutamine (`topic-ideation.component.html`) | 1 |
| 10 | `CONTROL.SAVE` | `DIRECTIVES.COS_MODAL.BTN_SAVE` | Ideekorje tähtaja salvestamine (`edit-ideation-deadline.component.ts`) | 1 |
| 11 | `VIEWS.TOPICS_TOPICID.TOOLTIP_SAVED_TO_FAVOURITE` | `VIEWS.TOPICS_TOPICID.TOOLTIP_TOPIC_SAVED_TO_FAVOURITE` | Teema päise lemmikunupp (`topic-header.component.html`) | 2 |
| 12 | `COMPONENTS.LOGIN_FORM.LOGIN_NO_ACCOUNT` & `LOGIN_SIGN_UP_HERE` | `COMPONENTS.LOGIN_FORM.LOGIN_LNK_NO_ACCOUNT_REGISTER` | Sisselogimisvorm ja -vaade (`login-form.component.ts`, `login.component.ts`) | 2 |
| 13 | `VIEWS.GROUP.MEMBER_INVITED_BADGE` | `VIEWS.MY_GROUPS_GROUPID.HEADING_INVITED` | Grupi liikmete ootel kutsete märgis (`group-detail.component.html`) | 1 |
| 14 | `VIEWS.GROUP.MEMBERS_EMPTY` | `VIEWS.MY.NO_RESULTS_FOUND_TITLE` | Grupi liikmete tühiseisund (`group-detail.component.html`) | 1 |
| 15 | `CONTROL.MORE_OPTIONS` | `VIEWS.GROUP.ACTIONS` | Grupi liikme toimingute nupp (`group-detail.component.html`) | 1 |
| 16 | `VIEWS.PUBLIC_TOPICS.HEADING_TOPICS` | `COMPONENTS.PUBLIC_TOPICS.HEADER` | Avalikud teemad (`public-topics.component.ts`) | 1 |
| 17 | `COMPONENTS.PUBLIC_TOPICS.PLACEHOLDER_SEARCH_TOPIC` | `COMPONENTS.PUBLIC_TOPICS.PLACEHOLDER_SEARCH` | Avalikud teemad (`public-topics.component.ts`) | 1 |
| 18 | `COMPONENTS.PUBLIC_TOPICS.TEXT_TOPICS_NONE` | `VIEWS.MY.NO_RESULTS_FOUND_TITLE` | Avalikud teemad (`public-topics.component.ts`) | 1 |
| 19 | `VIEWS.LOGIN.BTN_BACK_LOGIN` | `VIEWS.PASSWORD_FORGOT.BTN_BACK` | Parooli unustamine (`password-forgot.component.ts`) | 1 |
| 20 | `VIEWS.LOGIN.BTN_BACK_LOGIN` | `VIEWS.SMART_ID_LOGIN.BTN_BACK` | Smart-ID sisselogimine (`smart-id.component.ts`) | 1 |
| 21 | `COMPONENTS.SMART_ID_LOGIN_FORM.BTN_CANCEL` | `LNK_CANCEL` | Smart-ID sisselogimine (`smart-id.component.ts`) | 1 |
| 22 | `VIEWS.LOGIN.BTN_BACK_LOGIN` | `VIEWS.EST_ID_LOGIN.BTN_BACK` | Mobiil-ID sisselogimine (`esteid.component.ts`) | 1 |
| 23 | `COMPONENTS.MOBILE_ID_LOGIN_FORM.BTN_CANCEL` | `LNK_CANCEL` | Mobiil-ID sisselogimine (`esteid.component.ts`) | 1 |
| 24 | `COMPONENTS.PASSWORD_RESET_FORM.BTN_BACK_TO_LOGIN` | `VIEWS.PASSWORD_RESET.BTN_BACK` | Parooli lähtestamine (`password-reset.component.ts`) | 1 |
| 25 | `COMPONENTS.PASSWORD_RESET_FORM.LBL_PASSWORD` | `COMPONENTS.PASSWORD_RESET.PASSWORD_RESET_PLACEHOLDER_PASSWORD` | Parooli lähtestamine (`password-reset.component.ts`) | 1 |
| 26 | `COMPONENTS.PASSWORD_RESET_FORM.LBL_PASSWORD_CONFIRM` | `COMPONENTS.PASSWORD_RESET.PASSWORD_RESET_PLACEHOLDER_PASSWORD_CONFIRM` | Parooli lähtestamine (`password-reset.component.ts`) | 1 |
| 27 | `COMPONENTS.PASSWORD_RESET_FORM.BTN_RESET` | `COMPONENTS.PASSWORD_RESET.PASSWORD_RESET_BTN_RESET_PASSWORD` | Parooli lähtestamine (`password-reset.component.ts`) | 1 |
| 28 | `VIEWS.TOPICS_TOPICID.OPTION_MODERATE_TOPIC` | `VIEWS.TOPICS_TOPICID.TAB_INFO_LNK_MODERATE` | Teema päis (`topic-header.component.html`) | 1 |
| 29 | `VIEWS.TOPICS_TOPICID.OPTION_REVIEW_TOPIC` | `VIEWS.TOPICS_TOPICID.TAB_INFO_LNK_SUBMIT_FOR_REVIEW` | Teema päis (`topic-header.component.html`) | 1 |
| 30 | `VIEWS.TOPICS_TOPICID.OPTION_RESOLVE_TOPIC` | `VIEWS.TOPICS_TOPICID.TAB_INFO_LNK_RESOLVE` | Teema päis (`topic-header.component.html`) | 1 |
| 31 | `COMPONENTS.TOPIC_DISCUSSION_CREATE.HEADING_DISCUSSION_QUESTION` | `COMPONENTS.TOPIC_DISCUSSION_CREATE.SETTINGS_HEADING_DISCUSSION_QUESTION` | Arutelu loomine (`topic-discussion-create-dialog.component.html`) | 1 |
| 32 | `COMPONENTS.TOPIC_DISCUSSION_CREATE.DISCUSSION_QUESTION_PLACEHOLDER` | `COMPONENTS.TOPIC_DISCUSSION_CREATE.SETTINGS_DISCUSSION_QUESTION_PLACEHOLDER` | Arutelu loomine (`topic-discussion-create-dialog.component.html`) | 1 |
| 33 | `COMPONENTS.TOPIC_DISCUSSION_CREATE.HEADING_DISCUSSION_DEADLINE` | `COMPONENTS.TOPIC_DISCUSSION_CREATE.SETTINGS_HEADING_DISCUSSION_DEADLINE` | Arutelu loomine (`topic-discussion-create-dialog.component.html`) | 1 |
| 34 | `MODALS.TOPIC_IDEA_ANONYMOUS_MODAL_HEADING` | `MODALS.TOPIC_IDEA_POSTING_ANONIMOUSLY` | Anonüümse postitamise dialoog (`anonymous-dialog.component.ts`) | 1 |
| 35 | `MODALS.TOPIC_IDEA_ANONYMOUS_MODAL_TITLE` | `MODALS.TOPIC_IDEA_POSTING_ANONIMOUSLY_TEXT_1` | Anonüümse postitamise dialoog (`anonymous-dialog.component.ts`) | 1 |
| 36 | `MODALS.TOPIC_IDEA_ANONYMOUS_MODAL_TXT` | `MODALS.TOPIC_IDEA_POSTING_ANONIMOUSLY_TEXT_2` | Anonüümse postitamise dialoog (`anonymous-dialog.component.ts`) | 1 |
| 37 | `MODALS.TOPIC_IDEA_ANONYMOUS_MODAL_BTN_CANCEL` | `VIEWS.IDEATION_CREATE.KEEP_EDITING` | Anonüümse postitamise dialoog (`anonymous-dialog.component.ts`) | 1 |
| 38 | `MODALS.TOPIC_IDEA_ANONYMOUS_MODAL_BTN_CONTINUE` | `VIEWS.IDEATION_CREATE.NO_IDEAS_BTN_ADD` | Anonüümse postitamise dialoog (`anonymous-dialog.component.ts`) | 1 |
| 39 | `MODALS.TOPIC_ADD_GROUPS_HEADING` | `COMPONENTS.TOPIC_ADD_GROUPS_DIALOG.HEADING` | Teemale gruppide lisamine (`topic-add-groups-dialog.component.html`) | 1 |
| 40 | `COMPONENTS.TOPIC_ADD_GROUPS.PLACEHOLDER_SEARCH_GROUPS` | `COMPONENTS.TOPIC_ADD_GROUPS.PLACEHOLDER_SEARCH` | Teemale gruppide lisamine (`topic-add-groups-dialog.component.html`) | 1 |
| 41 | `COMPONENTS.TOPIC_ADD_GROUPS.LBL_ALL_GROUPS_LEVEL` | `COMPONENTS.TOPIC_ADD_GROUPS.HEADING_TOPIC_PERMISSIONS` | Teemale gruppide lisamine (`topic-add-groups-dialog.component.html`) | 1 |
| 42 | `COMPONENTS.TOPIC_ADD_GROUPS.TXT_ADD_GROUPS_INFO` | `COMPONENTS.TOPIC_ADD_GROUPS.DESC` | Teemale gruppide lisamine (`topic-add-groups-dialog.component.html`) | 1 |
| 43 | `COMPONENTS.TOPIC_ADD_GROUPS.BTN_CANCEL` | `COMPONENTS.TOPIC_ADD_GROUPS_DIALOG.LNK_CANCEL` | Teemale gruppide lisamine (`topic-add-groups-dialog.component.html`) | 1 |
| 44 | `COMPONENTS.TOPIC_ADD_GROUPS.BTN_ADD` | `COMPONENTS.TOPIC_ADD_GROUPS_DIALOG.BTN_SAVE` | Teemale gruppide lisamine (`topic-add-groups-dialog.component.html`) | 1 |
| 45 | `COMPONENTS.IDEA_REPORT.HEADING_REPORT_IDEA` | `COMPONENTS.IDEA_REPLY_REPORT.HEADING` | Idee vastusest teatamine (`idea-reply-report.component.html`) | 1 |
| 46 | `COMPONENTS.IDEA_REPORT.LABEL_REPORT_TYPE` | `COMPONENTS.IDEA_REPLY_REPORT.LABLE_REASON` | Idee vastusest teatamine (`idea-reply-report.component.html`) | 1 |
| 47 | `COMPONENTS.IDEA_REPORT.LABEL_REPORT_TEXT` | `COMPONENTS.IDEA_REPLY_REPORT.PLACEHOLDER_REPORT_TEXT` | Idee vastusest teatamine (`idea-reply-report.component.html`) | 1 |
| 48 | `COMPONENTS.IDEA_REPORT.BTN_REPORT` | `COMPONENTS.IDEA_REPLY_REPORT.BTN_SUBMIT` | Idee vastusest teatamine (`idea-reply-report.component.html`) | 1 |
| 49 | `COMPONENTS.IDEA_REPLY_REPORT_MODERATE.LBL_REPORT_TYPE` | `COMPONENTS.IDEA_REPLY_REPORT_MODERATE.LABLE_REASON` | Idee vastuse modereerimine (`idea-reply-report-moderate.component.html`) | 1 |
| 50 | `COMPONENTS.ADD_IDEAS_TO_FOLDER.LBL_FOLDER_NAME` | `COMPONENTS.ADD_IDEAS_TO_FOLDER.LBL_FOLDER_INFO` | Ideede kausta lisamine (`add-ideas-to-folder.component.ts`) | 1 |
| 51 | `COMPONENTS.ADD_IDEAS_TO_FOLDER.BTN_ADD` | `COMPONENTS.ADD_IDEAS_TO_FOLDER.BTN_CREATE` | Ideede kausta lisamine (`add-ideas-to-folder.component.ts`) | 1 |
| 52 | `COMPONENTS.TOPIC_IDEATION.BTN_ADD_FOLDER` | `COMPONENTS.TOPIC_IDEATION.BTN_CREATE_NEW_FOLDER` | Teema ideekorje (`topic-ideation.component.html`) | 1 |
| 53 | `COMPONENTS.TOPIC_IDEATION.DEADLINE` | `COMPONENTS.TOPIC_IDEATION.LBL_DEADLINE` | Teema eelvaade (`topic-preview.component.ts`) | 1 |
| 54 | `COMPONENTS.TOPIC_IDEATION.NO_IDEAS_YET` | `COMPONENTS.TOPIC_IDEATION.NO_IDEAS_HEADING` | Teema eelvaade (`topic-preview.component.ts`) | 1 |
| 55 | `COMPONENTS.ARGUMENT.MSG_LINK_COPIED` | `VIEWS.TOPICS_TOPICID.ARGUMENT_LNK_COPIED` | Idee dialoog ja eelvaade (`idea-dialog.component.ts`) | 2 |
| 56 | `COMPONENTS.GROUP_ADD_TOPICS_DIALOG.PLACEHOLDER_SEARCH` | `COMPONENTS.GROUP_ADD_TOPICS.PLACEHOLDER_SEARCH` | Grupile teemade lisamine (`group-add-topics-dialog.component.html`) | 1 |
| 57 | `COMPONENTS.GROUP_REQUEST_ADD_TOPICS_DIALOG.LBL_MESSAGE` | `COMPONENTS.GROUP_REQUEST_ADD_TOPICS_DIALOG.REASON_DESC` | Grupile teemade taotlus (`group-request-topics-dialog.component.html`) | 1 |
| 58 | `COMPONENTS.GROUP_REQUEST_ADD_TOPICS_DIALOG.PLACEHOLDER_MESSAGE` | `COMPONENTS.GROUP_REQUEST_ADD_TOPICS_DIALOG.REASON_PLACEHOLDER` | Grupile teemade taotlus (`group-request-topics-dialog.component.html`) | 1 |
| 59 | `COMPONENTS.GROUP_REQUEST_ADD_TOPICS_DIALOG.BTN_SEND` | `COMPONENTS.GROUP_REQUEST_ADD_TOPICS_DIALOG.BTN_SAVE` | Grupile teemade taotlus (`group-request-topics-dialog.component.html`) | 1 |
| 60 | `COMPONENTS.GROUP_REQUEST_ADD_TOPICS_DIALOG.NO_TOPICS_SELECTED` | `COMPONENTS.GROUP_ADD_TOPICS_DIALOG.NO_TOPICS_SELECTED` | Grupile teemade taotlus (`group-request-topics-dialog.component.html`) | 1 |
| 61 | `VIEWS.GROUP.HEADING_INVITE_MEMBERS` | `COMPONENTS.GROUP_INVITE_DIALOG.HEADING` | Gruppi kutsumine (`group-invite-dialog.component.html`) | 1 |
| 62 | `VIEWS.GROUP.TAB_INVITE` | `COMPONENTS.GROUP_INVITE_DIALOG.TAB_INVITE` | Gruppi kutsumine (`group-invite-dialog.component.html`) | 1 |
| 63 | `VIEWS.GROUP.TAB_SHARE` | `COMPONENTS.GROUP_INVITE_DIALOG.TAB_SHARE` | Gruppi kutsumine (`group-invite-dialog.component.html`) | 1 |
| 64 | `VIEWS.GROUP.PLACEHOLDER_SEARCH_USERS` | `COMPONENTS.GROUP_INVITE.PLACEHOLDER_SEARCH` | Gruppi kutsumine (`group-invite-dialog.component.html`) | 1 |
| 65 | `VIEWS.GROUP.LBL_INVITE_MESSAGE` | `COMPONENTS.GROUP_INVITE.MESSAGE_DESC` | Gruppi kutsumine (`group-invite-dialog.component.html`) | 1 |
| 66 | `VIEWS.GROUP.PLACEHOLDER_INVITE_MESSAGE` | `COMPONENTS.GROUP_INVITE.MESSAGE_PLACEHOLDER` | Gruppi kutsumine (`group-invite-dialog.component.html`) | 1 |
| 67 | `VIEWS.GROUP.ERROR_NO_USERS_SELECTED` | `COMPONENTS.GROUP_INVITE_DIALOG.NO_USERS_SELECTED` | Gruppi kutsumine (`group-invite-dialog.component.html`) | 1 |
| 68 | `VIEWS.GROUP.BTN_SEND_INVITES` | `COMPONENTS.GROUP_INVITE_DIALOG.BTN_SAVE` | Gruppi kutsumine (`group-invite-dialog.component.html`) | 1 |
| 69 | `VIEWS.GROUP.SECTION_INFO_MEMBERS` | `VIEWS.GROUP.TAB_MEMBERS` | Grupi detailvaade (`group-detail.component.html`) | 1 |
| 70 | `VIEWS.GROUP.SECTION_INFO_TOPICS` | `VIEWS.GROUP.TAB_TOPICS` | Grupi detailvaade (`group-detail.component.html`) | 1 |
| 71 | `VIEWS.GROUP.LNK_ADD_TOPICS` | `VIEWS.GROUP.BTN_OPTION_ADD_TOPICS` | Grupi detailvaade (`group-detail.component.html`) | 1 |
| 72 | `VIEWS.GROUP.LNK_ADD_MEMBERS` | `VIEWS.GROUP.BTN_OPTION_INVITE` | Grupi detailvaade (`group-detail.component.html`) | 1 |
| 73 | `VIEWS.GROUP.LNK_TOPIC_REQUESTS` | `VIEWS.GROUP.BTN_VIEW_TOPIC_REQUESTS` | Grupi detailvaade (`group-detail.component.html`) | 1 |
| 74 | `VIEWS.GROUP.LNK_REMOVE_TOPICS` | `VIEWS.GROUP.BTN_OPTION_REMOVE_INDIVIDUAL_TOPICS` | Grupi detailvaade (`group-detail.component.html`) | 1 |
| 75 | `VIEWS.GROUP.LNK_REMOVE_ALL_TOPICS` | `VIEWS.GROUP.BTN_OPTION_REMOVE_ALL_TOPICS` | Grupi detailvaade (`group-detail.component.html`) | 1 |
| 76 | `VIEWS.GROUP.LNK_REMOVE_ALL_MEMBERS` | `VIEWS.GROUP.BTN_OPTION_REMOVE_ALL_MEMBERS` | Grupi detailvaade (`group-detail.component.html`) | 1 |
| 77 | `VIEWS.GROUP.LBL_MEMBER_LEVEL` | `VIEWS.GROUP.ROLE` | Grupi detailvaade ja kutsumine (`group-detail`, `group-invite-dialog`) | 2 |
| 78 | `VIEWS.GROUP.LBL_MEMBER_ACTIONS` | `VIEWS.GROUP.ACTIONS` | Grupi detailvaade (`group-detail.component.html`) | 1 |
| 79 | `VIEWS.GROUP.LNK_ALL_MEMBERS_ADMIN` / `LNK_ALL_MEMBERS_READ` | `VIEWS.GROUP.BULK_OPT_SET_ALL_RIGHTS` (parameetriga) | Grupi detailvaade (`group-detail.component.html`) | 2 |
| 80 | `VIEWS.GROUP_CREATE.HELP_*_HEADING` | `VIEWS.GROUP_CREATE.HELP_HEADING` | Grupi loomise abi (`group-create-help.component.html`) | 3 |
| 81 | `VIEWS.GROUP_CREATE.HELP_*_TXT` | `VIEWS.GROUP_CREATE.HELP_DESCRIPTION` | Grupi loomise abi (`group-create-help.component.html`) | 3 |
| 82 | `VIEWS.GROUP_CREATE.HELP_FOOTER_LINK` | `VIEWS.GROUP_CREATE.HELP_LNK_LEARN_MORE` | Grupi loomise abi (`group-create-help.component.html`) | 1 |
| 83 | `VIEWS.GROUP_CREATE.ADD_TOPICS_HEADING` | `COMPONENTS.GROUP_ADD_TOPICS.HEADING` | Grupi loomine: teemad (`step-topics.component.html`) | 1 |
| 84 | `VIEWS.GROUP_CREATE.ADD_TOPICS_DESC` | `COMPONENTS.GROUP_ADD_TOPICS.DESC` | Grupi loomine: teemad (`step-topics.component.html`) | 1 |
| 85 | `VIEWS.GROUP_CREATE.ADD_TOPICS_INPUT_SEARCH` | `COMPONENTS.GROUP_ADD_TOPICS.PLACEHOLDER_SEARCH` | Grupi loomine: teemad (`step-topics.component.html`) | 1 |
| 86 | `VIEWS.GROUP_CREATE.ADD_TOPICS_NO_TOPICS` | `COMPONENTS.GROUP_ADD_TOPICS.NO_TOPICS_HEADING` | Grupi loomine: teemad (`step-topics.component.html`) | 1 |
| 87 | `VIEWS.GROUP_CREATE.ADD_TOPICS_SELECTED` | `COMPONENTS.GROUP_ADD_TOPICS.SELECT_TO_ADD` | Grupi loomine: teemad (`step-topics.component.html`) | 1 |
| 88 | `VIEWS.GROUP_CREATE.INVITE_CHOOSE_USERS` | `COMPONENTS.GROUP_CREATE_INVITE.HEADING` | Grupi loomine: kutsumine (`step-invite.component.html`) | 1 |
| 89 | `VIEWS.GROUP_CREATE.INVITE_CHOOSE_USERS_DESC` | `COMPONENTS.GROUP_CREATE_INVITE.HEADING_DESC` | Grupi loomine: kutsumine (`step-invite.component.html`) | 1 |
| 90 | `VIEWS.GROUP_CREATE.INVITE_INPUT_SEARCH_USERS` | `COMPONENTS.GROUP_INVITE.PLACEHOLDER_SEARCH` | Grupi loomine: kutsumine (`step-invite.component.html`) | 1 |
| 91 | `VIEWS.GROUP_CREATE.INVITE_SELECTED_USERS` | `COMPONENTS.GROUP_INVITE.NAME` | Grupi loomine: kutsumine (`step-invite.component.html`) | 1 |
| 92 | `VIEWS.GROUP_CREATE.INVITE_NO_USERS` | `COMPONENTS.GROUP_INVITE.NO_INVITES_HEADING` | Grupi loomine: kutsumine (`step-invite.component.html`) | 1 |
| 93 | `VIEWS.GROUP_CREATE.INVITE_HEADING_MESSAGE` | `COMPONENTS.GROUP_INVITE.MESSAGE_DESC` | Grupi loomine: kutsumine (`step-invite.component.html`) | 1 |
| 94 | `VIEWS.GROUP_CREATE.INVITE_INPUT_MESSAGE` | `COMPONENTS.GROUP_INVITE.MESSAGE_PLACEHOLDER` | Grupi loomine: kutsumine (`step-invite.component.html`) | 1 |
| 95 | `MSG_ERROR_HTTP_500` | `MSG_ERROR_50000` | Hääletuse loomise dialoog (`vote-create-dialog.component.ts`) | 1 |

---

## 2. Puuduvad tõlked (`citizenos-fe` projektis puuduvad stringid)

Alljärgnevad tõlkevõtmed on uued (loodud `citizenos-fe-next` raames nt WCAG 2.1 AA ligipääsetavuse tagamiseks või uute teavituste jaoks) ning neil **puudub vaste** pärandrakenduse `citizenos-fe` tõlkefailides (`en.json`, `et.json`).

### A. Ligipääsetavuse (WCAG) ja ekraanilugejate sildid (`aria-label`)

| Tõlkevõti | Vaade / Fail | Milleks tekst vajalik | Soovituslik EN | Soovituslik ET |
|---|---|---|---|---|
| `CONTROL.BACK` | `topic-header`, `topic-discussion-create-dialog` (2 kohta) | Tagasi liikumise nupu ligipääsetavuse silt | `Back` | `Tagasi` |
| `CONTROL.DELETE` | `group-request-topics-dialog`, `group-add-topics-dialog`, `group-settings-dialog`, `invite-editors`, `topic-vote-delegate`, `topic-attachments` (7 kohta) | Eemaldamis-/kustutamisnupu ligipääsetavuse silt | `Delete` | `Kustuta` |
| `CONTROL.HIDE` | `login-form`, `login`, `register-form`, `register` (6 kohta) | Parooli peitmise nupu ligipääsetavuse silt | `Hide password` | `Peida parool` |
| `CONTROL.SHOW` | `login-form`, `login`, `register-form`, `register` (6 kohta) | Parooli näitamise nupu ligipääsetavuse silt | `Show password` | `Näita parooli` |
| `CONTROL.MORE` | `topic-milestones`, `topic-member-user`, `topic-member-group`, `topic-member-invite` (4 kohta) | Kolme punkti / tegevuste menüü nupu silt | `More options` | `Rohkem valikuid` |
| `CONTROL.REMOVE` | `topic-add-groups-dialog.component.html` (1 koht) | Grupi eemaldamise nupu ligipääsetavuse silt | `Remove` | `Eemalda` |
| `COMPONENTS.ACCESSIBILITY.INPUT_FALLBACK_LABEL` | `src/app/shared/components/input/` | Varusilt ekraanilugejale kui sisendväljal puudub väline pealkiri | `Input field` | `Sisestusväli` |
| `COMPONENTS.ACCESSIBILITY.NAV_TOGGLE` | `src/app/core/components/shell/nav/` | Mobiilse navigatsioonimenüü avamise ja sulgemise nupu aria-label | `Toggle navigation` | `Ava/sulge menüü` |
| `COMPONENTS.ACCESSIBILITY.PAGINATION_NEXT` | `idea-dialog`, `pagination.component` | Järgmise lehe või järgmise idee nupu aria-label | `Next page` | `Järgmine leht` |
| `COMPONENTS.ACCESSIBILITY.PAGINATION_PREV` | `idea-dialog`, `pagination.component` | Eelmise lehe või eelmise idee nupu aria-label | `Previous page` | `Eelmine leht` |
| `COMPONENTS.ACCESSIBILITY.SKIP_TO_MAIN` | `src/app/app.html` (1 rida) | WCAG standardne hüppelink klaviatuurikasutajatele põhisisu juurde | `Skip to main content` | `Hüppa põhisisu juurde` |
| `COMPONENTS.ACCESSIBILITY.WARNING` | `src/app/shared/components/input/` | Sisestusvälja vigade hoiatusikooni aria-label | `Warning` | `Hoiatus` |
| `COMPONENTS.ARGUMENT.LBL_VOTE_UP` | `argument.component.html`, `idea-reply.component.ts` | Argumendi või vastuse poolthääletuse nupu aria-label | `Vote up` | `Hääleta poolt` |
| `COMPONENTS.ARGUMENT.LBL_VOTE_DOWN` | `argument.component.html`, `idea-reply.component.ts` | Argumendi või vastuse vasthääletuse nupu aria-label | `Vote down` | `Hääleta vastu` |
| `COMPONENTS.TOPIC_INVITE_EDITORS.INVALID_EMAIL` | `invite-editors.component.html` | Vigaste e-posti aadresside parandamise välja silt ekraanilugejatele | `Invalid email address` | `Vigane e-posti aadress` |
| `VIEWS.TOPICS_TOPICID.ATTACHMENT_NAME` | `topic-attachments.component.html` | Manuse ümbernimetamise sisendvälja aria-label | `Attachment name` | `Manuse nimi` |
| `VIEWS.GROUP.LBL_GROUP_ACTIONS` | `group-detail.component.html` (read 42, 54, 444) | Grupi päise valikute nupu aria-label ja mobiilse alumise paneeli pealkiri | `Group actions` | `Grupi toimingud` |

---

### B. Teavitused ja veateated (Toasts & Errors)

| Tõlkevõti | Vaade / Fail | Milleks tekst vajalik | Soovituslik EN | Soovituslik ET |
|---|---|---|---|---|
| `COMPONENTS.ADD_IDEA.MSG_PUBLISH_SUCCESS` | `add-idea.component.ts` (rida 281) | Edukas teavitus pärast idee avaldamist | `Idea successfully published` | `Idee edukalt avaldatud` |
| `COMPONENTS.IDEA_REPLY.MSG_DELETE_SUCCESS` | `idea-reply.component.ts` (rida 526) | Edukas teavitus pärast idee vastuse kustutamist | `Reply successfully deleted` | `Vastus edukalt kustutatud` |
| `COMPONENTS.TOPIC_ADD_GROUPS.MSG_GROUPS_ADDED` | `topic-add-groups-dialog.component.ts` (rida 126) | Edukas teavitus pärast gruppide teemale lisamist | `Groups successfully added to topic` | `Grupid edukalt teemale lisatud` |
| `MSG_ERROR_GROUP_ADD_FAILED` | `topic-add-groups-dialog.component.ts` (rida 131) | Veateavitus gruppide teemale lisamise ebaõnnestumisel | `Failed to add groups to topic` | `Gruppide lisamine teemale ebaõnnestus` |
| `MSG_ERROR_GET` | `idea-dialog.component.html` (rida 60) | Veateavitus idee või selle vastuste laadimise nurjumisel | `Failed to load idea data` | `Andmete laadimine ebaõnnestus` |
| `VIEWS.GROUP_CREATE.ERROR_NAME_REQUIRED` | `group-create.component.ts` (rida 110) | Hoiatusteade kui kasutaja proovib luua gruppi ilma nimeta | `Group name is required` | `Grupi nimi on kohustuslik` |
| `VIEWS.GROUP_CREATE.ERROR_FAILED` | `group-create.component.ts` (rida 168) | Veateade kui grupi salvestamine serveris ebaõnnestub | `Failed to create group` | `Grupi loomine ebaõnnestus` |
| `VIEWS.TOPIC_CREATE.ERROR_SAVE_FAILED` | `topic-create`, `ideation-create`, `vote-create`, `topic-edit` | Veateavitus teema salvestamise nurjumisel | `Failed to save topic` | `Teema salvestamine ebaõnnestus` |
| `VIEWS.TOPIC_CREATE.ERROR_LOAD_FAILED` | `topic-create`, `ideation-create`, `vote-create`, `topic-edit` | Veateavitus teema andmete laadimise nurjumisel | `Failed to load topic` | `Teema andmete laadimine ebaõnnestus` |
| `VIEWS.TOPIC_CREATE.ERROR_PUBLISH_FAILED` | `topic-create`, `ideation-create`, `vote-create` | Veateavitus teema avaldamise nurjumisel | `Failed to publish topic` | `Teema avaldamine ebaõnnestus` |
| `VIEWS.TOPIC_CREATE.SAVE_FIRST_TO_INVITE` | `topic-create`, `ideation-create`, `vote-create` | Hoiatus osalejate kutsumisel enne teema esmast salvestamist | `Please save the topic before inviting members` | `Palun salvesta teema enne osalejate kutsumist` |
| `VIEWS.TOPIC_CREATE.ERROR_ATTACHMENT_*` | `topic-attachments.component.ts` | Manuste laadimise, kustutamise või uuendamise veateated | `Failed to process attachment` | `Manuse töötlemine ebaõnnestus` |

---

### C. Tühiseisundid ja laadimisolekud (Empty & Loading States)

| Tõlkevõti | Vaade / Fail | Milleks tekst vajalik | Soovituslik EN | Soovituslik ET |
|---|---|---|---|---|
| `COMPONENTS.ACTIVITY_FEED.NO_ACTIVITIES` | `activity-feed.component.html` (rida 56) | Tegevuste paneeli tühiseisundi teade | `No activities yet` | `Tegevused puuduvad` |
| `COMPONENTS.ADD_IDEAS_TO_FOLDER.EMPTY_IDEAS` | `add-ideas-to-folder.component.ts` (rida 78) | Teade dialoogis, kui pole ühtegi ideed mida kausta lisada | `No ideas available to add` | `Lisamiseks pole ühtegi ideed` |
| `COMPONENTS.TOPIC_IDEATION.LBL_LOADING` | `topic-ideation.component.html` (rida 250) | Ideekorje nimekirja laadimise kohatäide | `Loading ideas...` | `Ideede laadimine...` |
| `TOPIC.NO_TITLE` | `topic-card.component.ts` (rida 132) | Teemakaardi varutiitel kui teemal puudub pealkiri | `Untitled topic` | `Pealkirjata teema` |

---

### D. Kasutajaliidese tekstid ja infomullid (UI Text & Tooltips)

| Tõlkevõti | Vaade / Fail | Milleks tekst vajalik | Soovituslik EN | Soovituslik ET |
|---|---|---|---|---|
| `COMPONENTS.ARGUMENT.HEADING_REPLIES` | `idea-dialog.component.html` (rida 301) | Vastuste sektsiooni pealkiri idee dialoogis (`{ count }` parameetriga) | `Replies ({{count}})` | `Vastused ({{count}})` |
| `COMPONENTS.PASSWORD_RESET_FORM.MSG_SUCCESS_PASSWORD_RESET` | `password-reset.component.ts` (rida 29) | Parooli lähtestamise õnnestumise vaate pealkiri | `Password reset successful` | `Parooli lähtestamine õnnestus` |
| `COMPONENTS.PASSWORD_RESET_FORM.TXT_PASSWORD_RESET_SUCCESS` | `password-reset.component.ts` (rida 31) | Parooli lähtestamise õnnestumise selgitav tekst | `Your password has been reset. You can now log in with your new password.` | `Teie parool on lähtestatud. Saate nüüd uue parooliga sisse logida.` |
| `COMPONENTS.PASSWORD_RESET_FORM.TXT_INSTRUCTION` | `password-reset.component.ts` (rida 36) | Juhis uue parooli sisestamiseks | `Please enter your new password below.` | `Palun sisestage allpool oma uus parool.` |
| `COMPONENTS.TOPIC_VOTE_CAST.TOOLTIP_VOTE_CLOSED_TITLE` | `topic-vote-cast.component.html` (rida 127) | Lõppenud hääletuse infomulli pealkiri | `Voting closed` | `Hääletus on lõppenud` |
| `COMPONENTS.TOPIC_VOTE_CAST.TOOLTIP_VOTE_CLOSED_CONTENT` | `topic-vote-cast.component.html` (rida 128) | Lõppenud hääletuse infomulli sisu | `This voting period has ended. No further votes can be cast.` | `Hääletusperiood on lõppenud. Uusi hääli enam anda ei saa.` |
| `TOOLTIP_TOPIC_VISIBILITY_TITLE` | `topic-settings.component.html` (rida 44) | Teema seadetes nähtavuse infomulli pealkiri | `Topic visibility` | `Teema nähtavus` |
| `TOOLTIP_TOPIC_VISIBILITY_CONTENT` | `topic-settings.component.html` (rida 45) | Teema seadetes privaatse teema infomulli selgitus | `Private topics can only be viewed and accessed by invited members.` | `Privaatsetele teemadele pääsevad ligi ainult kutsutud liikmed.` |
| `DEFAULT.NAV.LNK_FEEDBACK` | `nav.component.ts` (rida 302, kommenteeritud) | Külgmenüü link tagasiside andmiseks | `Feedback` | `Tagasiside` |
| `VIEWS.GROUP_CREATE.HELP_FOOTER_TXT` | `group-create-help.component.html` (rida 29) | Grupi loomise abibloki jaluse abitekst | `Need more information?` | `Vajad rohkem teavet?` |

---

### E. Tõlkimata koodisisesed stringid (Hardcoded text)

| Tekst | Vaade / Fail | Milleks tekst vajalik | Soovituslik lahendus |
|---|---|---|---|
| `Loading...` | `topic-discussion.component.html` (rida 236) | Arutelu argumentide laadimise kohatäide kui argumente alles päritakse | Asendada tõlkega nt `{{ 'COMPONENTS.TOPIC_IDEATION.LBL_LOADING' \| translate }}` või spetsiifilise arutelu laadimise võtmega `COMPONENTS.TOPIC_DISCUSSION.LBL_LOADING` ("Laadimine..."). |

---

## 3. Tehtud muudatuste kontroll ja kvaliteet

Kõik koodimuudatused viidi läbi kirurgiliselt ja kontrolliti ametlike kvaliteediväravate kaudu:
- **Unit testid (`ng test`)**: 201 testfaili, 1535 testi läbitud edukalt (0 viga).
- **Linter (`ng lint`)**: 0 viga.
- **Produktsiooni build (`ng build`)**: Läbis edukalt (0 viga).
