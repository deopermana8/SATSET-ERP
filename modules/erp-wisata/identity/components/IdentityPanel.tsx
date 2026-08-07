type IdentityPanelProps = {
  title?: string;
};

export function IdentityPanel({ title = "Identity Security Center" }: IdentityPanelProps) {
  return [
    `<section data-component=\"identity-panel\">`,
    `<h1>${title}</h1>`,
    `<p>Auth, RBAC, Session, Audit, and MFA are generated from IdentityGenerator.</p>`,
    `</section>`
  ].join("");
}
