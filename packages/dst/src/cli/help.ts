export function printHelp(): void {
  console.log("Usage: node dist/cli/index.js <spec.yaml>");
  console.log("");
  console.log("DST CLI orchestrates:");
  console.log("1) Read YAML specification");
  console.log("2) Parse with parseCustomerSpecYaml()");
  console.log("3) Generate files with generate(spec)");
  console.log("4) Write files with writeFiles(files)");
}
