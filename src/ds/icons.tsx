/** Inline icon set — original, single-stroke, 24px grid. No icon dependency. */
import type { SVGProps } from 'react';

type P = SVGProps<SVGSVGElement>;
const base = (p: P) => ({
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  width: 20,
  height: 20,
  'aria-hidden': true,
  ...p,
});

export const IconHome = (p: P) => (
  <svg {...base(p)}>
    <path d="M4 10.5 12 4l8 6.5V19a1 1 0 0 1-1 1h-4v-5H9v5H5a1 1 0 0 1-1-1z" />
  </svg>
);
export const IconLearn = (p: P) => (
  <svg {...base(p)}>
    <path d="M4 6.5A2.5 2.5 0 0 1 6.5 4H19v13H6.5A2.5 2.5 0 0 0 4 19.5z" />
    <path d="M19 17v3H6.5A2.5 2.5 0 0 1 4 17.5" />
  </svg>
);
export const IconPath = (p: P) => (
  <svg {...base(p)}>
    <circle cx="6" cy="18" r="2.5" />
    <circle cx="18" cy="6" r="2.5" />
    <path d="M8.5 18h4a3.5 3.5 0 0 0 0-7h-1a3.5 3.5 0 0 1 0-7h4" />
  </svg>
);
export const IconChart = (p: P) => (
  <svg {...base(p)}>
    <path d="M5 20V10M12 20V4M19 20v-6" />
  </svg>
);
export const IconUser = (p: P) => (
  <svg {...base(p)}>
    <circle cx="12" cy="8" r="3.5" />
    <path d="M5 20c0-3.3 3.1-5.5 7-5.5s7 2.2 7 5.5" />
  </svg>
);
export const IconFlame = (p: P) => (
  <svg {...base(p)}>
    <path d="M12 3s5 4 5 8.5A5 5 0 0 1 7 12c0-1.5.6-2.6 1.4-3.4C8.7 10 10 10.5 10 10.5S9.5 6.5 12 3z" />
    <path d="M7 12a5 5 0 0 0 10 0" opacity=".0" />
  </svg>
);
export const IconBolt = (p: P) => (
  <svg {...base(p)}>
    <path d="M13 3 5 13.5h5.5L11 21l8-10.5h-5.5z" />
  </svg>
);
export const IconTarget = (p: P) => (
  <svg {...base(p)}>
    <circle cx="12" cy="12" r="8" />
    <circle cx="12" cy="12" r="3.5" />
  </svg>
);
export const IconCheck = (p: P) => (
  <svg {...base(p)}>
    <path d="m5 12.5 4.5 4.5L19 7" />
  </svg>
);
export const IconX = (p: P) => (
  <svg {...base(p)}>
    <path d="M6 6l12 12M18 6 6 18" />
  </svg>
);
export const IconLock = (p: P) => (
  <svg {...base(p)}>
    <rect x="5" y="10" width="14" height="10" rx="2.5" />
    <path d="M8.5 10V7.5a3.5 3.5 0 0 1 7 0V10" />
  </svg>
);
export const IconSpeaker = (p: P) => (
  <svg {...base(p)}>
    <path d="M5 9.5h3L12 6v12l-4-3.5H5z" />
    <path d="M15.5 9.5a4 4 0 0 1 0 5M18 7a7.5 7.5 0 0 1 0 10" />
  </svg>
);
export const IconMic = (p: P) => (
  <svg {...base(p)}>
    <rect x="9" y="3" width="6" height="11" rx="3" />
    <path d="M5.5 12a6.5 6.5 0 0 0 13 0M12 18.5V21" />
  </svg>
);
export const IconChevronRight = (p: P) => (
  <svg {...base(p)}>
    <path d="m9 5 7 7-7 7" />
  </svg>
);
export const IconChevronLeft = (p: P) => (
  <svg {...base(p)}>
    <path d="m15 5-7 7 7 7" />
  </svg>
);
export const IconBadge = (p: P) => (
  <svg {...base(p)}>
    <path d="m12 3 2.4 4.9 5.4.8-3.9 3.8.9 5.4-4.8-2.5-4.8 2.5.9-5.4L4.2 8.7l5.4-.8z" />
  </svg>
);
export const IconCertificate = (p: P) => (
  <svg {...base(p)}>
    <rect x="3.5" y="4" width="17" height="11" rx="2" />
    <path d="M8 19.5 12 17l4 2.5V15H8z" />
  </svg>
);
export const IconDownload = (p: P) => (
  <svg {...base(p)}>
    <path d="M12 4v10m0 0 3.5-3.5M12 14l-3.5-3.5M5 18h14" />
  </svg>
);
export const IconGlobe = (p: P) => (
  <svg {...base(p)}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M3.5 12h17M12 3.5c2.2 2.4 3.2 5.3 3.2 8.5s-1 6.1-3.2 8.5c-2.2-2.4-3.2-5.3-3.2-8.5S9.8 5.9 12 3.5z" />
  </svg>
);
export const IconBriefcase = (p: P) => (
  <svg {...base(p)}>
    <rect x="3.5" y="7.5" width="17" height="12" rx="2" />
    <path d="M9 7.5V6a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v1.5M3.5 12.5h17" />
  </svg>
);
export const IconBook = (p: P) => (
  <svg {...base(p)}>
    <path d="M4 5.5A1.5 1.5 0 0 1 5.5 4H11v16H5.5A1.5 1.5 0 0 0 4 21.5z" />
    <path d="M20 5.5A1.5 1.5 0 0 0 18.5 4H13v16h5.5a1.5 1.5 0 0 1 1.5 1.5z" />
  </svg>
);
export const IconPlane = (p: P) => (
  <svg {...base(p)}>
    <path d="M10.5 13.5 4 11l1.5-2 6 1L15 5.5a2 2 0 0 1 3 2.6l-3.5 4.4 1 6-2 1.5z" />
  </svg>
);
export const IconChat = (p: P) => (
  <svg {...base(p)}>
    <path d="M20 12.5c0 3.6-3.6 6.5-8 6.5-1 0-2-.15-2.9-.42L4 20.5l1.3-3.4C4.5 16 4 14.3 4 12.5 4 8.9 7.6 6 12 6s8 2.9 8 6.5z" />
  </svg>
);
export const IconSettings = (p: P) => (
  <svg {...base(p)}>
    <circle cx="12" cy="12" r="3" />
    <path d="M12 3.5v2M12 18.5v2M20.5 12h-2M5.5 12h-2M18 6l-1.4 1.4M7.4 16.6 6 18M18 18l-1.4-1.4M7.4 7.4 6 6" />
  </svg>
);
export const IconClock = (p: P) => (
  <svg {...base(p)}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 7.5V12l3 2" />
  </svg>
);
export const IconRefresh = (p: P) => (
  <svg {...base(p)}>
    <path d="M4.5 12a7.5 7.5 0 0 1 12.8-5.3L20 9.5M19.5 12a7.5 7.5 0 0 1-12.8 5.3L4 14.5" />
    <path d="M20 5v4.5h-4.5M4 19v-4.5h4.5" />
  </svg>
);
export const IconCloudOff = (p: P) => (
  <svg {...base(p)}>
    <path d="M7 18h9.5a3.5 3.5 0 0 0 .9-6.9A5.5 5.5 0 0 0 8.2 8.4" />
    <path d="M4 4l16 16" />
    <path d="M7.2 11.2A3.5 3.5 0 0 0 7 18" />
  </svg>
);
