// Known trailheads for Colorado 14ers — used to identify route from GPS start point.
// Coordinates sourced from 14ers.com / USGS.
// Each entry: { name (route name), trailhead (human label), lat, lng }
// Peaks without data fall back to the generic trailhead string from fourteeners.js.

const TRAILHEADS = {
  // ── Sawatch Range ──────────────────────────────────────────────────────────
  'mount-elbert': [
    { name: 'North Elbert Trail',    trailhead: 'North Elbert Trailhead',    lat: 39.1398, lng: -106.4432 },
    { name: 'South Elbert Trail',    trailhead: 'South Elbert Trailhead',    lat: 39.0867, lng: -106.4407 },
    { name: 'East Ridge Trail',      trailhead: 'Black Cloud Trailhead',     lat: 39.1093, lng: -106.4217 },
  ],
  'mount-massive': [
    { name: 'Mount Massive Trail',   trailhead: 'Mount Massive Trailhead',   lat: 39.2076, lng: -106.4703 },
    { name: 'Southwest Slopes',      trailhead: 'Halfmoon East Trailhead',   lat: 39.1483, lng: -106.4571 },
  ],
  'mount-harvard': [
    { name: 'Pine Creek Trail',      trailhead: 'Pine Creek Trailhead',      lat: 38.8749, lng: -106.2793 },
    { name: 'North Cottonwood',      trailhead: 'North Cottonwood Trailhead',lat: 38.9190, lng: -106.2920 },
  ],
  'la-plata-peak': [
    { name: 'Northeast Ridge',       trailhead: 'La Plata Trailhead',        lat: 39.0499, lng: -106.4791 },
    { name: 'Southwest Ridge',       trailhead: 'Winfield Trailhead',        lat: 38.9881, lng: -106.4479 },
  ],
  'mount-antero': [
    { name: 'Baldwin Creek Road',    trailhead: 'Baldwin Creek Trailhead',   lat: 38.6634, lng: -106.2258 },
    { name: "Brown's Lake Route",    trailhead: "Brown's Lake Trailhead",    lat: 38.6700, lng: -106.2600 },
  ],
  'mount-shavano': [
    { name: 'Shavano-Tabeguache Trail', trailhead: 'Shavano Trailhead',      lat: 38.5899, lng: -106.0891 },
  ],
  'mount-belford': [
    { name: 'Belford-Oxford Trail',  trailhead: 'Belford/Oxford Trailhead',  lat: 38.9673, lng: -106.3763 },
  ],
  'mount-oxford': [
    { name: 'Belford-Oxford Trail',  trailhead: 'Belford/Oxford Trailhead',  lat: 38.9673, lng: -106.3763 },
  ],
  'missouri-mountain': [
    { name: 'Iron City Trail',       trailhead: 'Iron City Trailhead',       lat: 38.9459, lng: -106.3924 },
  ],
  'mount-columbia': [
    { name: 'Harvard-Columbia Trail',trailhead: 'Columbia Trailhead',        lat: 38.9036, lng: -106.3149 },
  ],
  'mount-yale': [
    { name: 'Denny Creek Trail',     trailhead: 'Denny Creek Trailhead',     lat: 38.8315, lng: -106.3027 },
  ],
  'mount-princeton': [
    { name: 'Princeton Trail',       trailhead: 'Princeton Trailhead',       lat: 38.7493, lng: -106.1748 },
  ],
  'huron-peak': [
    { name: 'South Winfield Trail',  trailhead: 'South Winfield Trailhead',  lat: 38.8853, lng: -106.4361 },
  ],
  'mount-of-the-holy-cross': [
    { name: 'Halfmoon Trail',        trailhead: 'Halfmoon Trailhead',        lat: 39.4690, lng: -106.5071 },
    { name: 'Fall Creek Trail',      trailhead: 'Fall Creek Trailhead',      lat: 39.4537, lng: -106.5261 },
  ],

  // ── Front Range ────────────────────────────────────────────────────────────
  'longs-peak': [
    { name: 'Keyhole Route',         trailhead: 'Longs Peak Trailhead',      lat: 40.2724, lng: -105.5567 },
    { name: 'Loft Route',            trailhead: 'Longs Peak Trailhead',      lat: 40.2724, lng: -105.5567 },
  ],
  'mount-evans': [
    { name: 'Summit Lake Trail',     trailhead: 'Summit Lake Trailhead',     lat: 39.5908, lng: -105.6422 },
    { name: 'Chicago Lakes Trail',   trailhead: 'Chicago Lakes Trailhead',   lat: 39.6097, lng: -105.6106 },
    { name: 'Mount Evans Road',      trailhead: 'Echo Lake Trailhead',       lat: 39.6578, lng: -105.6047 },
  ],
  'grays-peak': [
    { name: 'Grays Peak Trail',      trailhead: 'Grays/Torreys Trailhead',   lat: 39.5633, lng: -105.8236 },
  ],
  'torreys-peak': [
    { name: 'Torreys via Grays',     trailhead: 'Grays/Torreys Trailhead',   lat: 39.5633, lng: -105.8236 },
    { name: 'Kelso Ridge',           trailhead: 'Grays/Torreys Trailhead',   lat: 39.5633, lng: -105.8236 },
  ],
  'quandary-peak': [
    { name: 'East Ridge Trail',      trailhead: 'Quandary Peak Trailhead',   lat: 39.3815, lng: -106.1081 },
    { name: 'Cristo Couloir',        trailhead: 'Quandary Peak Trailhead',   lat: 39.3815, lng: -106.1081 },
  ],
  'mount-lincoln': [
    { name: 'Kite Lake Route',       trailhead: 'Kite Lake Trailhead',       lat: 39.3391, lng: -106.1354 },
  ],
  'mount-bross': [
    { name: 'Kite Lake Route',       trailhead: 'Kite Lake Trailhead',       lat: 39.3391, lng: -106.1354 },
  ],
  'mount-democrat': [
    { name: 'Kite Lake Route',       trailhead: 'Kite Lake Trailhead',       lat: 39.3391, lng: -106.1354 },
  ],
  'mount-cameron': [
    { name: 'Kite Lake Route',       trailhead: 'Kite Lake Trailhead',       lat: 39.3391, lng: -106.1354 },
  ],
  'pikes-peak': [
    { name: 'Barr Trail',            trailhead: 'Barr Trailhead',            lat: 38.8475, lng: -104.9772 },
    { name: 'Crags Trail',           trailhead: 'The Crags Trailhead',       lat: 38.8617, lng: -105.0672 },
    { name: 'Pikes Peak Highway',    trailhead: 'Pikes Peak Highway Gate',   lat: 38.8651, lng: -104.9882 },
  ],

  // ── Elk Mountains ──────────────────────────────────────────────────────────
  'capitol-peak': [
    { name: 'Capitol Lake Route',    trailhead: 'Capitol Lake Trailhead',    lat: 39.1581, lng: -107.1040 },
  ],
  'snowmass-mountain': [
    { name: 'Snowmass Lake Route',   trailhead: 'Snowmass Creek Trailhead',  lat: 39.1770, lng: -107.0660 },
  ],
  'maroon-peak': [
    { name: 'West Maroon Trail',     trailhead: 'Maroon Lake Trailhead',     lat: 39.0938, lng: -106.9436 },
    { name: 'South Ridge',           trailhead: 'Maroon Lake Trailhead',     lat: 39.0938, lng: -106.9436 },
  ],
  'north-maroon-peak': [
    { name: 'Northeast Ridge',       trailhead: 'Maroon Lake Trailhead',     lat: 39.0938, lng: -106.9436 },
  ],
  'pyramid-peak': [
    { name: 'Northeast Arête',       trailhead: 'Maroon Creek Trailhead',    lat: 39.0859, lng: -106.9400 },
  ],

  // ── Sangre de Cristo ───────────────────────────────────────────────────────
  'crestone-peak': [
    { name: 'South Face Route',      trailhead: 'South Colony Trailhead',    lat: 37.9520, lng: -105.5735 },
  ],
  'crestone-needle': [
    { name: 'Broken Hand Route',     trailhead: 'South Colony Trailhead',    lat: 37.9520, lng: -105.5735 },
  ],
  'kit-carson-peak': [
    { name: 'South Colony Route',    trailhead: 'South Colony Trailhead',    lat: 37.9520, lng: -105.5735 },
  ],
  'challenger-point': [
    { name: 'South Colony Route',    trailhead: 'South Colony Trailhead',    lat: 37.9520, lng: -105.5735 },
  ],
  'humboldt-peak': [
    { name: 'South Colony Trail',    trailhead: 'South Colony Trailhead',    lat: 37.9520, lng: -105.5735 },
  ],
  'blanca-peak': [
    { name: 'Lake Como Route',       trailhead: 'Lake Como Trailhead',       lat: 37.5275, lng: -105.4946 },
  ],
  'ellingwood-point': [
    { name: 'Lake Como Route',       trailhead: 'Lake Como Trailhead',       lat: 37.5275, lng: -105.4946 },
  ],
  'little-bear-peak': [
    { name: 'Lake Como Route',       trailhead: 'Lake Como Trailhead',       lat: 37.5275, lng: -105.4946 },
  ],

  // ── San Juan Mountains ─────────────────────────────────────────────────────
  'uncompahgre-peak': [
    { name: 'Nellie Creek Trail',    trailhead: 'Nellie Creek Trailhead',    lat: 38.0634, lng: -107.4645 },
    { name: 'Big Blue Wilderness',   trailhead: 'Big Blue Trailhead',        lat: 38.0245, lng: -107.5095 },
  ],
  'wetterhorn-peak': [
    { name: 'Matterhorn Route',      trailhead: 'Matterhorn Trailhead',      lat: 38.1017, lng: -107.5101 },
  ],
  'handies-peak': [
    { name: 'American Basin Trail',  trailhead: 'American Basin Trailhead',  lat: 37.9445, lng: -107.5139 },
    { name: 'Grouse Gulch Route',    trailhead: 'Grouse Gulch Trailhead',    lat: 37.9711, lng: -107.5066 },
  ],
  'redcloud-peak': [
    { name: 'Silver Creek Trail',    trailhead: 'Silver Creek Trailhead',    lat: 37.9519, lng: -107.5249 },
  ],
  'sunshine-peak': [
    { name: 'Silver Creek Trail',    trailhead: 'Silver Creek Trailhead',    lat: 37.9519, lng: -107.5249 },
  ],
  'san-luis-peak': [
    { name: 'Stewart Creek Trail',   trailhead: 'Stewart Creek Trailhead',   lat: 38.0723, lng: -107.0191 },
  ],
  'mount-sneffels': [
    { name: 'Yankee Boy Basin',      trailhead: 'Yankee Boy Basin Trailhead',lat: 38.0027, lng: -107.7729 },
    { name: 'Blue Lakes Route',      trailhead: 'Blue Lakes Trailhead',      lat: 38.0503, lng: -107.8015 },
  ],
  'mount-wilson': [
    { name: 'Navajo Lake Route',     trailhead: 'Navajo Lake Trailhead',     lat: 37.8226, lng: -108.0015 },
  ],
  'wilson-peak': [
    { name: 'Silver Pick Route',     trailhead: 'Silver Pick Trailhead',     lat: 37.8432, lng: -108.0345 },
    { name: 'Navajo Lake Route',     trailhead: 'Navajo Lake Trailhead',     lat: 37.8226, lng: -108.0015 },
  ],
  'el-diente-peak': [
    { name: 'Navajo Lake Route',     trailhead: 'Navajo Lake Trailhead',     lat: 37.8226, lng: -108.0015 },
  ],
  'mount-eolus': [
    { name: 'Needle Mountains Route',trailhead: 'Needleton (D&SNG Train)',   lat: 37.6433, lng: -107.7081 },
  ],
  'windom-peak': [
    { name: 'Needle Mountains Route',trailhead: 'Needleton (D&SNG Train)',   lat: 37.6433, lng: -107.7081 },
  ],
  'sunlight-peak': [
    { name: 'Needle Mountains Route',trailhead: 'Needleton (D&SNG Train)',   lat: 37.6433, lng: -107.7081 },
  ],
  'mount-lindsey': [
    { name: 'Huerfano Valley Route', trailhead: 'Lily Lake Trailhead',       lat: 37.5821, lng: -105.4456 },
  ],

  // ── Tenmile / Mosquito Range ───────────────────────────────────────────────
  'mount-sherman': [
    { name: 'Fourmile Creek Trail',  trailhead: 'Mount Sherman Trailhead',   lat: 39.2134, lng: -106.1607 },
  ],
};

module.exports = { TRAILHEADS };
