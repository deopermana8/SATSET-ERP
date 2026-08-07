export const duration = {
  fast: "120ms",
  normal: "180ms",
  slow: "280ms",
} as const;

export const easing = {
  standard: "cubic-bezier(.2,.8,.2,1)",
  emphasized: "cubic-bezier(.16,1,.3,1)",
} as const;

export const motion = {
  fade: `opacity ${duration.normal} ${easing.standard}`,
  slide: `transform ${duration.normal} ${easing.emphasized}`,
  scale: `transform ${duration.fast} ${easing.standard}`,
} as const;
