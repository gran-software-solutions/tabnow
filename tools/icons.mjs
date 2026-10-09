// Writes one pixel-snapped SVG per icon size into extension/icons/, so small sizes stay sharp.
// Render them with tools/icons.sh. Shape: blue rounded square, white T whose crossbar is a browser tab.
import fs from "node:fs";

const SIZES = [16, 20, 24, 32, 48];
const r = Math.round;

function svg(n) {
  const side = r(n * 0.16), top = r(n * 0.2), bar = Math.max(3, r(n * 0.24)), cr = Math.max(1, r(n * 0.1));
  let stem = r(n * 0.2); if ((n - stem) % 2) stem++; // keep the stem centred on whole pixels
  const sx = (n - stem) / 2, y2 = top + bar, bottom = n - r(n * 0.18);
  const x1 = side, x2 = n - side;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${n}" height="${n}" viewBox="0 0 ${n} ${n}" shape-rendering="${n <= 24 ? "crispEdges" : "auto"}">
  <rect width="${n}" height="${n}" rx="${r(n * 0.22)}" fill="#1F5FD6" shape-rendering="auto"/>
  <path d="M${x1} ${y2} V${top + cr} Q${x1} ${top} ${x1 + cr} ${top} H${x2 - cr} Q${x2} ${top} ${x2} ${top + cr} V${y2} Z" fill="#fff" shape-rendering="auto"/>
  <rect x="${sx}" y="${y2}" width="${stem}" height="${bottom - y2}" fill="#fff"/>
</svg>
`;
}

for (const n of SIZES) fs.writeFileSync(new URL(`../extension/icons/icon-${n}.svg`, import.meta.url), svg(n));
console.log("wrote", SIZES.join(", "));
