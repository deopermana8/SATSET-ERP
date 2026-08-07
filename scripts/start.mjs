import { spawn } from "node:child_process";

const mode = process.argv[2] ?? "start";
const workspaceName = "@satset/blueprint";
const commands = [
  ["npm", ["run", "start", "--workspace", `${workspaceName}-admin`]],
  ["npm", ["run", "start", "--workspace", `${workspaceName}-api`]],
  ["npm", ["run", "start", "--workspace", `${workspaceName}-worker`]],
  ["npm", ["run", "start", "--workspace", `${workspaceName}-customer`]]
];

console.log(`[workspace] booting in ${mode} mode`);

const children = commands.map(([command, args]) => spawn(command, args, {
  env: process.env,
  shell: true,
  stdio: "inherit"
}));

let shuttingDown = false;

function shutdown(code = 0) {
  if (shuttingDown) {
    return;
  }

  shuttingDown = true;
  for (const child of children) {
    if (!child.killed) {
      child.kill();
    }
  }

  process.exitCode = code;
}

for (const child of children) {
  child.on("exit", (code) => {
    if (typeof code === "number" && code !== 0) {
      shutdown(code);
    }
  });
}

process.on("SIGINT", () => shutdown(0));
process.on("SIGTERM", () => shutdown(0));
