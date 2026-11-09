/**
 * Elegant generated artwork used when a product photo can't load (offline, blocked CDN, bad URL).
 * Keeps the store looking finished instead of showing broken images.
 */
const SHAPES: Record<string, string> = {
  tee: "M150 120 L205 95 Q250 125 295 95 L350 120 L395 185 L350 210 L335 190 L335 400 L165 400 L165 190 L150 210 L105 185 Z",
  jeans: "M170 95 L330 95 L345 400 L270 400 L250 200 L230 400 L155 400 Z",
  saree: "M215 90 Q250 110 285 90 L300 150 Q360 200 345 400 L155 400 Q170 260 205 200 Q160 170 215 90 Z M285 90 Q330 160 380 330 L350 340 Q320 220 290 150 Z",
  dress: "M205 90 Q250 115 295 90 L305 165 Q360 250 370 400 L130 400 Q140 250 195 165 Z",
};

function shapeFor(key: string) {
  if (/tee|t-shirt|polo/.test(key)) return SHAPES.tee;
  if (/jean|denim|trouser/.test(key)) return SHAPES.jeans;
  if (/saree|sari/.test(key)) return SHAPES.saree;
  return SHAPES.dress;
}

function shade(hex: string, amt: number) {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex);
  const n = m ? parseInt(m[1], 16) : 0x7a2232;
  const ch = (s: number) => Math.max(0, Math.min(255, Math.round(((n >> s) & 255) + amt * 255)));
  return `rgb(${ch(16)},${ch(8)},${ch(0)})`;
}

export function fallbackArt(key = "", tone = "#7a2232"): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 625" preserveAspectRatio="xMidYMid slice">
<defs><linearGradient id="b" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${shade(tone, 0.55)}"/><stop offset="1" stop-color="${shade(tone, 0.32)}"/></linearGradient>
<pattern id="p" width="26" height="26" patternUnits="userSpaceOnUse"><circle cx="13" cy="13" r="1.6" fill="${shade(tone, 0.62)}"/></pattern>
<linearGradient id="s" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${shade(tone, 0.05)}"/><stop offset="1" stop-color="${shade(tone, -0.12)}"/></linearGradient></defs>
<rect width="500" height="625" fill="url(#b)"/><rect width="500" height="625" fill="url(#p)" opacity="0.6"/>
<ellipse cx="250" cy="520" rx="150" ry="18" fill="${shade(tone, -0.2)}" opacity="0.18"/>
<g transform="translate(0,70)"><path d="${shapeFor(key.toLowerCase())}" fill="url(#s)"/><path d="${shapeFor(key.toLowerCase())}" fill="none" stroke="${shade(tone, 0.4)}" stroke-width="2" stroke-dasharray="1 7" stroke-linecap="round"/></g>
</svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}
