import fs from "fs";
import path from "path";
import { CORPUS } from "../fixtures/catalog";

const out = path.join(process.cwd(), "public", "corpus");
fs.mkdirSync(out, { recursive: true });

for (const item of CORPUS) {
  const [dark, mid, light] = item.palette;
  const shift = item.variant * 17;
  const spots = Array.from({ length: 7 }, (_, i) => {
    const x = 85 + ((i * 79 + shift) % 540);
    const y = 70 + ((i * 113 + shift * 2) % 340);
    const r = 24 + ((i * 11 + shift) % 44);
    return `<circle cx="${x}" cy="${y}" r="${r}" fill="${i % 2 ? light : mid}" opacity="${i % 2 ? ".12" : ".18"}"/>`;
  }).join("");

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="720" height="480" viewBox="0 0 720 480">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${dark}"/>
      <stop offset="1" stop-color="${mid}"/>
    </linearGradient>
    <radialGradient id="glow">
      <stop offset="0" stop-color="${light}" stop-opacity=".55"/>
      <stop offset="1" stop-color="${light}" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="720" height="480" rx="36" fill="url(#bg)"/>
  ${spots}
  <circle cx="${360 + (item.variant - 3) * 8}" cy="220" r="158" fill="url(#glow)"/>
  <g transform="translate(${360 + (item.variant - 3) * 7} 236)">
    <path d="M-118 88 C-104 0 -86 -78 0 -104 C86 -78 104 0 118 88 C58 128 -58 128 -118 88Z" fill="${light}" opacity=".92"/>
    <path d="M-90 -45 L-142 -132 L-28 -90 M90 -45 L142 -132 L28 -90" fill="${light}" opacity=".9"/>
    <path d="M-74 5 Q-42 -20 -12 8 M74 5 Q42 -20 12 8" fill="none" stroke="${dark}" stroke-width="13" stroke-linecap="round"/>
    <path d="M-18 52 Q0 68 18 52" fill="none" stroke="${dark}" stroke-width="11" stroke-linecap="round"/>
    <circle cx="0" cy="34" r="12" fill="${dark}"/>
  </g>
  <path d="M24 24h44M24 24v44M696 24h-44M696 24v44M24 456h44M24 456v-44M696 456h-44M696 456v-44" fill="none" stroke="${light}" stroke-width="4" stroke-linecap="round" opacity=".65"/>
  <circle cx="672" cy="48" r="8" fill="#F59E0B"/>
</svg>`;
  fs.writeFileSync(path.join(out, item.name), svg);
}

console.log(`generated ${CORPUS.length} fixture images in ${out}`);
