// Pure logic for the card: runway IDs, layouts, which runway ends are in use,
// unit conversion and the map projection. No DOM or Lit here, so it can be
// unit tested on its own.
import bundledLayouts from "./data/layouts.json";

export type Surface = "asphalt" | "concrete" | "grass" | "gravel" | "water" | "dirt" | "unknown";

export interface RunwayEndLayout {
  ident: string;
  latitude: number;
  longitude: number;
  heading?: number | null;
}

export interface RunwayLayout {
  ident: string;
  length?: number | null;
  width?: number | null;
  surface?: string;
  ends: [RunwayEndLayout, RunwayEndLayout];
}

export type LayoutSource = "integration" | "bundled" | "none";

export interface EndUsage {
  arrival: boolean;
  departure: boolean;
}

// ---------------------------------------------------------------------------
// Runway identifiers
// ---------------------------------------------------------------------------

const RUNWAY_ID = /^(\d{1,2})\s*([LRC])?$/;

/** Normalise a runway ID: "7" → "07", "34 l" → "34L". Invalid IDs give null. */
export function normaliseRunway(value: unknown): string | null {
  if (typeof value !== "string" && typeof value !== "number") return null;
  const match = RUNWAY_ID.exec(String(value).trim().toUpperCase());
  if (!match) return null;
  const number = Number(match[1]);
  if (number < 1 || number > 36) return null;
  return String(number).padStart(2, "0") + (match[2] ?? "");
}

/**
 * Turn a list attribute (["34L", "34R"]) or a sensor state ("34L, 34R") into
 * normalised, de-duplicated runway IDs. "unknown"/"unavailable" give [].
 */
export function runwayList(value: unknown): string[] {
  let items: unknown[] = [];
  if (Array.isArray(value)) items = value;
  else if (typeof value === "string") items = value.split(",");
  const result: string[] = [];
  for (const item of items) {
    const runway = normaliseRunway(item);
    if (runway && !result.includes(runway)) result.push(runway);
  }
  return result;
}

// ---------------------------------------------------------------------------
// Layouts
// ---------------------------------------------------------------------------

const isNumber = (value: unknown): value is number => typeof value === "number" && Number.isFinite(value);

function validEnd(value: unknown): RunwayEndLayout | null {
  if (!value || typeof value !== "object") return null;
  const end = value as Record<string, unknown>;
  const ident = normaliseRunway(end.ident);
  if (!ident || !isNumber(end.latitude) || !isNumber(end.longitude)) return null;
  return {
    ident,
    latitude: end.latitude,
    longitude: end.longitude,
    heading: isNumber(end.heading) ? end.heading : null,
  };
}

/**
 * Keep only drawable runways: two ends with coordinates and real runway IDs.
 * Helipads ("H09L") and broken entries are dropped.
 */
export function validLayout(value: unknown): RunwayLayout[] {
  if (!Array.isArray(value)) return [];
  const runways: RunwayLayout[] = [];
  for (const item of value) {
    if (!item || typeof item !== "object") continue;
    const raw = item as Record<string, unknown>;
    if (!Array.isArray(raw.ends) || raw.ends.length !== 2) continue;
    const low = validEnd(raw.ends[0]);
    const high = validEnd(raw.ends[1]);
    if (!low || !high) continue;
    if (low.latitude === high.latitude && low.longitude === high.longitude) continue;
    runways.push({
      ident: `${low.ident}/${high.ident}`,
      length: isNumber(raw.length) ? raw.length : null,
      width: isNumber(raw.width) ? raw.width : null,
      surface: typeof raw.surface === "string" ? raw.surface : "unknown",
      ends: [low, high],
    });
  }
  return runways;
}

/** The layout bundled with the card (OurAirports data), for an ICAO code. */
export function bundledLayout(icao: string): RunwayLayout[] {
  const layouts = bundledLayouts as Record<string, unknown>;
  return validLayout(layouts[icao.toUpperCase()]);
}

/** Prefer the integration's layout attribute; fall back to the bundled data. */
export function resolveLayout(
  attribute: unknown,
  icao: string,
): { runways: RunwayLayout[]; source: LayoutSource } {
  const fromIntegration = validLayout(attribute);
  if (fromIntegration.length) return { runways: fromIntegration, source: "integration" };
  const bundled = bundledLayout(icao);
  if (bundled.length) return { runways: bundled, source: "bundled" };
  return { runways: [], source: "none" };
}

// ---------------------------------------------------------------------------
// Which runway ends are in use
// ---------------------------------------------------------------------------

/**
 * Find the layout end for a runway ID. An exact match wins. Otherwise a
 * runway whose number matches exactly one end is accepted, so "34" matches a
 * layout end "34R" if that's the only 34, and "16L" matches "16" if the
 * layout has no suffixes.
 */
export function findEnd(runways: RunwayLayout[], runway: string): string | null {
  const ends = runways.flatMap((r) => r.ends.map((e) => e.ident));
  if (ends.includes(runway)) return runway;
  const number = runway.slice(0, 2);
  const candidates = ends.filter((ident) => ident.slice(0, 2) === number);
  return candidates.length === 1 ? candidates[0] : null;
}

/** Map each layout end that's in use to its usage, and list runways not on the map. */
export function endUsage(
  runways: RunwayLayout[],
  arrivals: string[],
  departures: string[],
): { usage: Map<string, EndUsage>; unmatched: string[] } {
  const usage = new Map<string, EndUsage>();
  const unmatched: string[] = [];
  const mark = (list: string[], key: keyof EndUsage) => {
    for (const runway of list) {
      const end = findEnd(runways, runway);
      if (!end) {
        if (!unmatched.includes(runway)) unmatched.push(runway);
        continue;
      }
      const current = usage.get(end) ?? { arrival: false, departure: false };
      current[key] = true;
      usage.set(end, current);
    }
  };
  mark(arrivals, "arrival");
  mark(departures, "departure");
  return { usage, unmatched };
}

// ---------------------------------------------------------------------------
// Units
// ---------------------------------------------------------------------------

const TO_KNOTS: Record<string, number> = {
  kn: 1,
  kt: 1,
  kts: 1,
  "km/h": 1 / 1.852,
  "m/s": 1.943844,
  mph: 0.868976,
  "ft/s": 0.592484,
};

/**
 * Convert a wind speed to knots. Home Assistant may show wind sensors in the
 * user's preferred unit (often km/h), so the card converts back.
 * Unknown units are assumed to be knots, the integration's native unit.
 */
export function toKnots(value: unknown, unit: unknown): number | null {
  const number = typeof value === "number" ? value : Number.parseFloat(String(value));
  if (!Number.isFinite(number)) return null;
  const factor = typeof unit === "string" ? TO_KNOTS[unit.trim().toLowerCase()] ?? 1 : 1;
  return Math.round(number * factor);
}

// ---------------------------------------------------------------------------
// Projection
// ---------------------------------------------------------------------------

export interface Point {
  x: number;
  y: number;
}

export interface ProjectedEnd {
  ident: string;
  point: Point;
  /** Unit vector in the direction aircraft move when using this end. */
  direction: Point;
}

export interface ProjectedRunway {
  ident: string;
  surface: Surface;
  /** Drawn width in px (exaggerated so runways read at card size). */
  widthPx: number;
  lengthPx: number;
  ends: [ProjectedEnd, ProjectedEnd];
}

export interface Projection {
  width: number;
  height: number;
  /** Degrees the map is rotated clockwise from north-up (0 = north up). */
  rotation: number;
  /** Length in px of drawn approach and climb-out paths. */
  approachPx: number;
  runways: ProjectedRunway[];
}

const SURFACES: Surface[] = ["asphalt", "concrete", "grass", "gravel", "water", "dirt", "unknown"];

export function surfaceOf(value: unknown): Surface {
  return SURFACES.includes(value as Surface) ? (value as Surface) : "unknown";
}

const METRES_PER_DEG_LAT = 110_540;
const METRES_PER_DEG_LNG = 111_320;
const rad = (deg: number) => (deg * Math.PI) / 180;

/** Heading in degrees (0 = north, clockwise) of the direction of travel for an end. */
export function endHeading(runway: RunwayLayout, endIndex: 0 | 1): number {
  const from = runway.ends[endIndex];
  const to = runway.ends[endIndex === 0 ? 1 : 0];
  const midLat = rad((from.latitude + to.latitude) / 2);
  const east = (to.longitude - from.longitude) * Math.cos(midLat) * METRES_PER_DEG_LNG;
  const north = (to.latitude - from.latitude) * METRES_PER_DEG_LAT;
  return ((Math.atan2(east, north) * 180) / Math.PI + 360) % 360;
}

/** Screen direction (y down) of a compass heading on a map rotated by `rotation`. */
export function headingVector(heading: number, rotation = 0): Point {
  const angle = rad(heading - rotation);
  return { x: Math.sin(angle), y: -Math.cos(angle) };
}

/**
 * Project runways onto a `width`-wide view box, rotated so `rotation` degrees
 * point up. The height adapts to the airport's shape, within limits, and the
 * bounds are padded so approach and climb-out paths fit.
 */
export function project(runways: RunwayLayout[], width = 400, rotation = 0): Projection {
  if (!runways.length) return { width, height: width * 0.6, rotation, approachPx: 0, runways: [] };

  const points = runways.flatMap((r) => r.ends);
  const lat0 = points.reduce((sum, p) => sum + p.latitude, 0) / points.length;
  const lng0 = points.reduce((sum, p) => sum + p.longitude, 0) / points.length;
  const cosLat = Math.cos(rad(lat0));
  const sin = Math.sin(rad(rotation));
  const cos = Math.cos(rad(rotation));

  // Metres east/north of the centre, rotated, then flipped to screen (y down).
  const toLocal = (end: RunwayEndLayout): Point => {
    const east = (end.longitude - lng0) * cosLat * METRES_PER_DEG_LNG;
    const north = (end.latitude - lat0) * METRES_PER_DEG_LAT;
    return { x: east * cos - north * sin, y: -(east * sin + north * cos) };
  };

  const local = runways.map((r) => r.ends.map(toLocal) as [Point, Point]);
  const xs = local.flat().map((p) => p.x);
  const ys = local.flat().map((p) => p.y);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  const extent = Math.max(maxX - minX, maxY - minY, 1000);
  const approach = extent * 0.42;

  const boundsW = maxX - minX + 2 * approach;
  const boundsH = maxY - minY + 2 * approach;
  const height = Math.round(Math.min(Math.max((width * boundsH) / boundsW, width * 0.55), width));
  const scale = Math.min(width / boundsW, height / boundsH);
  const offsetX = width / 2 - ((minX + maxX) / 2) * scale;
  const offsetY = height / 2 - ((minY + maxY) / 2) * scale;
  const toScreen = (p: Point): Point => ({ x: p.x * scale + offsetX, y: p.y * scale + offsetY });

  return {
    width,
    height,
    rotation,
    approachPx: approach * scale,
    runways: runways.map((runway, i) => {
      const [a, b] = local[i].map(toScreen);
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const length = Math.hypot(dx, dy);
      const unit = { x: dx / length, y: dy / length };
      const realWidth = runway.width ?? 30;
      return {
        ident: runway.ident,
        surface: surfaceOf(runway.surface),
        widthPx: 7 * (1 + Math.max(realWidth - 30, 0) / 60),
        lengthPx: length,
        ends: [
          { ident: runway.ends[0].ident, point: a, direction: unit },
          { ident: runway.ends[1].ident, point: b, direction: { x: -unit.x, y: -unit.y } },
        ],
      };
    }),
  };
}

/** Rotation that puts the first arrival runway's direction of travel at the top. */
export function arrivalUpRotation(runways: RunwayLayout[], arrivals: string[]): number {
  for (const runway of arrivals) {
    const end = findEnd(runways, runway);
    for (const layout of runways) {
      const index = layout.ends.findIndex((e) => e.ident === end);
      if (index >= 0) return Math.round(endHeading(layout, index as 0 | 1));
    }
  }
  return 0;
}

// ---------------------------------------------------------------------------
// ATFM Daily Plan
// ---------------------------------------------------------------------------

/** One hour of the ATFM Daily Plan. Times are milliseconds since the epoch. */
export interface PlanHour {
  start: number;
  end: number;
  runwayMode: string | null;
  arrivalRate: number | null;
}

/** A run of consecutive hours with the same runway mode. */
export interface ModeSegment {
  runwayMode: string | null;
  /** Index of the first hour, and one past the last. */
  from: number;
  to: number;
}

/**
 * Read the `forecast` attribute of `sensor.<icao>_atis_atfm_plan`. Entries
 * without valid times are dropped, and the rest are sorted by start time.
 */
export function planHours(value: unknown): PlanHour[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item): PlanHour | null => {
      if (!item || typeof item !== "object") return null;
      const hour = item as Record<string, unknown>;
      const start = Date.parse(String(hour.start));
      const end = Date.parse(String(hour.end));
      if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) return null;
      const mode = typeof hour.runway_mode === "string" && hour.runway_mode.trim() ? hour.runway_mode.trim() : null;
      const rate = typeof hour.arrival_rate === "number" && Number.isFinite(hour.arrival_rate) ? hour.arrival_rate : null;
      return { start, end, runwayMode: mode, arrivalRate: rate };
    })
    .filter((hour): hour is PlanHour => hour !== null)
    .sort((a, b) => a.start - b.start);
}

/** Index of the hour covering `now`, or -1 outside the plan. */
export function currentHourIndex(hours: PlanHour[], now: number): number {
  return hours.findIndex((hour) => hour.start <= now && now < hour.end);
}

/** Group consecutive hours with the same runway mode. */
export function modeSegments(hours: PlanHour[]): ModeSegment[] {
  const segments: ModeSegment[] = [];
  hours.forEach((hour, index) => {
    const last = segments[segments.length - 1];
    const contiguous = index > 0 && hours[index - 1].end === hour.start;
    if (last && contiguous && last.runwayMode === hour.runwayMode) last.to = index + 1;
    else segments.push({ runwayMode: hour.runwayMode, from: index, to: index + 1 });
  });
  return segments;
}

/**
 * The first later hour where `key` differs from the hour covering `now`.
 * Before the plan starts, this is the plan's first hour.
 */
export function nextChange(hours: PlanHour[], now: number, key: "runwayMode" | "arrivalRate"): PlanHour | null {
  const current = hours[currentHourIndex(hours, now)];
  return hours.find((hour) => hour.start > now && (!current || hour[key] !== current[key])) ?? null;
}
