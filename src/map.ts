// SVG drawing of the airport: runways, the runways in use (glow, chevrons and
// animated aircraft), runway labels, a wind indicator and a north arrow.
import { nothing, svg, type SVGTemplateResult } from "lit";
import { headingVector, type EndUsage, type Point, type Projection, type ProjectedEnd, type ProjectedRunway } from "./model";
import type { WindState } from "./wind";

export interface MapOptions {
  animate: boolean;
  showPlanes: boolean;
  /** No ATIS: runways are drawn dimmed and nothing is marked as in use. */
  dimmed: boolean;
  /** Runway usage changed in the latest broadcast: pulse the active runways. */
  runwayChanged: boolean;
  wind: WindState | null;
  windChanged: boolean;
}

// An aircraft pointing up (-y), about 24 units long, centred on the origin.
const PLANE =
  "M0,-12C1.4,-12 2,-10.4 2,-8.5L2,-3.2L11.5,2.3L11.5,4.7L2,2L2,7.2L5,9.6L5,11.5L0,10.2L-5,11.5L-5,9.6" +
  "L-2,7.2L-2,2L-11.5,4.7L-11.5,2.3L-2,-3.2L-2,-8.5C-2,-10.4 -1.4,-12 0,-12Z";

const fmt = (n: number) => n.toFixed(1);
const add = (p: Point, d: Point, k: number): Point => ({ x: p.x + d.x * k, y: p.y + d.y * k });
const angle = (d: Point) => (Math.atan2(d.y, d.x) * 180) / Math.PI;
const pathOf = (...points: Point[]) => points.map((p, i) => `${i ? "L" : "M"}${fmt(p.x)},${fmt(p.y)}`).join(" ");

function usageClass(usage: EndUsage | undefined): string {
  if (!usage) return "";
  if (usage.arrival && usage.departure) return "both";
  return usage.arrival ? "arr" : "dep";
}

function runwayUsage(runway: ProjectedRunway, usage: Map<string, EndUsage>): EndUsage | undefined {
  const merged = runway.ends.reduce<EndUsage | undefined>((acc, end) => {
    const u = usage.get(end.ident);
    if (!u) return acc;
    return { arrival: (acc?.arrival ?? false) || u.arrival, departure: (acc?.departure ?? false) || u.departure };
  }, undefined);
  return merged;
}

/** Chevrons along a path, flowing in the direction of travel. */
function chevrons(start: Point, direction: Point, count: number, spacing: number, kind: "arr" | "dep") {
  const rotation = angle(direction);
  return Array.from({ length: count }, (_, i) => {
    const p = add(start, direction, i * spacing);
    return svg`<path class="chevron ${kind}" style="animation-delay:${(i * 0.22).toFixed(2)}s"
      d="M-4,-5 L1.5,0 L-4,5" transform="translate(${fmt(p.x)} ${fmt(p.y)}) rotate(${fmt(rotation)})" />`;
  });
}

/** A plane icon, either flying a looping path or parked at a point. */
function plane(
  kind: "arr" | "dep",
  points: Point[],
  split: number,
  scales: [number, number, number],
  options: MapOptions,
  begin: number,
): SVGTemplateResult {
  const path = pathOf(...points);
  const lengths = points.slice(1).map((p, i) => Math.hypot(p.x - points[i].x, p.y - points[i].y));
  const total = lengths.reduce((a, b) => a + b, 0) || 1;
  const keyPoint = (lengths[0] / total).toFixed(3);
  const icon = svg`<path class="plane ${kind}" d=${PLANE} transform="rotate(90)" />`;

  if (!options.animate) {
    // Static: on the approach (arrivals) or the climb-out (departures).
    const at = kind === "arr" ? points[0] : points[points.length - 1];
    const towards = kind === "arr" ? points[1] : points[points.length - 2];
    const p = { x: at.x + (towards.x - at.x) * 0.45, y: at.y + (towards.y - at.y) * 0.45 };
    const dir = kind === "arr" ? { x: towards.x - at.x, y: towards.y - at.y } : { x: at.x - towards.x, y: at.y - towards.y };
    return svg`<g transform="translate(${fmt(p.x)} ${fmt(p.y)}) rotate(${fmt(angle(dir))}) scale(1.1)">${icon}</g>`;
  }

  const dur = "9s";
  return svg`<g opacity="0">
    <animateMotion dur=${dur} begin=${`${begin}s`} repeatCount="indefinite" rotate="auto"
      calcMode="linear" path=${path} keyPoints=${`0;${keyPoint};1`} keyTimes=${`0;${split};1`} />
    <animate attributeName="opacity" dur=${dur} begin=${`${begin}s`} repeatCount="indefinite"
      values="0;1;1;0" keyTimes="0;0.08;0.9;1" />
    <g>
      <animateTransform attributeName="transform" type="scale" dur=${dur} begin=${`${begin}s`}
        repeatCount="indefinite" values=${scales.join(";")} keyTimes=${`0;${split};1`} />
      ${icon}
    </g>
  </g>`;
}

function activeEnd(
  runway: ProjectedRunway,
  end: ProjectedEnd,
  usage: EndUsage,
  projection: Projection,
  options: MapOptions,
  index: number,
) {
  const out: SVGTemplateResult[] = [];
  const d = end.direction;
  const back = { x: -d.x, y: -d.y };
  const approach = projection.approachPx;
  const spacing = Math.max(approach / 7, 9);
  const farEnd = add(end.point, d, runway.lengthPx);

  if (usage.arrival) {
    // Chevrons from far out towards the threshold.
    const first = add(end.point, back, approach * 0.95);
    out.push(...chevrons(first, d, 6, spacing, "arr"));
    if (options.showPlanes) {
      out.push(
        plane(
          "arr",
          [add(end.point, back, approach), end.point, add(end.point, d, runway.lengthPx * 0.55)],
          0.62,
          [1.4, 0.85, 0.85],
          options,
          index * 2.3,
        ),
      );
    }
  }
  if (usage.departure) {
    // Chevrons beyond the far end, climbing out.
    const first = add(farEnd, d, 22);
    out.push(...chevrons(first, d, 6, spacing, "dep"));
    if (options.showPlanes) {
      out.push(
        plane(
          "dep",
          [end.point, add(end.point, d, runway.lengthPx * 0.7), add(farEnd, d, approach)],
          0.45,
          [0.85, 0.85, 1.4],
          options,
          index * 2.3 + 4.5,
        ),
      );
    }
  }
  return out;
}

function windIndicator(projection: Projection, wind: WindState | null, changed: boolean) {
  if (!wind) return nothing;
  const cx = projection.width - 30;
  const cy = 30;
  const label =
    wind.speed === 0
      ? "CALM"
      : `${wind.direction === null ? "VRB" : String(wind.direction).padStart(3, "0") + "°"}/${wind.speed}${
          wind.gust ? `G${wind.gust}` : ""
        }`;
  let arrow: SVGTemplateResult | typeof nothing = nothing;
  if (wind.speed > 0 && wind.direction !== null) {
    // Arrow points the way the wind blows (downwind).
    const v = headingVector(wind.direction + 180, projection.rotation);
    arrow = svg`<g transform="translate(${cx} ${cy}) rotate(${fmt(angle(v) + 90)})">
      <path class="wind-arrow" d="M0,-15 L6,-4 L2,-4 L2,15 L-2,15 L-2,-4 L-6,-4 Z" />
    </g>`;
  }
  return svg`<g class="wind ${changed ? "changed" : ""}">
    <circle cx=${cx} cy=${cy} r="21" class="wind-ring" />
    ${arrow}
    <text x=${cx} y=${cy + 34} class="wind-text">${label}${wind.speed ? svg`<tspan class="unit"> kt</tspan>` : ""}</text>
  </g>`;
}

function northArrow(projection: Projection) {
  if (!projection.rotation) return nothing;
  return svg`<g class="north" transform="translate(22 26) rotate(${-projection.rotation})">
    <path d="M0,-13 L5,5 L0,2 L-5,5 Z" />
    <text y="-16" transform="rotate(${projection.rotation} 0 -19)">N</text>
  </g>`;
}

export function renderMap(projection: Projection, usage: Map<string, EndUsage>, options: MapOptions): SVGTemplateResult {
  const active = options.dimmed ? new Map<string, EndUsage>() : usage;
  let animationIndex = 0;

  const glows = projection.runways.map((runway) => {
    const u = runwayUsage(runway, active);
    if (!u) return nothing;
    const [a, b] = runway.ends;
    return svg`<path class="glow ${usageClass(u)} ${options.runwayChanged ? "changed" : ""}"
      d=${pathOf(a.point, b.point)} stroke-width=${fmt(runway.widthPx + 10)} />`;
  });

  const runways = projection.runways.map((runway) => {
    const [a, b] = runway.ends;
    const hard = ["asphalt", "concrete", "unknown"].includes(runway.surface);
    return svg`<path class="runway ${runway.surface}" d=${pathOf(a.point, b.point)} stroke-width=${fmt(runway.widthPx)} />
      ${hard ? svg`<path class="centreline" d=${pathOf(add(a.point, a.direction, 6), add(b.point, b.direction, 6))} />` : nothing}`;
  });

  const traffic = projection.runways.flatMap((runway) =>
    runway.ends.flatMap((end) => {
      const u = active.get(end.ident);
      return u ? activeEnd(runway, end, u, projection, options, animationIndex++) : [];
    }),
  );

  const labels = projection.runways.flatMap((runway) =>
    runway.ends.map((end) => {
      const p = add(end.point, end.direction, -13);
      const kind = usageClass(active.get(end.ident));
      const w = end.ident.length * 7 + 8;
      return svg`<g class="label ${kind}" transform="translate(${fmt(p.x)} ${fmt(p.y)})">
        <rect x=${-w / 2} y="-8" width=${w} height="16" rx="4" />
        <text y="0.5">${end.ident}</text>
      </g>`;
    }),
  );

  return svg`<svg class="map ${options.dimmed ? "dimmed" : ""}" viewBox="0 0 ${projection.width} ${projection.height}"
      data-rotation=${projection.rotation} role="img" aria-hidden="true">
    <defs>
      <filter id="aac-glow" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="3.5" />
      </filter>
    </defs>
    <g class="glows">${glows}</g>
    <g class="runways">${runways}</g>
    <g class="traffic">${traffic}</g>
    <g class="labels">${labels}</g>
    ${windIndicator(projection, options.wind, options.windChanged)}
    ${northArrow(projection)}
  </svg>`;
}
