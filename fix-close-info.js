const fs = require('fs');
let html = fs.readFileSync('src/app/features/groups/group-detail/group-detail.component.html', 'utf8');

const target = `        }
      </div>

      <!-- EXTRA INFO (expanded) -->
        <div class="extra-info-collapse" [class.open]="moreInfo()">`;

const replacement = `        }

      <!-- EXTRA INFO (expanded) -->
        <div class="extra-info-collapse" [class.open]="moreInfo()">`;

const target2 = `        </div>
      }

    </div>
  </div>`;

const replacement2 = `        </div>
      }
      </div>

    </div>
  </div>`;

// First replace: remove the </div> that closes group_info_area too early
html = html.replace(target, replacement);

// Second replace: add the </div> back after the close buttons, and fix the close_info id!
const targetClose = `      @if (moreInfo()) {
        <div class="line_separator"></div>
        <button type="button" id="view_more" class="mobile_hidden tablet_hidden" (click)="moreInfo.set(false)">`;

const replacementClose = `      @if (moreInfo()) {
        <div class="line_separator"></div>
        <button type="button" id="close_info" class="mobile_hidden tablet_hidden" (click)="moreInfo.set(false)">`;

html = html.replace(targetClose, replacementClose);
html = html.replace(target2, replacement2);

fs.writeFileSync('src/app/features/groups/group-detail/group-detail.component.html', html);
