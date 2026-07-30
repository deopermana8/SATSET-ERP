export interface BookRenderAdapter {
  readonly format: string;
  render(markdown: string, title: string, outputDir: string): Promise<{ file: string; error?: string }>;
}
