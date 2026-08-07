export type WidgetCardProps = {
  id: string;
  title: string;
  icon: string;
  sizeClass: string;
  body: string;
};

export function renderWidgetCard(props: WidgetCardProps): string {
  return `<article class="card widget-shell ${props.sizeClass}" data-widget="${props.id}" aria-label="${props.title}"><div class="card-hd"><span class="card-title"><span class="w-ic" aria-hidden="true">${props.icon}</span><span>${props.title}</span></span></div><div class="card-body">${props.body}</div></article>`;
}
