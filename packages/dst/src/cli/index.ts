#!/usr/bin/env node

import { executeSpecCommand } from "./commands.js";
import { printHelp } from "./help.js";

async function main(): Promise<void> {
	const args = process.argv.slice(2);

	if (args.length === 0 || args[0] === "-h" || args[0] === "--help") {
		printHelp();
		return;
	}

	const specPath = args[0];
	await executeSpecCommand(specPath);
}

main().catch((error) => {
	const message = error instanceof Error ? error.message : String(error);
	console.error(`DST CLI error: ${message}`);
	process.exitCode = 1;
});
