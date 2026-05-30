// One-off icon generator for GAINZ Sherpa.
// PWA install (manifest) and iOS "Add to Home Screen" require real raster PNGs.
// Rather than pull in an image library, we draw a simple dumbbell on the dark
// brand background straight into an RGBA buffer and PNG-encode it with the
// built-in zlib. Run with:  node tools/make-icons.mjs
import { deflateSync } from "node:zlib";
import { writeFileSync, mkdirSync } from "node:fs";

// --- Minimal PNG encoder (8-bit RGBA, single IDAT) ---------------------------
// PNG splits data into "chunks", each guarded by a CRC32 checksum.
const crcTable = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();
function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}
function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type, "ascii"), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));
  return Buffer.concat([len, body, crc]);
}
function encodePng(width, height, rgba) {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type 6 = RGBA
  // Each scanline is prefixed with a filter-type byte (0 = none).
  const stride = width * 4;
  const raw = Buffer.alloc((stride + 1) * height);
  for (let y = 0; y < height; y++) {
    rgba.copy(raw, y * (stride + 1) + 1, y * stride, y * stride + stride);
  }
  const idat = deflateSync(raw);
  return Buffer.concat([sig, chunk("IHDR", ihdr), chunk("IDAT", idat), chunk("IEND", Buffer.alloc(0))]);
}

// --- Draw a dumbbell on the brand-dark background ----------------------------
const BG = [0x0d, 0x0d, 0x0f, 255]; // app background
const RED = [0xff, 0x3b, 0x30, 255]; // brand accent

function makeIcon(size) {
  const buf = Buffer.alloc(size * size * 4);
  const px = (x, y, c) => {
    const i = (y * size + x) * 4;
    buf[i] = c[0];
    buf[i + 1] = c[1];
    buf[i + 2] = c[2];
    buf[i + 3] = c[3];
  };
  // A filled rectangle in fractional (0..1) coordinates so it scales to any size.
  const rect = (x0, y0, x1, y1, c) => {
    for (let y = Math.round(y0 * size); y < Math.round(y1 * size); y++) {
      for (let x = Math.round(x0 * size); x < Math.round(x1 * size); x++) px(x, y, c);
    }
  };

  rect(0, 0, 1, 1, BG); // opaque background (iOS masks the corners itself)
  // Dumbbell: a thin handle with two stacked plates on each end.
  rect(0.3, 0.46, 0.7, 0.54, RED); // handle
  rect(0.26, 0.36, 0.32, 0.64, RED); // inner plates
  rect(0.68, 0.36, 0.74, 0.64, RED);
  rect(0.2, 0.4, 0.26, 0.6, RED); // outer plates
  rect(0.74, 0.4, 0.8, 0.6, RED);
  return encodePng(size, size, buf);
}

// --- Write the three icons the app references --------------------------------
mkdirSync(new URL("../icons/", import.meta.url), { recursive: true });
const out = (name, size) =>
  writeFileSync(new URL(`../icons/${name}`, import.meta.url), makeIcon(size));
out("icon-192.png", 192);
out("icon-512.png", 512);
out("apple-touch-icon.png", 180);
console.log("icons written");
