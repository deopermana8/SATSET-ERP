export type LifecycleMeta = {
  apiUrl: string;
  generatedAt: string;
  buildLabel: string;
};

function escapeJson(value: string): string {
  return value.replace(/</g, "\\u003c").replace(/>/g, "\\u003e");
}

export function withLifecycleEnvelope(html: string, meta: LifecycleMeta): string {
  const payload = escapeJson(JSON.stringify(meta));
  const marker = `<script id="app-meta" type="application/json">${payload}</script>`;
  if (html.includes("</head>")) {
    return html.replace("</head>", `${marker}\n</head>`);
  }
  return `${marker}\n${html}`;
}
