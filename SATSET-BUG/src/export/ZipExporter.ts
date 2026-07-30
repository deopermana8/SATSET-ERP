import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";

export interface ZipExportResult {
  archivePath: string;
  success: boolean;
  error?: string;
  method: "powershell" | "node-tar";
}

function exportViaPowerShell(sourceDir: string, zipPath: string): void {
  const src = sourceDir.replace(/'/g, "''");
  const dst = zipPath.replace(/'/g, "''");
  execSync(`powershell -Command "Compress-Archive -Path '${src}\\*' -DestinationPath '${dst}' -Force"`, { stdio: "ignore" });
}

function exportViaTarGz(sourceDir: string, archivePath: string): void {
  // Walk directory and create a simple custom binary archive (tar-compatible header)
  const entries: Array<{ name: string; content: Buffer }> = [];

  const walk = (dir: string, base: string): void => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const fullPath = path.join(dir, entry.name);
      const relPath = path.join(base, entry.name).replace(/\\/g, "/");
      if (entry.isDirectory()) {
        walk(fullPath, relPath);
      } else {
        try {
          entries.push({ name: relPath, content: fs.readFileSync(fullPath) });
        } catch { /* skip unreadable */ }
      }
    }
  };

  walk(sourceDir, "");

  // Write USTAR tar blocks, then gzip
  const blocks: Buffer[] = [];

  for (const entry of entries) {
    const nameBytes = Buffer.alloc(100);
    Buffer.from(entry.name.slice(0, 99)).copy(nameBytes);

    const header = Buffer.alloc(512);
    nameBytes.copy(header, 0);
    // mode
    Buffer.from("0000644 ").copy(header, 100);
    // uid, gid
    Buffer.from("0000000 ").copy(header, 108);
    Buffer.from("0000000 ").copy(header, 116);
    // size (octal, 11 chars + space)
    const sizeOct = entry.content.length.toString(8).padStart(11, "0") + " ";
    Buffer.from(sizeOct).copy(header, 124);
    // mtime
    Buffer.from(Math.floor(Date.now() / 1000).toString(8).padStart(11, "0") + " ").copy(header, 136);
    // type flag: regular file
    header[156] = 48; // '0'
    // magic
    Buffer.from("ustar  \0").copy(header, 257);

    // Checksum
    let cksum = 0;
    for (let i = 0; i < 512; i++) cksum += header[i] ?? 0;
    Buffer.from(cksum.toString(8).padStart(6, "0") + "\0 ").copy(header, 148);

    blocks.push(header);

    // File data padded to 512-byte boundary
    const paddedSize = Math.ceil(entry.content.length / 512) * 512;
    const dataBuf = Buffer.alloc(paddedSize);
    entry.content.copy(dataBuf);
    blocks.push(dataBuf);
  }

  // End-of-archive: two 512-byte zero blocks
  blocks.push(Buffer.alloc(1024));

  const tarData = Buffer.concat(blocks);
  const gzipped = zlib.gzipSync(tarData);
  fs.writeFileSync(archivePath, gzipped);
}

export class ZipExporter {
  export(sourceDir: string, archiveName?: string): ZipExportResult {
    const name = archiveName ?? path.basename(sourceDir);
    const parentDir = path.dirname(sourceDir);
    const isWindows = process.platform === "win32";

    // Try ZIP on Windows, fall back to .tar.gz
    if (isWindows) {
      const zipPath = path.join(parentDir, `${name}.zip`);
      try {
        if (fs.existsSync(zipPath)) fs.unlinkSync(zipPath);
        exportViaPowerShell(sourceDir, zipPath);
        return { archivePath: zipPath, success: true, method: "powershell" };
      } catch (err) {
        // Fall through to tar.gz
      }
    }

    // Node-based tar.gz fallback
    const archivePath = path.join(parentDir, `${name}.tar.gz`);
    try {
      exportViaTarGz(sourceDir, archivePath);
      return { archivePath, success: true, method: "node-tar" };
    } catch (err) {
      return { archivePath, success: false, error: err instanceof Error ? err.message : String(err), method: "node-tar" };
    }
  }
}
