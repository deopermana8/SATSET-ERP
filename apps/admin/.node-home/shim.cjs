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

// Create a safe temp dir inside the workspace to keep webpack/NFT traversal within the project
const safeTemp = path.join(safeHome, 'tmp');
try {
  fs.mkdirSync(safeTemp, { recursive: true });
} catch {
  // ignore
}

for (const key of ['HOME', 'USERPROFILE', 'APPDATA', 'LOCALAPPDATA', 'HOMEDRIVE', 'HOMEPATH']) {
  process.env[key] = safeHome;
}

// CRITICAL: redirect TEMP/TMP so os.tmpdir() stays within the project.
// Without this, webpack/NFT traverses C:\Users\Windows\AppData\Local\Temp → C:\Users\Windows
// and hits the protected "Application Data" junction (EPERM).
process.env.TEMP = safeTemp;
process.env.TMP = safeTemp;
process.env.TMPDIR = safeTemp;

process.env.SATSET_SAFE_HOME = safeHome;
