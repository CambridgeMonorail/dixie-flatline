import { build } from 'esbuild';
import { copyFile, mkdir, rm } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const projectRoot = path.join(root, 'apps/project-memory-extension');
const outDir = path.join(root, 'dist/apps/project-memory-extension');

await rm(outDir, { recursive: true, force: true });
await mkdir(outDir, { recursive: true });

await build({
  entryPoints: [path.join(projectRoot, 'src/extension.ts')],
  outfile: path.join(outDir, 'extension.js'),
  bundle: true,
  platform: 'node',
  format: 'cjs',
  target: 'node20',
  external: ['vscode'],
  sourcemap: true,
  logLevel: 'info'
});

await copyFile(path.join(projectRoot, 'package.json'), path.join(outDir, 'package.json'));
await copyFile(path.join(projectRoot, 'README.md'), path.join(outDir, 'README.md'));
await copyFile(path.join(projectRoot, '.vscodeignore'), path.join(outDir, '.vscodeignore'));
await copyFile(path.join(root, 'LICENSE'), path.join(outDir, 'LICENSE'));
await mkdir(path.join(outDir, 'assets'), { recursive: true });
await copyFile(path.join(projectRoot, 'assets', 'icon.png'), path.join(outDir, 'assets', 'icon.png'));
