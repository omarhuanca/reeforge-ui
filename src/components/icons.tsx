import type { ReactNode } from 'react'

// Small stroke icons (currentColor), sized by the design system's CSS (16 to 18px).
const Svg = ({ children }: { children: ReactNode }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {children}
  </svg>
)

export const IconMore = () => (
  <Svg>
    <circle cx="5" cy="12" r="1" fill="currentColor" />
    <circle cx="12" cy="12" r="1" fill="currentColor" />
    <circle cx="19" cy="12" r="1" fill="currentColor" />
  </Svg>
)
export const IconUpload = () => (
  <Svg>
    <path d="M12 16V4M7 9l5-5 5 5M4 20h16" />
  </Svg>
)
export const IconEdit = () => (
  <Svg>
    <path d="M4 20h4L19 9l-4-4L4 16v4zM13.5 6.5l4 4" />
  </Svg>
)
export const IconTrash = () => (
  <Svg>
    <path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" />
  </Svg>
)
export const IconEye = () => (
  <Svg>
    <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z" />
    <circle cx="12" cy="12" r="3" />
  </Svg>
)
export const IconEyeOff = () => (
  <Svg>
    <path d="M3 3l18 18M10.6 5.1A9.7 9.7 0 0112 5c6.4 0 10 7 10 7a17 17 0 01-3.2 4M6.5 6.5A17 17 0 002 12s3.6 7 10 7a9.6 9.6 0 004-.9M9.9 9.9a3 3 0 004.2 4.2" />
  </Svg>
)
export const IconLogout = () => (
  <Svg>
    <path d="M15 4h4v16h-4M10 8l-4 4 4 4M6 12h10" />
  </Svg>
)
