import fs from 'fs';
import zlib from 'zlib';

function createPng(width, height, renderPixel) {
  // RGBA buffer with filter byte per scanline
  const scanlineLength = width * 4 + 1;
  const rawData = Buffer.alloc(scanlineLength * height);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * scanlineLength;
    rawData[rowOffset] = 0; // Filter type 0 (None)
    for (let x = 0; x < width; x++) {
      const [r, g, b, a] = renderPixel(x, y, width, height);
      const pixelOffset = rowOffset + 1 + x * 4;
      rawData[pixelOffset] = r;
      rawData[pixelOffset + 1] = g;
      rawData[pixelOffset + 2] = b;
      rawData[pixelOffset + 3] = a;
    }
  }

  const compressed = zlib.deflateSync(rawData);

  // PNG Signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR chunk
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // Bit depth: 8
  ihdr[9] = 6; // Color type: 6 (RGBA)
  ihdr[10] = 0; // Compression: deflate
  ihdr[11] = 0; // Filter: standard
  ihdr[12] = 0; // Interlace: none

  function makeChunk(type, data) {
    const typeBuf = Buffer.from(type, 'ascii');
    const lengthBuf = Buffer.alloc(4);
    lengthBuf.writeUInt32BE(data.length, 0);

    const crcBuf = Buffer.alloc(4);
    const toCrc = Buffer.concat([typeBuf, data]);
    const crc = crc32(toCrc);
    crcBuf.writeUInt32BE(crc, 0);

    return Buffer.concat([lengthBuf, typeBuf, data, crcBuf]);
  }

  // Precomputed CRC table
  function crc32(buf) {
    let c = 0xffffffff;
    for (let n = 0; n < buf.length; n++) {
      c = crcTable[(c ^ buf[n]) & 0xff] ^ (c >>> 8);
    }
    return (c ^ 0xffffffff) >>> 0;
  }

  const ihdrChunk = makeChunk('IHDR', ihdr);
  const idatChunk = makeChunk('IDAT', compressed);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

// CRC32 table initialization
const crcTable = new Uint32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    if (c & 1) {
      c = 0xedb88320 ^ (c >>> 1);
    } else {
      c = c >>> 1;
    }
  }
  crcTable[n] = c;
}

// Brand icon pixel renderer:
// Beautiful rounded squircle background in gradient #004ac6 -> #4f46e5
// Inside: Calendar card + financial percent symbol (%)
function renderBrandIcon(isMaskable) {
  return (x, y, width, height) => {
    const u = x / width;
    const v = y / height;

    // Corner radius for standard app icon (squircle)
    const radius = isMaskable ? 0 : 0.22; // maskable is full-bleed
    const pad = isMaskable ? 0 : 0.05;

    let inShape = true;
    if (!isMaskable) {
      // Rounded rect check
      const cx = Math.max(pad + radius, Math.min(1 - pad - radius, u));
      const cy = Math.max(pad + radius, Math.min(1 - pad - radius, v));
      const dist = Math.hypot(u - cx, v - cy);
      inShape = dist <= radius;
    }

    if (!inShape) {
      return [0, 0, 0, 0]; // Transparent outside
    }

    // Gradient background: from (0,0) #004ac6 [0, 74, 198] to (1,1) #3b82f6 -> #4f46e5 [79, 70, 229]
    const gradFactor = (u + v) * 0.5;
    let bgR = Math.round(0 * (1 - gradFactor) + 79 * gradFactor);
    let bgG = Math.round(74 * (1 - gradFactor) + 70 * gradFactor);
    let bgB = Math.round(198 * (1 - gradFactor) + 229 * gradFactor);

    // Inner Calendar boundary (centered, safe zone)
    const scale = isMaskable ? 0.65 : 0.72;
    const offsetX = (1 - scale) / 2;
    const offsetY = (1 - scale) / 2;

    const cu = (u - offsetX) / scale;
    const cv = (v - offsetY) / scale;

    // Calendar Card: cu in [0.1, 0.9], cv in [0.18, 0.85], with radius 0.08
    if (cu >= 0.1 && cu <= 0.9 && cv >= 0.18 && cv <= 0.85) {
      const cardCornerR = 0.08;
      const ccx = Math.max(0.1 + cardCornerR, Math.min(0.9 - cardCornerR, cu));
      const ccy = Math.max(0.18 + cardCornerR, Math.min(0.85 - cardCornerR, cv));
      if (Math.hypot(cu - ccx, cv - ccy) <= cardCornerR) {
        // Top banner header (cv <= 0.36)
        if (cv <= 0.36) {
          return [0, 53, 146, 255]; // Deep Navy #003592
        }

        // Calendar body (White #ffffff)
        // Check for Percent Symbol (%)
        // Circle 1: (0.35, 0.50), r = 0.07, thickness = 0.03
        const dCircle1 = Math.hypot(cu - 0.36, cv - 0.50);
        if (dCircle1 <= 0.075 && dCircle1 >= 0.035) {
          return [0, 74, 198, 255]; // Blue stroke
        }

        // Circle 2: (0.64, 0.70), r = 0.07, thickness = 0.03
        const dCircle2 = Math.hypot(cu - 0.64, cv - 0.70);
        if (dCircle2 <= 0.075 && dCircle2 >= 0.035) {
          return [0, 74, 198, 255]; // Blue stroke
        }

        // Slash line from (0.68, 0.46) to (0.32, 0.74)
        // distance from point (cu, cv) to segment
        const p1x = 0.66, p1y = 0.46;
        const p2x = 0.34, p2y = 0.74;
        const l2 = (p2x - p1x) ** 2 + (p2y - p1y) ** 2;
        const t = Math.max(0, Math.min(1, ((cu - p1x) * (p2x - p1x) + (cv - p1y) * (p2y - p1y)) / l2));
        const projX = p1x + t * (p2x - p1x);
        const projY = p1y + t * (p2y - p1y);
        const dSlash = Math.hypot(cu - projX, cv - projY);
        if (dSlash <= 0.035) {
          return [0, 74, 198, 255]; // Blue slash
        }

        // Sparkle / gold accent star at (0.76, 0.50)
        const dStar = Math.abs(cu - 0.75) + Math.abs(cv - 0.48);
        if (dStar <= 0.04) {
          return [245, 158, 11, 255]; // Amber gold
        }

        return [255, 255, 255, 255]; // White card background
      }
    }

    // Binder rings at top: (0.28, 0.12) to (0.28, 0.24) and (0.72, 0.12) to (0.72, 0.24)
    const ring1 = Math.hypot(cu - 0.30, Math.max(0.12, Math.min(0.24, cv)));
    const ring2 = Math.hypot(cu - 0.70, Math.max(0.12, Math.min(0.24, cv)));
    if (ring1 <= 0.035 || ring2 <= 0.035) {
      return [147, 197, 253, 255]; // Light blue rings
    }

    return [bgR, bgG, bgB, 255];
  };
}

fs.mkdirSync('./public', { recursive: true });

fs.writeFileSync('./public/pwa-192x192.png', createPng(192, 192, renderBrandIcon(false)));
fs.writeFileSync('./public/pwa-512x512.png', createPng(512, 512, renderBrandIcon(false)));
fs.writeFileSync('./public/pwa-maskable-512x512.png', createPng(512, 512, renderBrandIcon(true)));
fs.writeFileSync('./public/apple-touch-icon.png', createPng(180, 180, renderBrandIcon(false)));

console.log('Successfully generated all PWA compliant PNG icons.');
