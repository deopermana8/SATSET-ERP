import { renderCustomerHtml as renderCustomerDocument } from "./render.js";

export function renderCustomerHtml(apiUrl: string): string {
  return renderCustomerDocument(apiUrl);
}
