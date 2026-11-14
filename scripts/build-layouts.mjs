// Builds src/data/layouts.json: the bundled fallback runway layouts.
//
// Source: OurAirports (https://ourairports.com/data/), public domain.
// Usage: node scripts/build-layouts.mjs [path/to/runways.csv]
// Without a path, the CSV is downloaded.
import { readFile, writeFile } from "node:fs/promises";

const SOURCE = "https://davidmegginson.github.io/ourairports-data/runways.csv";

// Airports offered by the Australian ATIS integration (const.py AIRPORTS).
const AIRPORTS = [
  "YSSY", "YMML", "YBBN", "YPPH", "YPAD", "YSCB", "YMHB", "YPDN",
  "YBCG", "YBCS", "YBTL", "YBSU", "YBMK", "YBRK", "YMLT", "YMAV", "YMEN", "YWLM", "YBAS", "YPKA", "YPPD", "YPLM",
  "YAMB", "YBOK", "YCIN", "YGIG", "YMES", "YMPC", "YPEA", "YPED", "YPTN", "YPWR", "YBSG", "YSNW", "YSRI",
];

const SURFACES = [
  [/^(ASP|BIT|PEM|SEAL|TAR)/, "asphalt"],
  [/^CON/, "concrete"],
  [/^(GRS|GRASS|TURF)/, "grass"],
  [/^(GVL|GRV|GRAVEL)/, "gravel"],
  [/^WATER/, "water"],
  [/^(DIRT|SAND|CLAY|EARTH|NATURAL)/, "dirt"],
];

function parseCsvLine(line) {
  const cells = [];
  let cell = "";
  let quoted = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (quoted) {
      if (ch === '"' && line[i + 1] === '"') { cell += '"'; i++; }
      else if (ch === '"') quoted = false;
      else cell += ch;
    } else if (ch === '"') quoted = true;
    else if (ch === ",") { cells.push(cell); cell = ""; }
    else cell += ch;
  }
  cells.push(cell);
  return cells;
}

const num = (value) => (value === "" || Number.isNaN(Number(value)) ? null : Number(value));
const round = (value, places) => Number(value.toFixed(places));

const path = process.argv[2];
const csv = path ? await readFile(path, "utf8") : await (await fetch(SOURCE)).text();
const [headerLine, ...lines] = csv.split(/\r?\n/).filter(Boolean);
const header = parseCsvLine(headerLine);

const layouts = Object.fromEntries(AIRPORTS.map((icao) => [icao, []]));
for (const line of lines) {
  const row = Object.fromEntries(parseCsvLine(line).map((value, i) => [header[i], value]));
  const runways = layouts[row.airport_ident];
  if (!runways || row.closed === "1") continue;
  const ends = ["le", "he"].map((p) => ({
    ident: row[`${p}_ident`],
    latitude: num(row[`${p}_latitude_deg`]),
    longitude: num(row[`${p}_longitude_deg`]),
  }));
  // Helipads and runways without both thresholds can't be drawn.
  if (ends.some((end) => !/^\d{2}[LRC]?$/.test(end.ident) || end.latitude === null || end.longitude === null)) continue;
  const surface = SURFACES.find(([pattern]) => pattern.test(row.surface.toUpperCase()))?.[1] ?? "unknown";
  runways.push({
    ident: ends.map((end) => end.ident).join("/"),
    length: num(row.length_ft) === null ? null : Math.round(num(row.length_ft) * 0.3048),
    width: num(row.width_ft) === null ? null : Math.round(num(row.width_ft) * 0.3048),
    surface,
    ends: ends.map((end) => ({
      ident: end.ident,
      latitude: round(end.latitude, 6),
      longitude: round(end.longitude, 6),
    })),
  });
}

for (const [icao, runways] of Object.entries(layouts)) {
  runways.sort((a, b) => a.ident.localeCompare(b.ident));
  console.log(icao, runways.map((r) => `${r.ident} ${r.length}x${r.width} ${r.surface}`).join(" | ") || "NO RUNWAYS");
}
await writeFile(new URL("../src/data/layouts.json", import.meta.url), JSON.stringify(layouts) + "\n");
