const fs = require('fs');
let html = fs.readFileSync('src/app/features/groups/group-detail/group-detail.component.html', 'utf8');

// The original HTML in citizenos-fe-next has:
//       <div id="group_content_wrap">
//         <div id="group_description_wrap">
//           <div id="description_left"> ... </div>
//           <div id="description_right"> ... </div>
//           @if (!moreInfo()) {
//             <div class="mobile_hidden"> ... </div>
//             <div class="button_wrap mobile_show"> ... </div>
//           }
//         </div> <!-- closes group_description_wrap -->
//
//         <!-- EXTRA INFO (expanded) -->
//         <div class="extra-info-collapse" [class.open]="moreInfo()"> ...

// We want to move the @if (!moreInfo()) OUTSIDE group_description_wrap.
// And we want group_content_wrap to close BEFORE group_extra_info.

const target1 = `          </div>
          @if (!moreInfo()) {
            <div class="mobile_hidden">
              <button type="button" id="view_more" class="tablet_show" (click)="moreInfo.set(true)">
                <div class="bold">{{ 'VIEWS.GROUP.LNK_MORE_INFO' | translate }}</div>
                <cos-icon name="chevron-down" [size]="24" color="#1168A8"></cos-icon>
              </button>
            </div>
            <div class="button_wrap mobile_show">
              <button type="button" class="btn_medium_secondary" (click)="moreInfo.set(true)">
                <cos-icon name="chevron-down" [size]="24" color="#1168A8"></cos-icon>
                <span>{{ 'VIEWS.GROUP.LNK_MORE_INFO' | translate }}</span>
              </button>
            </div>
          }
        </div>

        <!-- EXTRA INFO (expanded) -->`;

const replacement1 = `          </div>
        </div>

        @if (!moreInfo()) {
          <div class="mobile_hidden" id="more_info_btn_wrap">
            <button type="button" id="view_more" class="tablet_show" (click)="moreInfo.set(true)">
              <div class="bold">{{ 'VIEWS.GROUP.LNK_MORE_INFO' | translate }}</div>
              <cos-icon name="chevron-down" [size]="24" color="#1168A8"></cos-icon>
            </button>
          </div>
          <div class="button_wrap mobile_show">
            <button type="button" class="btn_medium_secondary" id="view_more_btn" (click)="moreInfo.set(true)">
              <cos-icon name="chevron-down" [size]="24" color="#1168A8"></cos-icon>
              <span>{{ 'VIEWS.GROUP.LNK_MORE_INFO' | translate }}</span>
            </button>
          </div>
        }
      </div>

      <!-- EXTRA INFO (expanded) -->`;

// And we want to remove the closing divs that we moved up.
// Earlier I checked the divs. Currently extra-info-collapse closes at 196:
// 194:             </div>
// 195:           </div>
// 196:         </div>
// Let's replace the bottom:
const target2 = `              </div>
            </div>
          </div>
        </div>

        @if (moreInfo()) {
          <div class="line_separator"></div>
          <button type="button" id="view_more" class="mobile_hidden tablet_hidden" (click)="moreInfo.set(false)">
            <div class="bold">{{ 'VIEWS.GROUP.LNK_CLOSE_INFO' | translate }}</div>
            <cos-icon name="chevron-up" [size]="24" color="#1168A8"></cos-icon>
          </button>
          <div class="button_wrap mobile_show tablet_show">
            <button type="button" class="btn_medium_secondary" id="view_more_btn" (click)="moreInfo.set(false)">
              <cos-icon name="chevron-up" [size]="24" color="#1168A8"></cos-icon>
              <span>{{ 'VIEWS.GROUP.LNK_CLOSE_INFO' | translate }}</span>
            </button>
          </div>
        }

      </div>
    </div>`;

const replacement2 = `            </div>
          </div>
        </div>
      </div>

      @if (moreInfo()) {
        <div class="line_separator"></div>
        <button type="button" id="view_more" class="mobile_hidden tablet_hidden" (click)="moreInfo.set(false)">
          <div class="bold">{{ 'VIEWS.GROUP.LNK_CLOSE_INFO' | translate }}</div>
          <cos-icon name="chevron-up" [size]="24" color="#1168A8"></cos-icon>
        </button>
        <div class="button_wrap mobile_show tablet_show">
          <button type="button" class="btn_medium_secondary" id="view_more_btn" (click)="moreInfo.set(false)">
            <cos-icon name="chevron-up" [size]="24" color="#1168A8"></cos-icon>
            <span>{{ 'VIEWS.GROUP.LNK_CLOSE_INFO' | translate }}</span>
          </button>
        </div>
      }

    </div>
  </div>`;

html = html.replace(target1, replacement1);
html = html.replace(target2, replacement2);
fs.writeFileSync('src/app/features/groups/group-detail/group-detail.component.html', html);
