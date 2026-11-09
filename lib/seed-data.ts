/* Sample catalogue loaded on first run and by the admin "Reset demo" button. No brand names live here. */

const img = (id: string) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=900&q=75`;

export const IMAGES = {
  ethnicWomen: [
    "1610030469983-98e550d6193c",
    "1583391733956-3750e0ff4e8b",
    "1617627143750-d86bc21e42bb",
    "1594633312681-425c7b97ccd1",
    "1585487000160-6ebcfceb0d03",
    "1609357605129-26f69add5d6e",
    "1612336307429-8a898d10e223",
    "1622122201714-77da0ca8e5d2",
  ].map(img),
  westernWomen: [
    "1595777457583-95e059d581b8",
    "1572804013309-59a88b7e92f1",
    "1515372039744-b8f02a3ae446",
    "1496747611176-843222e1e57c",
    "1539109136881-3be0616acf4b",
    "1469334031218-e382a71b716b",
    "1525507119028-ed4c629a60a3",
    "1509631179647-0177331693ae",
    "1487222477894-8943e31ef7b2",
  ].map(img),
  tees: [
    "1521572163474-6864f9cf17ab",
    "1583743814966-8936f5b7be1a",
    "1576566588028-4147f3842f27",
    "1562157873-818bc0726f68",
    "1503341504253-dff4815485f1",
    "1618354691373-d851c5c3a990",
  ].map(img),
  jeans: [
    "1542272604-787c3835535d",
    "1541099649105-f69ad21f3246",
    "1475178626620-a4d074967452",
    "1582552938357-32b906df40cb",
    "1604176354204-9268737828e4",
  ].map(img),
  ethnicMen: [
    "1597983073493-88cd35cf93b0",
    "1622290291468-a28f7a7dc6a8",
    "1617137968427-85924c800a22",
    "1594938298603-c8148c4dae35",
  ].map(img),
  lifestyle: [
    "1490481651871-ab68de25d43d",
    "1445205170230-053b83016050",
    "1434389677669-e08b4cac3105",
    "1483985988355-763728e1935b",
    "1558769132-cb1aea458c5e",
    "1441986300917-64674bd600d8",
    "1567401893414-76b7b1e5a7a5",
    "1489987707025-afc232f7ea0f",
  ].map(img),
};

const pick = (pool: string[], ...idx: number[]) => idx.map((i) => pool[i % pool.length]);

export const CATEGORIES = [
  { name: "Kurtis", slug: "kurtis", description: "Hand-finished kurtis for every day and every occasion.", image: IMAGES.ethnicWomen[1] },
  { name: "Sarees", slug: "sarees", description: "Six yards of heritage weaves, drapes and prints.", image: IMAGES.ethnicWomen[0] },
  { name: "Co-ord Sets", slug: "co-ord-sets", description: "Effortless matching sets that do the styling for you.", image: IMAGES.westernWomen[4] },
  { name: "Ethnic Wear", slug: "ethnic-wear", description: "Anarkalis, lehengas and kurta sets for celebrations.", image: IMAGES.ethnicWomen[2] },
  { name: "T-Shirts", slug: "t-shirts", description: "Heavyweight cotton tees in clean, considered cuts.", image: IMAGES.tees[0] },
  { name: "Jeans", slug: "jeans", description: "Denim that holds its shape, wash after wash.", image: IMAGES.jeans[0] },
];

export const COLLECTIONS = [
  { name: "The Festive Edit", slug: "festive-edit", tagline: "Zari, mirror-work and jewel tones for the season of lights", image: IMAGES.ethnicWomen[5] },
  { name: "Summer Linen", slug: "summer-linen", tagline: "Breathable linens and cottons in sun-washed shades", image: IMAGES.westernWomen[5] },
  { name: "Everyday Essentials", slug: "everyday-essentials", tagline: "The pieces you will reach for every single morning", image: IMAGES.lifestyle[1] },
  { name: "Wedding Season", slug: "wedding-season", tagline: "Heirloom-worthy ensembles for sangeet to reception", image: IMAGES.ethnicWomen[3] },
];

const C = {
  ivory: { name: "Ivory", hex: "#efe6d6" },
  maroon: { name: "Maroon", hex: "#7a2232" },
  mustard: { name: "Mustard", hex: "#d4a020" },
  teal: { name: "Teal", hex: "#1f6f6b" },
  rose: { name: "Dusty Rose", hex: "#c98f8f" },
  indigo: { name: "Indigo", hex: "#2f3e75" },
  emerald: { name: "Emerald", hex: "#1d6b4a" },
  black: { name: "Black", hex: "#1d1d1d" },
  white: { name: "White", hex: "#f7f7f5" },
  olive: { name: "Olive", hex: "#6b6b3a" },
  sage: { name: "Sage", hex: "#9cae94" },
  rust: { name: "Rust", hex: "#a94f2b" },
  navy: { name: "Navy", hex: "#1f2a44" },
  grey: { name: "Heather Grey", hex: "#9a9a9a" },
  lightBlue: { name: "Light Wash", hex: "#8fa9c9" },
  darkBlue: { name: "Dark Wash", hex: "#2a3b5c" },
  pink: { name: "Rani Pink", hex: "#c2185b" },
  lavender: { name: "Lavender", hex: "#b3a1cf" },
  beige: { name: "Sand", hex: "#d8c3a5" },
  red: { name: "Sindoor Red", hex: "#b3202a" },
};

const APPAREL = ["XS", "S", "M", "L", "XL", "XXL"];
const FREE = ["Free Size"];
const DENIM = ["28", "30", "32", "34", "36"];

type SeedProduct = {
  name: string;
  category: string;
  price: number;
  discount: number;
  colors: { name: string; hex: string }[];
  sizes: string[];
  stock: number;
  flags?: ("new" | "best" | "featured")[];
  collections: string[];
  fabric: string;
  care: string;
  description: string;
  images: string[];
};

const HANDWASH = "Gentle hand wash in cold water. Dry in shade. Warm iron on reverse.";
const DRYCLEAN = "Dry clean only. Store folded in a muslin bag.";
const MACHINE = "Machine wash cold with like colours. Do not bleach. Tumble dry low.";

export const PRODUCTS: SeedProduct[] = [
  {
    name: "Noor Chikankari Straight Kurti",
    category: "kurtis",
    price: 2499,
    discount: 20,
    colors: [C.ivory, C.rose],
    sizes: APPAREL,
    stock: 42,
    flags: ["best", "featured"],
    collections: ["summer-linen", "everyday-essentials"],
    fabric: "Pure cotton mulmul with hand chikankari",
    care: HANDWASH,
    description:
      "Hand-embroidered by Lucknow artisans, this straight kurti carries delicate shadow-work chikankari across the yoke and sleeves. Light as air, with a relaxed fit and side slits for easy movement.",
    images: pick(IMAGES.ethnicWomen, 1, 6, 3),
  },
  {
    name: "Gulmohar Block Print A-Line Kurti",
    category: "kurtis",
    price: 1599,
    discount: 15,
    colors: [C.rust, C.indigo],
    sizes: APPAREL,
    stock: 35,
    flags: ["new"],
    collections: ["summer-linen"],
    fabric: "Cotton cambric, hand block printed in Bagru",
    care: HANDWASH,
    description:
      "Bagru hand-block florals in earthy natural dyes on a flattering A-line silhouette. Finished with a notched neckline, three-quarter sleeves and handy side pockets.",
    images: pick(IMAGES.ethnicWomen, 6, 1, 7),
  },
  {
    name: "Meher Mirror-Work Anarkali Kurti",
    category: "kurtis",
    price: 3299,
    discount: 25,
    colors: [C.emerald, C.maroon],
    sizes: APPAREL,
    stock: 18,
    flags: ["featured"],
    collections: ["festive-edit"],
    fabric: "Rayon georgette with mirror and thread embroidery",
    care: DRYCLEAN,
    description:
      "A swirling flared anarkali kurti with hand-set mirrors and resham embroidery at the yoke. Fully lined, with a soft tie-up back and sheer flared sleeves.",
    images: pick(IMAGES.ethnicWomen, 2, 5, 0),
  },
  {
    name: "Sahar Indigo Dabu Kurti",
    category: "kurtis",
    price: 1899,
    discount: 10,
    colors: [C.indigo],
    sizes: APPAREL,
    stock: 6,
    collections: ["everyday-essentials"],
    fabric: "Handloom cotton, natural indigo dabu print",
    care: HANDWASH,
    description:
      "Mud-resist dabu printing and natural indigo give this kurti its rich, slightly irregular charm. Mandarin collar, front placket and a straight hem that pairs with everything.",
    images: pick(IMAGES.ethnicWomen, 7, 1, 6),
  },
  {
    name: "Ira Pastel Pintuck Kurti",
    category: "kurtis",
    price: 1499,
    discount: 0,
    colors: [C.lavender, C.sage],
    sizes: APPAREL,
    stock: 28,
    flags: ["new"],
    collections: ["everyday-essentials"],
    fabric: "Cotton slub",
    care: MACHINE,
    description:
      "Fine pintucks, lace-trimmed hems and a soft pastel palette. The kind of easy, put-together kurti that goes from office desk to evening chai.",
    images: pick(IMAGES.ethnicWomen, 3, 7, 1),
  },
  {
    name: "Banarasi Katan Silk Saree",
    category: "sarees",
    price: 12999,
    discount: 15,
    colors: [C.red, C.pink],
    sizes: FREE,
    stock: 9,
    flags: ["best", "featured"],
    collections: ["wedding-season", "festive-edit"],
    fabric: "Pure katan silk with real zari, from Varanasi",
    care: DRYCLEAN,
    description:
      "Woven on traditional pit looms in Varanasi, this katan silk saree is covered in kadhua buttis and finished with a heavy zari pallu. Comes with an unstitched blouse piece.",
    images: pick(IMAGES.ethnicWomen, 0, 4, 5),
  },
  {
    name: "Kanjeevaram Temple Border Saree",
    category: "sarees",
    price: 15999,
    discount: 10,
    colors: [C.mustard, C.emerald],
    sizes: FREE,
    stock: 5,
    flags: ["featured"],
    collections: ["wedding-season"],
    fabric: "Mulberry silk with contrast korvai border",
    care: DRYCLEAN,
    description:
      "A heritage Kanjeevaram with a contrast temple border, joined by hand using the korvai technique. Rich, weighty and made to be passed down.",
    images: pick(IMAGES.ethnicWomen, 4, 0, 2),
  },
  {
    name: "Chanderi Silk-Cotton Saree",
    category: "sarees",
    price: 4599,
    discount: 20,
    colors: [C.sage, C.ivory],
    sizes: FREE,
    stock: 22,
    flags: ["new"],
    collections: ["summer-linen", "festive-edit"],
    fabric: "Chanderi silk-cotton with zari buttis",
    care: DRYCLEAN,
    description:
      "Sheer, lustrous Chanderi with tiny gold buttis and a slim zari border. Light enough for summer weddings and day functions.",
    images: pick(IMAGES.ethnicWomen, 5, 0, 3),
  },
  {
    name: "Ajrakh Mul Cotton Saree",
    category: "sarees",
    price: 3299,
    discount: 0,
    colors: [C.indigo, C.rust],
    sizes: FREE,
    stock: 14,
    collections: ["everyday-essentials"],
    fabric: "Mul cotton with hand-block Ajrakh print",
    care: HANDWASH,
    description:
      "Kutch Ajrakh geometry printed by hand in natural dyes over 14 stages. Soft mul cotton that drapes beautifully and gets better with every wash.",
    images: pick(IMAGES.ethnicWomen, 6, 4, 0),
  },
  {
    name: "Organza Floral Ruffle Saree",
    category: "sarees",
    price: 5499,
    discount: 30,
    colors: [C.rose, C.lavender],
    sizes: FREE,
    stock: 3,
    flags: ["best"],
    collections: ["festive-edit"],
    fabric: "Silk organza with digital floral print",
    care: DRYCLEAN,
    description:
      "Dreamy watercolour florals on crisp organza, edged with soft ruffles. A pre-pleated option is available on request at no extra cost.",
    images: pick(IMAGES.ethnicWomen, 3, 5, 2),
  },
  {
    name: "Linen Shirt & Trouser Co-ord",
    category: "co-ord-sets",
    price: 3499,
    discount: 20,
    colors: [C.beige, C.sage],
    sizes: APPAREL,
    stock: 30,
    flags: ["best", "featured"],
    collections: ["summer-linen"],
    fabric: "Pure linen, pre-washed for softness",
    care: MACHINE,
    description:
      "A relaxed camp-collar shirt with matching straight trousers in breathable pre-washed linen. Wear together or break them up for endless outfits.",
    images: pick(IMAGES.westernWomen, 4, 5, 0),
  },
  {
    name: "Bandhani Crop Top & Palazzo Set",
    category: "co-ord-sets",
    price: 2799,
    discount: 15,
    colors: [C.pink, C.mustard],
    sizes: APPAREL,
    stock: 16,
    flags: ["new"],
    collections: ["festive-edit"],
    fabric: "Modal satin with bandhani print",
    care: HANDWASH,
    description:
      "A playful bandhani-printed crop top with tie-up detail, paired with fluid wide-leg palazzos. Mehendi-ready, brunch-approved.",
    images: pick(IMAGES.westernWomen, 2, 6, 4),
  },
  {
    name: "Ikat Kurta & Pant Co-ord",
    category: "co-ord-sets",
    price: 2999,
    discount: 10,
    colors: [C.teal, C.navy],
    sizes: APPAREL,
    stock: 21,
    collections: ["everyday-essentials"],
    fabric: "Handwoven Pochampally ikat cotton",
    care: HANDWASH,
    description:
      "Telangana ikat woven into a short boxy kurta and tapered pants. Elasticated waist, deep pockets and a fit that works all day.",
    images: pick(IMAGES.westernWomen, 6, 4, 1),
  },
  {
    name: "Satin Lounge Co-ord Set",
    category: "co-ord-sets",
    price: 2499,
    discount: 25,
    colors: [C.black, C.rose],
    sizes: APPAREL,
    stock: 4,
    collections: ["everyday-essentials"],
    fabric: "Soft-touch satin",
    care: HANDWASH,
    description:
      "A fluid satin shirt with piping detail and matching drawstring trousers. Equally at home on the sofa or a weekend getaway.",
    images: pick(IMAGES.westernWomen, 7, 8, 2),
  },
  {
    name: "Zardozi Velvet Lehenga Set",
    category: "ethnic-wear",
    price: 24999,
    discount: 10,
    colors: [C.maroon, C.emerald],
    sizes: ["XS", "S", "M", "L", "XL"],
    stock: 4,
    flags: ["featured"],
    collections: ["wedding-season"],
    fabric: "Micro velvet with zardozi and sequin work",
    care: DRYCLEAN,
    description:
      "A showstopping velvet lehenga with hand zardozi, a matching blouse and a sheer net dupatta with scalloped borders. Cancan-lined for a perfect flare.",
    images: pick(IMAGES.ethnicWomen, 2, 3, 5),
  },
  {
    name: "Gota Patti Anarkali Suit Set",
    category: "ethnic-wear",
    price: 6999,
    discount: 20,
    colors: [C.mustard, C.pink],
    sizes: APPAREL,
    stock: 12,
    flags: ["best"],
    collections: ["festive-edit", "wedding-season"],
    fabric: "Chanderi with gota patti, cotton lining",
    care: DRYCLEAN,
    description:
      "A floor-length anarkali trimmed with Rajasthani gota patti, with churidar and an organza dupatta. Festive glow with all-day comfort.",
    images: pick(IMAGES.ethnicWomen, 5, 2, 1),
  },
  {
    name: "Sharara Suit with Organza Dupatta",
    category: "ethnic-wear",
    price: 5499,
    discount: 15,
    colors: [C.sage, C.lavender],
    sizes: APPAREL,
    stock: 15,
    flags: ["new"],
    collections: ["festive-edit"],
    fabric: "Georgette with thread embroidery",
    care: DRYCLEAN,
    description:
      "A short embroidered kurta over flared sharara pants, finished with a hand-painted organza dupatta. Made for sangeet nights.",
    images: pick(IMAGES.ethnicWomen, 3, 1, 5),
  },
  {
    name: "Men's Silk Kurta Pyjama Set",
    category: "ethnic-wear",
    price: 3999,
    discount: 15,
    colors: [C.ivory, C.mustard, C.maroon],
    sizes: ["S", "M", "L", "XL", "XXL"],
    stock: 26,
    flags: ["best"],
    collections: ["festive-edit", "wedding-season"],
    fabric: "Art silk kurta, cotton pyjama",
    care: DRYCLEAN,
    description:
      "A classic straight kurta with self-textured weave and wooden buttons, with a comfortable churidar pyjama. Festive, timeless, easy.",
    images: pick(IMAGES.ethnicMen, 0, 1, 2),
  },
  {
    name: "Men's Nehru Jacket Set",
    category: "ethnic-wear",
    price: 5999,
    discount: 20,
    colors: [C.navy, C.olive],
    sizes: ["S", "M", "L", "XL", "XXL"],
    stock: 10,
    collections: ["wedding-season"],
    fabric: "Jacquard jacket, cotton-silk kurta",
    care: DRYCLEAN,
    description:
      "A tailored jacquard Nehru jacket layered over a cotton-silk kurta and pyjama. Sharp enough for the wedding, comfortable enough for the baraat.",
    images: pick(IMAGES.ethnicMen, 3, 2, 0),
  },
  {
    name: "Heavyweight Oversized Tee",
    category: "t-shirts",
    price: 1199,
    discount: 25,
    colors: [C.black, C.white, C.olive],
    sizes: APPAREL,
    stock: 80,
    flags: ["best", "featured"],
    collections: ["everyday-essentials"],
    fabric: "240 GSM combed cotton, bio-washed",
    care: MACHINE,
    description:
      "A boxy, dropped-shoulder tee in dense 240 GSM cotton that keeps its structure. Pre-shrunk and bio-washed for a soft, lived-in hand feel.",
    images: pick(IMAGES.tees, 1, 0, 3),
  },
  {
    name: "Essential Crew Neck Tee",
    category: "t-shirts",
    price: 799,
    discount: 0,
    colors: [C.white, C.navy, C.grey],
    sizes: APPAREL,
    stock: 120,
    collections: ["everyday-essentials"],
    fabric: "180 GSM Supima-blend cotton",
    care: MACHINE,
    description: "The tee you will buy in every colour. Regular fit, tight-knit rib collar, and a fabric that stays smooth after fifty washes.",
    images: pick(IMAGES.tees, 0, 4, 3),
  },
  {
    name: "Madhubani Graphic Tee",
    category: "t-shirts",
    price: 999,
    discount: 10,
    colors: [C.ivory, C.black],
    sizes: APPAREL,
    stock: 45,
    flags: ["new"],
    collections: ["everyday-essentials"],
    fabric: "Organic cotton, water-based print",
    care: MACHINE,
    description: "A modern take on Madhubani folk art, screen printed with eco-friendly water-based inks on soft organic cotton.",
    images: pick(IMAGES.tees, 2, 5, 0),
  },
  {
    name: "Pique Polo T-Shirt",
    category: "t-shirts",
    price: 1299,
    discount: 15,
    colors: [C.navy, C.white, C.maroon],
    sizes: APPAREL,
    stock: 7,
    collections: ["everyday-essentials"],
    fabric: "Cotton pique",
    care: MACHINE,
    description: "A smart pique polo with a two-button placket, ribbed cuffs and a tennis tail hem. Office Fridays sorted.",
    images: pick(IMAGES.tees, 5, 1, 4),
  },
  {
    name: "High-Rise Straight Fit Jeans",
    category: "jeans",
    price: 2299,
    discount: 20,
    colors: [C.lightBlue, C.darkBlue],
    sizes: DENIM,
    stock: 38,
    flags: ["best", "featured"],
    collections: ["everyday-essentials"],
    fabric: "Rigid cotton denim, 12 oz",
    care: MACHINE,
    description: "A clean straight leg with a flattering high rise and a vintage-inspired wash. Rigid denim that softens and moulds to you over time.",
    images: pick(IMAGES.jeans, 0, 2, 4),
  },
  {
    name: "Wide-Leg Baggy Jeans",
    category: "jeans",
    price: 2599,
    discount: 15,
    colors: [C.lightBlue, C.black],
    sizes: DENIM,
    stock: 19,
    flags: ["new"],
    collections: ["everyday-essentials"],
    fabric: "Cotton denim with 1% stretch",
    care: MACHINE,
    description: "Relaxed through the hip and wide all the way down, with a slightly cropped length that shows off your sneakers.",
    images: pick(IMAGES.jeans, 2, 3, 0),
  },
  {
    name: "Slim Tapered Stretch Jeans",
    category: "jeans",
    price: 1999,
    discount: 30,
    colors: [C.darkBlue, C.grey],
    sizes: DENIM,
    stock: 50,
    collections: ["everyday-essentials"],
    fabric: "Power-stretch denim",
    care: MACHINE,
    description: "Slim through the thigh with a tapered ankle and comfort stretch that moves with you. A wardrobe workhorse.",
    images: pick(IMAGES.jeans, 1, 4, 3),
  },
];

const REVIEWERS = [
  ["Ananya Iyer", "Chennai"],
  ["Ritika Malhotra", "Delhi"],
  ["Sneha Kulkarni", "Pune"],
  ["Farah Khan", "Hyderabad"],
  ["Meera Nair", "Kochi"],
  ["Pooja Agarwal", "Jaipur"],
  ["Kavya Reddy", "Bengaluru"],
  ["Ishita Banerjee", "Kolkata"],
  ["Rohan Mehta", "Mumbai"],
  ["Arjun Singh", "Chandigarh"],
  ["Divya Patel", "Ahmedabad"],
  ["Simran Kaur", "Ludhiana"],
];

const REVIEW_TEXTS: [number, string, string][] = [
  [5, "Exactly like the photos", "The fabric quality is lovely and the colour is exactly as shown. Got so many compliments at my cousin's engagement!"],
  [5, "Perfect fit", "I followed the size chart and it fits perfectly. Stitching is neat and the finishing feels premium."],
  [4, "Beautiful, runs slightly large", "Gorgeous piece and very comfortable. It runs a little large so consider sizing down if you are between sizes."],
  [5, "Super fast delivery", "Ordered on Monday, received on Wednesday in beautiful packaging. Will definitely order again."],
  [4, "Great value", "Feels much more expensive than the price. The colour is slightly deeper in person, which I actually prefer."],
  [5, "My new favourite", "Soft, breathable and so easy to style. I have already ordered another colour."],
  [5, "Gifted to my mother", "She loved it. The packaging and the handwritten note made it feel really special."],
  [4, "Lovely craftsmanship", "You can tell the embroidery is handmade. Delivery took a day longer than expected but worth the wait."],
];

export function reviewsFor(index: number) {
  const count = 2 + (index % 3);
  return Array.from({ length: count }, (_, i) => {
    const [name, city] = REVIEWERS[(index * 3 + i * 5) % REVIEWERS.length];
    const [rating, title, body] = REVIEW_TEXTS[(index + i * 3) % REVIEW_TEXTS.length];
    return { name, city, rating, title, body, daysAgo: 3 + ((index * 7 + i * 11) % 60) };
  });
}

export const COUPONS = [
  { code: "WELCOME10", type: "PERCENT", value: 10, minOrder: 999, maxDiscount: 500, description: "10% off your first order above ₹999" },
  { code: "FESTIVE20", type: "PERCENT", value: 20, minOrder: 2999, maxDiscount: 1500, description: "20% off festive orders above ₹2,999" },
  { code: "FLAT300", type: "FLAT", value: 300, minOrder: 1999, maxDiscount: 0, description: "Flat ₹300 off on orders above ₹1,999" },
];

export const DEFAULT_BANNERS = [
  {
    eyebrow: "The Festive Edit",
    title: "Crafted for the season of celebration",
    subtitle: "Handwoven silks, mirror-work and zari in jewel tones, made by artisans across India.",
    image: IMAGES.ethnicWomen[5],
    cta: "Shop the edit",
    link: "/shop?collection=festive-edit",
  },
  {
    eyebrow: "New Season",
    title: "Linen days, slow evenings",
    subtitle: "Breathable co-ords and kurtis in sun-washed shades for the warm months ahead.",
    image: IMAGES.westernWomen[5],
    cta: "Discover linen",
    link: "/shop?collection=summer-linen",
  },
  {
    eyebrow: "Everyday Essentials",
    title: "Wardrobe heroes, built to last",
    subtitle: "Heavyweight tees and honest denim that only get better with time.",
    image: IMAGES.lifestyle[1],
    cta: "Shop essentials",
    link: "/shop?collection=everyday-essentials",
  },
];

export const DEFAULT_SETTINGS = {
  announcement: "Free shipping on orders above ₹1,499 · Use WELCOME10 for 10% off your first order",
  announcementOn: true,
  primaryColor: "#7a2232",
  accentColor: "#b8893b",
  banners: JSON.stringify(DEFAULT_BANNERS),
  deliveryCharge: 79,
  expressCharge: 149,
  freeDeliveryAbove: 1499,
  codCharge: 0,
  gstPercent: 5,
  email: "",
  phone: "+91 98765 43210",
  whatsapp: "919876543210",
  address: "2nd Floor, 14 Linking Road, Bandra West, Mumbai 400050",
  instagram: "https://www.instagram.com",
  facebook: "https://www.facebook.com",
  youtube: "https://www.youtube.com",
  pinterest: "https://www.pinterest.com",
};

export const SAMPLE_CUSTOMERS = [
  { name: "Priya Sharma", email: "priya@demo.store", phone: "9820012345", city: "Mumbai", state: "Maharashtra", pincode: "400050", line1: "B-602, Sea Breeze Apartments", line2: "Carter Road, Bandra West" },
  { name: "Aditi Rao", email: "aditi.rao@example.com", phone: "9845098450", city: "Bengaluru", state: "Karnataka", pincode: "560038", line1: "48, 12th Main Road", line2: "Indiranagar" },
  { name: "Neha Gupta", email: "neha.gupta@example.com", phone: "9811198111", city: "New Delhi", state: "Delhi", pincode: "110024", line1: "C-21, Lajpat Nagar II", line2: "" },
  { name: "Karan Joshi", email: "karan.joshi@example.com", phone: "9925099250", city: "Ahmedabad", state: "Gujarat", pincode: "380015", line1: "7, Shivalik Bungalows", line2: "Satellite Road" },
  { name: "Lakshmi Menon", email: "lakshmi.m@example.com", phone: "9447094470", city: "Kochi", state: "Kerala", pincode: "682020", line1: "Flat 3A, Marine Heights", line2: "Panampilly Nagar" },
  { name: "Sana Qureshi", email: "sana.q@example.com", phone: "9030090300", city: "Hyderabad", state: "Telangana", pincode: "500034", line1: "Road No. 10", line2: "Banjara Hills" },
];

/** [customerIndex, productIndexes, status, daysAgo, payment, coupon?] */
export const SAMPLE_ORDERS: [number, number[], string, number, string, string?][] = [
  [0, [0, 19], "DELIVERED", 12, "UPI"],
  [1, [5], "DELIVERED", 10, "CARD", "FESTIVE20"],
  [2, [11, 21], "DELIVERED", 9, "COD"],
  [3, [17, 23], "SHIPPED", 6, "NETBANKING"],
  [4, [6], "SHIPPED", 5, "UPI", "FLAT300"],
  [5, [15, 2], "PACKED", 3, "CARD"],
  [0, [24, 20], "OUT_FOR_DELIVERY", 2, "UPI", "WELCOME10"],
  [1, [12], "PLACED", 1, "COD"],
  [2, [9, 4], "PLACED", 0, "UPI"],
];
