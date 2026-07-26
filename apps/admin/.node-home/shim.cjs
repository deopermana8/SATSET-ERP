const path = require('path');
const fs = require('fs');

function getWorkspaceSafeHome() {
  const cwd = process.cwd();
  const candidate = path.resolve(cwd, '.node-home');
  try {
    fs.mkdirSync(candidate, { recursive: true });
  } catch {
    // ignore
  }
  return candidate;
}

const safeHome = getWorkspaceSafeHome();
for (const key of ['HOME', 'USERPROFILE', 'APPDATA', 'LOCALAPPDATA', 'HOMEDRIVE', 'HOMEPATH']) {
  process.env[key] = safeHome;
}

process.env.SATSET_SAFE_HOME = safeHome;
