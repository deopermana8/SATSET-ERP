export const icons = {
  menu: "<svg viewBox='0 0 20 20' fill='currentColor'><path d='M3 5h14v2H3zM3 9h14v2H3zM3 13h14v2H3z'/></svg>",
  search: "<svg viewBox='0 0 20 20' fill='currentColor'><path fill-rule='evenodd' d='M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z' clip-rule='evenodd'/></svg>",
  bell: "<svg viewBox='0 0 20 20' fill='currentColor'><path d='M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z'/></svg>",
  chevronRight: "<svg viewBox='0 0 20 20' fill='currentColor'><path fill-rule='evenodd' d='M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 111.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z' clip-rule='evenodd'/></svg>",
} as const;

export type IconName = keyof typeof icons;

export function renderIcon(name: IconName, className = "ic"): string {
  return `<span class='${className}' aria-hidden='true'>${icons[name]}</span>`;
}
