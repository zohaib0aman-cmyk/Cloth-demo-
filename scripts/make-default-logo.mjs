// One-off helper that produced public/brand/logo.png for the master demo brand.
import sharp from "sharp";
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#8a2a3b"/><stop offset="1" stop-color="#5a1522"/></linearGradient></defs>
<circle cx="256" cy="256" r="248" fill="url(#g)"/>
<circle cx="256" cy="256" r="214" fill="none" stroke="#d9b36c" stroke-width="4" stroke-dasharray="2 10" stroke-linecap="round"/>
<path d="M256 112 C 300 170, 360 190, 360 262 C 360 330, 306 380, 256 400 C 206 380, 152 330, 152 262 C 152 190, 212 170, 256 112 Z" fill="none" stroke="#e8c98a" stroke-width="10"/>
<path d="M256 168 C 282 206, 318 222, 318 266 C 318 306, 288 334, 256 348 C 224 334, 194 306, 194 266 C 194 222, 230 206, 256 168 Z" fill="#e8c98a"/>
<path d="M256 214 L 256 330" stroke="#6a1a29" stroke-width="8" stroke-linecap="round"/>
</svg>`;
await sharp(Buffer.from(svg)).png().toFile("public/brand/logo.png");
console.log("logo written");
