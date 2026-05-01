import { mkdir, writeFile, copyFile } from 'node:fs/promises';
import path from 'node:path';
import zlib from 'node:zlib';

const root = process.cwd();
const brandDir = path.join(root, 'docs', 'brand');
const extensionAssetsDir = path.join(root, 'apps', 'project-memory-extension', 'assets');

const colors = {
  bg: [4, 8, 15, 255],
  bg2: [8, 18, 28, 255],
  green: [60, 255, 154, 255],
  cyan: [56, 209, 255, 255],
  magenta: [190, 76, 170, 255],
  amber: [255, 190, 80, 255],
  muted: [76, 111, 124, 255],
  text: [223, 255, 238, 255]
};

async function main() {
  await mkdir(brandDir, { recursive: true });
  await mkdir(extensionAssetsDir, { recursive: true });

  await writeFile(path.join(brandDir, 'logo.svg'), logoSvg(), 'utf8');

  const icon = makeCanvas(512, 512);
  drawBackground(icon);
  drawMark(icon, 64, 64, 384);
  await writePng(path.join(brandDir, 'icon.png'), icon);

  const logo = makeCanvas(1024, 1024);
  drawBackground(logo);
  drawMark(logo, 128, 128, 768);
  await writePng(path.join(brandDir, 'logo.png'), logo);

  const og = makeCanvas(1200, 630);
  drawHero(og, 'DIXIE FLATLINE', 'PERSISTENT PROJECT MEMORY FOR AI CODING AGENTS', true);
  await writePng(path.join(brandDir, 'og-image.png'), og);

  const header = makeCanvas(1200, 360);
  drawHero(header, 'DIXIE FLATLINE', 'PERSISTENT PROJECT MEMORY FOR AI CODING AGENTS', false);
  await writePng(path.join(brandDir, 'README-header.png'), header);

  await copyFile(path.join(brandDir, 'icon.png'), path.join(extensionAssetsDir, 'icon.png'));
}

function logoSvg() {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" role="img" aria-labelledby="title desc">
  <title id="title">Dixie Flatline logo</title>
  <desc id="desc">A terminal-style flatline waveform turning into code brackets.</desc>
  <rect width="512" height="512" rx="72" fill="#04080f"/>
  <path d="M64 256h86l18-48 36 96 34-142 38 188 28-94h54" fill="none" stroke="#3cff9a" stroke-width="24" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M356 180l-58 76 58 76" fill="none" stroke="#38d1ff" stroke-width="24" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M408 180l58 76-58 76" fill="none" stroke="#38d1ff" stroke-width="24" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M95 356h140" stroke="#be4caa" stroke-width="14" stroke-linecap="round" opacity=".9"/>
  <path d="M95 392h90" stroke="#ffbe50" stroke-width="14" stroke-linecap="round" opacity=".75"/>
  <rect x="38" y="38" width="436" height="436" rx="50" fill="none" stroke="#263947" stroke-width="8"/>
</svg>
`;
}

function drawHero(canvas, title, subtitle, full) {
  drawBackground(canvas);
  drawGrid(canvas, 30, [18, 43, 54, 90]);
  drawWave(canvas, 70, full ? 410 : 286, canvas.width - 140, full ? 64 : 32, colors.green);
  drawMark(canvas, full ? 92 : 70, full ? 88 : 58, full ? 210 : 170);
  drawText(canvas, title, full ? 360 : 280, full ? 142 : 92, full ? 9 : 8, colors.text);
  drawText(canvas, subtitle, full ? 250 : 280, full ? 254 : 184, 3, colors.cyan);
  drawText(canvas, 'REPO-LOCAL // TIME-AWARE // DECISION-GUIDED', full ? 252 : 282, full ? 312 : 234, full ? 3 : 2, colors.muted);
  drawScanlines(canvas);
}

function drawMark(canvas, x, y, size) {
  fillRect(canvas, x, y, size, size, [4, 8, 15, 255]);
  strokeRect(canvas, x, y, size, size, Math.max(6, Math.floor(size / 48)), [38, 57, 71, 255]);

  const sx = size / 512;
  const points = [
    [64, 256], [150, 256], [168, 208], [204, 304], [238, 162],
    [276, 350], [304, 256], [358, 256]
  ].map(([px, py]) => [x + px * sx, y + py * sx]);
  drawPolyline(canvas, points, Math.max(10, Math.floor(size / 22)), colors.green);
  drawPolyline(canvas, [[x + 356 * sx, y + 180 * sx], [x + 298 * sx, y + 256 * sx], [x + 356 * sx, y + 332 * sx]], Math.max(10, Math.floor(size / 22)), colors.cyan);
  drawPolyline(canvas, [[x + 408 * sx, y + 180 * sx], [x + 466 * sx, y + 256 * sx], [x + 408 * sx, y + 332 * sx]], Math.max(10, Math.floor(size / 22)), colors.cyan);
  fillRect(canvas, x + 95 * sx, y + 356 * sx, 140 * sx, 14 * sx, colors.magenta);
  fillRect(canvas, x + 95 * sx, y + 392 * sx, 90 * sx, 14 * sx, colors.amber);
}

function drawBackground(canvas) {
  for (let y = 0; y < canvas.height; y++) {
    for (let x = 0; x < canvas.width; x++) {
      const t = (x / canvas.width + y / canvas.height) / 2;
      setPixel(canvas, x, y, mix(colors.bg, colors.bg2, t));
    }
  }
}

function drawGrid(canvas, step, color) {
  for (let x = 0; x < canvas.width; x += step) {
    fillRect(canvas, x, 0, 1, canvas.height, color);
  }
  for (let y = 0; y < canvas.height; y += step) {
    fillRect(canvas, 0, y, canvas.width, 1, color);
  }
}

function drawWave(canvas, x, y, width, amp, color) {
  const points = [];
  for (let i = 0; i < 18; i++) {
    const px = x + (width * i) / 17;
    const py = y + Math.sin(i * 1.65) * amp * (i % 5 === 0 ? 0.2 : 1);
    points.push([px, py]);
  }
  drawPolyline(canvas, points, 6, color);
}

function drawScanlines(canvas) {
  for (let y = 0; y < canvas.height; y += 4) {
    fillRect(canvas, 0, y, canvas.width, 1, [0, 0, 0, 35]);
  }
}

function makeCanvas(width, height) {
  return {
    width,
    height,
    data: new Uint8Array(width * height * 4)
  };
}

function setPixel(canvas, x, y, color) {
  x = Math.round(x);
  y = Math.round(y);
  if (x < 0 || y < 0 || x >= canvas.width || y >= canvas.height) return;
  const index = (y * canvas.width + x) * 4;
  const alpha = color[3] / 255;
  canvas.data[index] = Math.round(color[0] * alpha + canvas.data[index] * (1 - alpha));
  canvas.data[index + 1] = Math.round(color[1] * alpha + canvas.data[index + 1] * (1 - alpha));
  canvas.data[index + 2] = Math.round(color[2] * alpha + canvas.data[index + 2] * (1 - alpha));
  canvas.data[index + 3] = 255;
}

function fillRect(canvas, x, y, w, h, color) {
  for (let yy = Math.floor(y); yy < Math.ceil(y + h); yy++) {
    for (let xx = Math.floor(x); xx < Math.ceil(x + w); xx++) {
      setPixel(canvas, xx, yy, color);
    }
  }
}

function strokeRect(canvas, x, y, w, h, t, color) {
  fillRect(canvas, x, y, w, t, color);
  fillRect(canvas, x, y + h - t, w, t, color);
  fillRect(canvas, x, y, t, h, color);
  fillRect(canvas, x + w - t, y, t, h, color);
}

function drawLine(canvas, x0, y0, x1, y1, width, color) {
  const steps = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0));
  for (let i = 0; i <= steps; i++) {
    const x = x0 + ((x1 - x0) * i) / steps;
    const y = y0 + ((y1 - y0) * i) / steps;
    fillRect(canvas, x - width / 2, y - width / 2, width, width, color);
  }
}

function drawPolyline(canvas, points, width, color) {
  for (let i = 0; i < points.length - 1; i++) {
    drawLine(canvas, points[i][0], points[i][1], points[i + 1][0], points[i + 1][1], width, color);
  }
}

function mix(a, b, t) {
  return [
    Math.round(a[0] + (b[0] - a[0]) * t),
    Math.round(a[1] + (b[1] - a[1]) * t),
    Math.round(a[2] + (b[2] - a[2]) * t),
    255
  ];
}

function drawText(canvas, text, x, y, scale, color) {
  let cursor = x;
  for (const char of text.toUpperCase()) {
    if (char === ' ') {
      cursor += 4 * scale;
      continue;
    }
    const glyph = FONT[char] ?? FONT['?'];
    for (let row = 0; row < glyph.length; row++) {
      for (let col = 0; col < glyph[row].length; col++) {
        if (glyph[row][col] === '1') {
          fillRect(canvas, cursor + col * scale, y + row * scale, scale, scale, color);
        }
      }
    }
    cursor += (glyph[0].length + 1) * scale;
  }
}

function writePng(file, canvas) {
  const raw = Buffer.alloc((canvas.width * 4 + 1) * canvas.height);
  for (let y = 0; y < canvas.height; y++) {
    const rowStart = y * (canvas.width * 4 + 1);
    raw[rowStart] = 0;
    Buffer.from(canvas.data.subarray(y * canvas.width * 4, (y + 1) * canvas.width * 4)).copy(raw, rowStart + 1);
  }

  const chunks = [
    chunk('IHDR', Buffer.concat([u32(canvas.width), u32(canvas.height), Buffer.from([8, 6, 0, 0, 0])])),
    chunk('IDAT', zlib.deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0))
  ];

  return writeFile(file, Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), ...chunks]));
}

function chunk(type, data) {
  const typeBuffer = Buffer.from(type);
  const crc = crc32(Buffer.concat([typeBuffer, data]));
  return Buffer.concat([u32(data.length), typeBuffer, data, u32(crc)]);
}

function u32(value) {
  const buffer = Buffer.alloc(4);
  buffer.writeUInt32BE(value >>> 0, 0);
  return buffer;
}

const crcTable = Array.from({ length: 256 }, (_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});

function crc32(buffer) {
  let c = 0xffffffff;
  for (const byte of buffer) c = crcTable[(c ^ byte) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

const FONT = {
  A: ['01110', '10001', '10001', '11111', '10001', '10001', '10001'],
  B: ['11110', '10001', '10001', '11110', '10001', '10001', '11110'],
  C: ['01111', '10000', '10000', '10000', '10000', '10000', '01111'],
  D: ['11110', '10001', '10001', '10001', '10001', '10001', '11110'],
  E: ['11111', '10000', '10000', '11110', '10000', '10000', '11111'],
  F: ['11111', '10000', '10000', '11110', '10000', '10000', '10000'],
  G: ['01111', '10000', '10000', '10111', '10001', '10001', '01111'],
  H: ['10001', '10001', '10001', '11111', '10001', '10001', '10001'],
  I: ['11111', '00100', '00100', '00100', '00100', '00100', '11111'],
  J: ['00111', '00010', '00010', '00010', '10010', '10010', '01100'],
  K: ['10001', '10010', '10100', '11000', '10100', '10010', '10001'],
  L: ['10000', '10000', '10000', '10000', '10000', '10000', '11111'],
  M: ['10001', '11011', '10101', '10101', '10001', '10001', '10001'],
  N: ['10001', '11001', '10101', '10011', '10001', '10001', '10001'],
  O: ['01110', '10001', '10001', '10001', '10001', '10001', '01110'],
  P: ['11110', '10001', '10001', '11110', '10000', '10000', '10000'],
  Q: ['01110', '10001', '10001', '10001', '10101', '10010', '01101'],
  R: ['11110', '10001', '10001', '11110', '10100', '10010', '10001'],
  S: ['01111', '10000', '10000', '01110', '00001', '00001', '11110'],
  T: ['11111', '00100', '00100', '00100', '00100', '00100', '00100'],
  U: ['10001', '10001', '10001', '10001', '10001', '10001', '01110'],
  V: ['10001', '10001', '10001', '10001', '10001', '01010', '00100'],
  W: ['10001', '10001', '10001', '10101', '10101', '10101', '01010'],
  X: ['10001', '10001', '01010', '00100', '01010', '10001', '10001'],
  Y: ['10001', '10001', '01010', '00100', '00100', '00100', '00100'],
  Z: ['11111', '00001', '00010', '00100', '01000', '10000', '11111'],
  '-': ['00000', '00000', '00000', '11111', '00000', '00000', '00000'],
  '/': ['00001', '00010', '00010', '00100', '01000', '01000', '10000'],
  ':': ['000', '010', '010', '000', '010', '010', '000'],
  '?': ['11110', '00001', '00010', '00100', '00100', '00000', '00100']
};

await main();
