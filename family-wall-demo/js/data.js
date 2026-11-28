/* DRAFT - example data. Fictional family, fictional shops. Nothing here is real. */
window.HYPX_EXAMPLE = {
  dateLabel: "Friday, November 27",
  startTime: "15:10",
  weather: { temp: 58, desc: "Clear", hi: 62, lo: 41, icon: "sun" },
  events: {
    alex:  [
      { s: "09:30", e: "10:00", t: "Team stand-up" },
      { s: "12:00", e: "13:00", t: "Lunch with Priya" },
      { s: "17:15", e: "17:45", t: "Takeout pickup", p: "Example Kitchen" }
    ],
    sam:   [
      { s: "08:00", e: "09:00", t: "Gym" },
      { s: "16:00", e: "16:45", t: "Contractor call" },
      { s: "19:00", e: "20:30", t: "Book club", p: "Dana's place" }
    ],
    riley: [
      { s: "11:00", e: "12:00", t: "Brunch with cousins" },
      { s: "15:45", e: "17:00", t: "Soccer practice", p: "Brookside Field" },
      { s: "18:00", e: "18:30", t: "Piano practice" }
    ],
    jo:    [
      { s: "10:00", e: "11:00", t: "Swim lesson" },
      { s: "16:30", e: "17:15", t: "Piano lesson", p: "Maple Music" }
    ]
  },
  weatherNight: { temp: 52, desc: "Clear" },
  agents: [
    { name: "Concierge", status: "2 waiting on you",  st: "wait" },
    { name: "Calendar",  status: "Synced 2 min ago",  st: "ok" },
    { name: "Shopper",   status: "Watching 7 orders", st: "ok" },
    { name: "Budget",    status: "Sorting 4 charges", st: "work" }
  ],
  approvals: [
    { id: "water", item: "Reorder water filters", who: "sam", at: "3:02 PM", amount: 38 },
    { id: "dishwasher", item: "Replace dishwasher",    who: "alex", at: "2:58 PM", amount: 640 }
  ],
  queued: [ { q: "Add oat milk to the grocery list" } ],
  pinPrompt: { item: "Reorder water filters", action: "Approve" },
  everyone: { s: "18:30", t: "Dinner at the grandparents'" },
  deliveries: {
    today: [
      { shop: "Example Outfitters", item: "Rain jackets (2)", who: "riley", step: 3, eta: "Today, 3:30 to 6:00 PM", note: "6 stops away", carrier: "Courier" },
      { shop: "Sample Home", item: "Shelf bracket kit", who: "alex", step: 3, eta: "Today, by 8:00 PM", note: "12 stops away", carrier: "Courier" }
    ],
    onway: [
      { shop: "Example Toys", item: "Building set", who: "jo", step: 2, eta: "Tue, Dec 1", note: "Left the sorting hub", carrier: "Postal service" },
      { shop: "Sample Books", item: "Cookbook", who: "sam", step: 2, eta: "Wed, Dec 2", note: "In transit", carrier: "Postal service" },
      { shop: "Example Outfitters", item: "Shin guards", who: "riley", step: 1, eta: "Thu, Dec 3", note: "Packing at the shop", carrier: "Courier" }
    ],
    returns: [
      { shop: "Sample Home", item: "Desk lamp", who: "alex", by: "Sat, Nov 29", left: "2 days left", note: "Prepaid label ready", urgent: true },
      { shop: "Example Outfitters", item: "Winter boots, size 5", who: "riley", by: "Tue, Dec 1", left: "4 days left", note: "Label and QR ready", urgent: false }
    ],
    checked: "3:08 PM"
  },
  budget: {
    day: 27, days: 30,
    cats: [
      { name: "Groceries",          spent: 612, plan: 800 },
      { name: "Dining out",         spent: 342, plan: 300 },
      { name: "Home and repairs",   spent: 395, plan: 400 },
      { name: "Kids and activities",spent: 210, plan: 350 },
      { name: "Transport",          spent: 148, plan: 220 },
      { name: "Subscriptions",      spent: 86,  plan: 90  }
    ]
  },
  answer: {
    q: "When are the rain jackets coming?",
    a: "The rain jackets are <b>out for delivery</b>, 6 stops away. Expect them between <b>3:30 and 6:00 PM</b>.",
    specialist: "Shopper"
  }
};

/* 28 Grok Bot voices documented for the wall. Source: concierge-voices-DRAFT.md.
   Ids match concierge.voice / xAI TTS voice_id. Claudia is omitted. Default is eve. */
window.HYPX_VOICES = [
  {id:"altair",  name:"Altair",  tone:"Elegant, refined, and effortlessly premium"},
  {id:"ara",     name:"Ara",     tone:"Warm and friendly"},
  {id:"atlas",   name:"Atlas",   tone:"Confident, commanding, and reassuring"},
  {id:"aurora",  name:"Aurora",  tone:"Serene, steady, and radiant"},
  {id:"carina",  name:"Carina",  tone:"Soft, empathetic, and soothing"},
  {id:"castor",  name:"Castor",  tone:"Charismatic, down-to-earth, and easygoing"},
  {id:"celeste", name:"Celeste", tone:"Compassionate, confident, and reassuring"},
  {id:"cosmo",   name:"Cosmo",   tone:"Bright, curious, and easy to follow"},
  {id:"eve",     name:"Eve",     tone:"Energetic and upbeat; British accent"},
  {id:"helios",  name:"Helios",  tone:"Upbeat, energetic, and endlessly versatile"},
  {id:"helix",   name:"Helix",   tone:"Bold, dynamic, and adrenaline-fueled"},
  {id:"iris",    name:"Iris",    tone:"Friendly, upbeat, and naturally charming"},
  {id:"kepler",  name:"Kepler",  tone:"Inventive, forward-thinking, and charismatic"},
  {id:"leo",     name:"Leo",     tone:"Authoritative and strong; British accent"},
  {id:"liora",   name:"Liora",   tone:"Calm, grounded, and luminous"},
  {id:"lumen",   name:"Lumen",   tone:"Warm, articulate, and engaging"},
  {id:"luna",    name:"Luna",    tone:"Gentle, patient, and deeply nurturing"},
  {id:"lux",     name:"Lux",     tone:"Grounded, calm, and quietly wise"},
  {id:"naksh",   name:"Naksh",   tone:"Warm, thoughtful, and wise; Indian accent"},
  {id:"orion",   name:"Orion",   tone:"Rich, cinematic, and resonant"},
  {id:"perseus", name:"Perseus", tone:"Strong, confident, and trustworthy"},
  {id:"rex",     name:"Rex",     tone:"Confident and clear"},
  {id:"rigel",   name:"Rigel",   tone:"Precise, professional, and calmly confident; Australian accent"},
  {id:"sal",     name:"Sal",     tone:"Smooth and balanced"},
  {id:"sirius",  name:"Sirius",  tone:"Quick-witted, clever, and playful"},
  {id:"ursa",    name:"Ursa",    tone:"Friendly, warm, and steadfast"},
  {id:"zagan",   name:"Zagan",   tone:"Powerful, dramatic, and unmistakable"},
  {id:"zenith",  name:"Zenith",  tone:"Sharp, focused, and driven"}
];
