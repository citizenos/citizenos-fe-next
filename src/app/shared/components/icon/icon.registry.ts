import { Injectable } from '@angular/core';

export type IconName = 'check' | 'chevron-down' | 'close' | 'plus' | 'search' | 'user' | 'bell' | 'facebook' | 'google' | 'smart-id' | 'est-id' | 'mobile-id' | 'id-card' | 'arrow-left' | 'eye' | 'eye-off' | 'spinner';

interface IconData {
  content: string;
  viewBox?: string;
}

@Injectable({
  providedIn: 'root'
})
export class IconRegistryService {
  private registry = new Map<IconName, IconData>([
    [
      'check',
      { content: '<path fill-rule="evenodd" clip-rule="evenodd" d="M20 10C14.48 10 10 14.48 10 20C10 25.52 14.48 30 20 30C25.52 30 30 25.52 30 20C30 14.48 25.52 10 20 10ZM18.0556 25L25.8333 17.2807L24.375 15.8333L18.0556 22.1053L15.625 19.693L14.1667 21.1404L18.0556 25Z" fill="currentColor"/>', viewBox: '0 0 40 40' }
    ],
    [
      'chevron-down',
      { content: '<path d="M17 10L12 15L7 10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>' }
    ],
    [
      'close',
      { content: '<path d="M5.29311 17.2929C4.90258 17.6834 4.90258 18.3166 5.29311 18.7071C5.68363 19.0976 6.3168 19.0976 6.70732 18.7071L12.0002 13.4142L17.2931 18.7071C17.6836 19.0976 18.3168 19.0976 18.7073 18.7071C19.0978 18.3166 19.0978 17.6834 18.7073 17.2929L13.4144 12L18.7073 6.70711C19.0978 6.31658 19.0978 5.68342 18.7073 5.29289C18.3168 4.90237 17.6836 4.90237 17.2931 5.29289L12.0002 10.5858L6.70732 5.29289C6.3168 4.90237 5.68363 4.90237 5.29311 5.29289C4.90258 5.68342 4.90258 6.31658 5.29311 6.70711L10.586 12L5.29311 17.2929Z" fill="currentColor"/>' }
    ],
    [
      'plus',
      { content: '<path d="M12 5V19M5 12H19" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>' }
    ],
    ['search', { content: '<circle cx="11" cy="11" r="8" stroke="currentColor" stroke-width="2"/><path d="M21 21L16.65 16.65" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>' }],
    ['user', { content: '<path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><circle cx="12" cy="7" r="4" stroke="currentColor" stroke-width="2"/>' }],
    ['bell', { content: '<path d="M18 8A6 6 0 0 0 6 8C6 15 3 17 3 17H21C21 17 18 15 18 8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M13.73 21a2 2 0 0 1-3.46 0" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>' }],
    [
      'facebook',
      { content: '<path fill-rule="evenodd" clip-rule="evenodd" d="M7.62604 20V10.8769H10.8425L11.3244 7.32121H7.62604V5.0515C7.62604 4.0222 7.92665 3.32082 9.47691 3.32082L11.4545 3.32018V0.139892C11.1121 0.0968974 9.93862 0 8.57304 0C5.72192 0 3.76994 1.65688 3.76994 4.69984V7.32121H0.54541V10.8769H3.76994V20" fill="#1877F2" />', viewBox: '0 0 12 20' }
    ],
    [
      'google',
      { content: '<path d="M16.5002 10.06C18.4719 10.06 19.8019 10.9117 20.5602 11.6234L23.5235 8.73002C21.7035 7.03834 19.3352 6 16.5002 6C12.3935 6 8.84679 8.35668 7.12012 11.7867L10.5151 14.4234C11.3668 11.8917 13.7235 10.06 16.5002 10.06Z" fill="#EA4335" /><path d="M26.5801 16.7336C26.5801 15.8703 26.5101 15.2403 26.3584 14.5869H16.5V18.4836H22.2867C22.17 19.4519 21.54 20.9103 20.14 21.8903L23.4534 24.457C25.4367 22.6253 26.5801 19.9303 26.5801 16.7336Z" fill="#4285F4" /><path d="M10.5267 18.5771C10.305 17.9238 10.1767 17.2238 10.1767 16.5005C10.1767 15.7771 10.305 15.0771 10.515 14.4238L7.12001 11.7871C6.40834 13.2105 6 14.8088 6 16.5005C6 18.1921 6.40834 19.7905 7.12001 21.2138L10.5267 18.5771Z" fill="#FBBC05" /><path d="M16.4997 27.0005C19.3348 27.0005 21.7148 26.0672 23.4531 24.4572L20.1398 21.8905C19.2531 22.5088 18.0631 22.9405 16.4997 22.9405C13.7231 22.9405 11.3664 21.1088 10.5264 18.5771L7.13135 21.2138C8.85802 24.6439 12.393 27.0005 16.4997 27.0005Z" fill="#34A853" />', viewBox: '0 0 32 32' }
    ],
    [
      'smart-id',
      { content: '<path d="M14,10.3C9.8,13.3,7,18.3,7,24c0,9.4,7.6,17,17,17c1,0,2-0.1,3-0.3V25 M34,37.7c4.2-3.1,7-8.1,7-13.7 c0-9.4-7.6-17-17-17c-1,0-2,0.1-3,0.3V31" style="fill:none;stroke:#003168;stroke-width:2;stroke-linecap:round;stroke-linejoin:round;"></path><circle cx="27" cy="17" r="1" style="fill:#003168;"></circle>', viewBox: '0 0 48 48' }
    ],
    [
      'est-id',
      { content: '<rect width="32" height="32" rx="16" fill="#F9FBFD"/><path d="M14.2173 24H16.0434V22.1176H14.2173V24ZM16.9564 24H18.7825V22.1176H16.9564V24ZM14.2173 21.1765H16.0434V19.2941H14.2173V21.1765ZM16.9564 21.1765H18.7825V19.2941H16.9564V21.1765ZM14.2173 18.3529H16.0434V16.4706H14.2173V18.3529ZM16.9564 18.3529H18.7825V16.4706H16.9564V18.3529ZM14.2173 15.5294H16.0434V13.6471H14.2173V15.5294ZM16.9564 15.5294H18.7825V13.6471H16.9564V15.5294ZM14.2173 12.7059H16.0434V10.8235H14.2173V12.7059ZM16.9564 12.7059H18.7825V10.8235H16.9564V12.7059ZM14.2173 9.88235H16.0434V8H14.2173V9.88235ZM16.9564 9.88235H18.7825V8H16.9564V9.88235ZM22.4347 9.88235H24.2608V8H22.4347V9.88235ZM19.6955 9.88235H21.5216V8H19.6955V9.88235ZM22.4347 12.7059H24.2608V10.8235H22.4347V12.7059ZM25.1738 12.7059H26.9999V10.8235H25.1738V12.7059ZM19.6955 12.7059H21.5216V10.8235H19.6955V12.7059ZM22.4347 15.5294H24.2608V13.6471H22.4347V15.5294ZM25.1738 15.5294H26.9999V13.6471H25.1738V15.5294ZM22.4347 18.3529H24.2608V16.4706H22.4347V18.3529ZM25.1738 18.3529H26.9999V16.4706H25.1738V18.3529ZM19.6955 21.1765H21.5216V19.2941H19.6955V21.1765ZM22.4347 21.1765H24.2608V19.2941H22.4347V21.1765ZM25.1738 21.1765H26.9999V19.2941H25.1738V21.1765ZM19.6955 24H21.5216V22.1176H19.6955V24ZM22.4347 24H24.2608V22.1176H22.4347V24Z" fill="#006CBF"/><path fill-rule="evenodd" clip-rule="evenodd" d="M6 24H7.82609V22.1176H6V24ZM8.73913 24H10.5652V22.1176H8.73913V24ZM6 21.1765H7.82609V19.2941H6V21.1765ZM8.73913 21.1765H10.5652V19.2941H8.73913V21.1765ZM6 18.3529H7.82609V16.4706H6V18.3529ZM8.73913 18.3529H10.5652V16.4706H8.73913V18.3529ZM6 15.5294H7.82609V13.6471H6V15.5294ZM8.73913 15.5294H10.5652V13.6471H8.73913V15.5294ZM6 12.7059H7.82609V10.8235H6V12.7059ZM8.73913 12.7059H10.5652V10.8235H8.73913V12.7059ZM6 9.88235H7.82609V8H6V9.88235ZM8.73913 9.88235H10.5652V8H8.73913V9.88235Z" fill="#F5762D" />', viewBox: '0 0 32 32' }
    ],
    [
      'mobile-id',
      { content: '<g filter="url(#filter0_mid)"><path d="M144.982 239C201.858 239 247.965 192.885 247.965 136C247.965 79.1147 201.858 33 144.982 33C88.1068 33 42 79.1147 42 136C42 192.885 88.1068 239 144.982 239Z" fill="#F9FBFD" /><path d="M151.603 198.726C185.965 197.983 212.791 171.046 213.582 140.629C214.239 115.492 197.021 91.4374 170.859 82.5049" stroke="#003168" stroke-width="9" stroke-miterlimit="10" stroke-linecap="round"></path><path d="M150.669 146.378C153.626 146.378 156.023 143.981 156.023 141.023C156.023 138.065 153.626 135.668 150.669 135.668C147.712 135.668 145.315 138.065 145.315 141.023C145.315 143.981 147.712 146.378 150.669 146.378Z" fill="#003168" stroke="#003168" stroke-miterlimit="10" stroke-linecap="round"></path><path d="M95.5137 82.5381C100.775 90.5872 122.826 118.401 122.826 118.401C122.826 118.401 147.619 88.0702 150.626 82.5381" stroke="#003168" stroke-width="9" stroke-miterlimit="10" stroke-linecap="round"></path><path d="M95.5137 174.187V82.5381" stroke="#003168" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"></path><path d="M151.291 125.706V82.5381" stroke="#003168" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"></path><path d="M150.626 198.76V155.592" stroke="#003168" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"></path></g>', viewBox: '0 0 283 283' }
    ],
    [
      'id-card',
      { content: '<rect x="9.64" y="8.04" width="284.36" height="179.56" rx="8.5" ry="8.5" style="fill:#fff"></rect><path d="M609.81,1070.77H368.33a31.11,31.11,0,0,1-31.08-31.08V906.21a31.11,31.11,0,0,1,31.08-31.08H609.81a31.11,31.11,0,0,1,31.08,31.08v133.48A31.11,31.11,0,0,1,609.81,1070.77Zm-241.48-185a20.49,20.49,0,0,0-20.47,20.47v133.48a20.49,20.49,0,0,0,20.47,20.47H609.81a20.5,20.5,0,0,0,20.47-20.47V906.21a20.5,20.5,0,0,0-20.47-20.47Z" transform="translate(-337.25 -875.13)" style="fill:#003168"></path><path d="M386,1022.43V991.35a15.9,15.9,0,0,1,15.86-15.86h77.29A15.9,15.9,0,0,1,495,991.35v56.25" transform="translate(-337.25 -875.13)" style="fill:#fff"></path><path d="M500.28,1047.6H489.67V991.34a10.56,10.56,0,0,0-10.55-10.55H401.83a10.56,10.56,0,0,0-10.55,10.55v31.09H380.67V991.34a21.18,21.18,0,0,1,21.16-21.16h77.29a21.18,21.18,0,0,1,21.16,21.16Z" transform="translate(-337.25 -875.13)" style="fill:#003168"></path><circle cx="103.23" cy="57.14" r="23.31" style="fill:#fff"></circle><path d="M440.47,960.88a28.62,28.62,0,1,1,28.62-28.61A28.64,28.64,0,0,1,440.47,960.88Zm0-46.62a18,18,0,1,0,18,18A18,18,0,0,0,440.47,914.26Z" transform="translate(-337.25 -875.13)" style="fill:#003168"></path><rect x="181.52" y="45.95" width="77.39" height="10.61" style="fill:#003168"></rect><rect x="181.52" y="73.92" width="77.39" height="10.61" style="fill:#003168"></rect>', viewBox: '0 0 303.64 195.64' }
    ],
    [
      'arrow-left',
      { content: '<path d="M10.4533 6.31262C10.8529 5.89579 11.5009 5.89579 11.9006 6.31262C12.3003 6.72945 12.3003 7.40527 11.9006 7.8221L8.91837 11L19 11C19.5652 11 20 11.4108 20 12.0003C20 12.5897 19.5652 12.9824 19 12.9824L8.91837 12.9824L11.9006 16.1779C12.3003 16.5947 12.3003 17.2705 11.9006 17.6874C11.5009 18.1042 10.8529 18.1042 10.4533 17.6874L5 12L10.4533 6.31262Z" fill="currentColor" />' }
    ],
    [
      'eye',
      { content: '<path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/><circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>' }
    ],
    [
      'eye-off',
      { content: '<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/><line x1="1" y1="1" x2="23" y2="23" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>' }
    ],
    [
      'spinner',
      { content: '<path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>' }
    ]
  ]);

  getIcon(name: IconName): IconData | undefined {
    return this.registry.get(name);
  }
}
