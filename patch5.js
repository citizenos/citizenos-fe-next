const fs = require('fs');
let file = fs.readFileSync('src/app/features/topics/ideation-create/components/step-ideation-settings/step-ideation-settings.component.ts', 'utf8');

const svgCode = `
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="16" height="16" rx="8" fill="white" />
            <path d="M12.6558 9.32812C11.2233 8.52002 9.79067 7.71195 8.35815 6.90385C8.47123 7.10587 8.5843 7.30788 8.71632 7.4916V7.47328C8.71632 7.2345 8.58432 6.99582 8.35815 6.88553C6.92564 6.07743 5.49303 5.26936 4.06051 4.46126C3.26884 4.02046 2.55253 5.21426 3.3442 5.65493C4.77672 6.46303 6.20933 7.2711 7.64185 8.0792C7.52877 7.87718 7.41569 7.67517 7.28368 7.49145V7.50977C7.28368 7.74856 7.41569 7.98723 7.64185 8.09752C9.07436 8.90563 10.507 9.71369 11.9395 10.5218C12.7312 10.9626 13.4475 9.76892 12.6558 9.32812Z" fill="#EF4025" />
            <path d="M8.71632 7.4916L8.71634 2.66112C8.71634 1.77963 7.30264 1.77963 7.30264 2.66112V7.49117C7.30264 8.3728 8.71632 8.37323 8.71632 7.4916Z" fill="#EF4025" />
            <path d="M8.71627 12.3388V7.50873C8.71627 6.62723 7.30257 6.62723 7.30257 7.50873V12.3388C7.30257 13.2204 8.71627 13.2204 8.71627 12.3388Z" fill="#EF4025" />
            <path d="M4.06051 10.5208C6.92563 8.90464 9.7907 7.28856 12.6558 5.69076C13.4475 5.24996 12.7311 4.05625 11.9395 4.49708C9.07435 6.11326 6.20929 7.72933 3.3442 9.32714C2.55253 9.76783 3.26886 10.9615 4.06051 10.5208Z" fill="#EF4025" />
          </svg>`;

// Replace the first number_wrap mobile_hidden
file = file.replace(/        <div class="number_wrap mobile_hidden">\n          <div>1<\/div>\n        <\/div>/, `        <div class="number_wrap mobile_hidden">${svgCode}\n          <div>1</div>\n        </div>`);

// Replace the first number_wrap mobile_show
file = file.replace(/            <div class="number_wrap mobile_show"><div>1<\/div><\/div>/, `            <div class="number_wrap mobile_show">${svgCode}\n              <div>1</div>\n            </div>`);

// Add CSS for svg
file = file.replace(/        align-items: center;\n        justify-content: center;\n        font-weight: 600;/, `        align-items: center;\n        justify-content: center;\n        font-weight: 600;\n        position: relative;\n\n        svg {\n          position: absolute;\n          top: -4px;\n          right: -4px;\n        }`);

fs.writeFileSync('src/app/features/topics/ideation-create/components/step-ideation-settings/step-ideation-settings.component.ts', file);
