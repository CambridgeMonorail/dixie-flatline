import { spawnSync } from 'node:child_process';
import path from 'node:path';

const root = process.cwd();
const outDir = path.join(root, 'dist/apps/project-memory-extension');
const vsixPath = path.join(root, 'dixie-flatline-0.1.0.vsix');
const vsceCmd = path.join(root, 'node_modules', '.bin', process.platform === 'win32' ? 'vsce.CMD' : 'vsce');

const command = process.platform === 'win32' ? 'pwsh.exe' : vsceCmd;
const args = process.platform === 'win32'
  ? ['-NoProfile', '-Command', `& '${escapePowerShell(vsceCmd)}' package --out '${escapePowerShell(vsixPath)}'`]
  : ['package', '--out', vsixPath];

const result = spawnSync(command, args, {
  cwd: outDir,
  stdio: 'inherit',
  shell: false
});

if (result.error) {
  console.error(result.error.message);
}

if (result.status !== 0) {
  process.exit(result.status ?? 1);
}

function escapePowerShell(value) {
  return value.replace(/'/g, "''");
}
