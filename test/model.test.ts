import { describe, expect, it } from "vitest";
import {
  arrivalUpRotation,
  bundledLayout,
  endHeading,
  endUsage,
  findEnd,
  headingVector,
  normaliseRunway,
  project,
  resolveLayout,
  runwayList,
  toKnots,
  validLayout,
} from "../src/model";

// Shapes as exposed by the integration's `runways` attribute (YMML, trimmed).
const YMML = [
  {
    ident: "09/27",
    length: 2286,
    width: 45,
    surface: "asphalt",
    ends: [
      { ident: "09", latitude: -37.660801, longitude: 144.822006, heading: 90 },
      { ident: "27", latitude: -37.6623, longitude: 144.848007, heading: 270 },
    ],
  },
  {
    ident: "16/34",
    length: 3657,
    width: 60,
    surface: "asphalt",
    ends: [
      { ident: "16", latitude: -37.653198, longitude: 144.835007, heading: 160 },
      { ident: "34", latitude: -37.685799, longitude: 144.841003, heading: 340 },
    ],
  },
];

describe("runway IDs", () => {
  it.each([
    ["7", "07"],
    ["07", "07"],
    ["34 l", "34L"],
    [" 16R ", "16R"],
    [36, "36"],
    ["37", null],
    ["00", null],
    ["H09L", null],
    ["unknown", null],
    [null, null],
  ])("normalises %j to %j", (input, expected) => {
    expect(normaliseRunway(input)).toBe(expected);
  });

  it("reads list attributes and comma-separated states", () => {
    expect(runwayList(["34L", "34R", "34L"])).toEqual(["34L", "34R"]);
    expect(runwayList("01L, 01R")).toEqual(["01L", "01R"]);
    expect(runwayList("unknown")).toEqual([]);
    expect(runwayList(undefined)).toEqual([]);
  });
});

describe("layouts", () => {
  it("keeps drawable runways and drops helipads and broken entries", () => {
    const layout = validLayout([
      ...YMML,
      { ident: "H09L/H27R", ends: [{ ident: "H09L", latitude: 1, longitude: 1 }, { ident: "H27R", latitude: 1, longitude: 2 }] },
      { ident: "05/23", ends: [{ ident: "05", latitude: 1, longitude: 1 }] },
      "rubbish",
    ]);
    expect(layout.map((r) => r.ident)).toEqual(["09/27", "16/34"]);
  });

  it("prefers the integration's layout and falls back to the bundled one", () => {
    expect(resolveLayout(YMML, "ymml").source).toBe("integration");
    const fallback = resolveLayout(undefined, "ymml");
    expect(fallback.source).toBe("bundled");
    expect(fallback.runways.map((r) => r.ident)).toEqual(["09/27", "16/34"]);
    expect(resolveLayout([], "zzzz")).toEqual({ runways: [], source: "none" });
  });

  it("bundles a layout for every airport the integration offers", () => {
    const airports =
      "YSSY YMML YBBN YPPH YPAD YSCB YMHB YPDN YBCG YBCS YBTL YBSU YBMK YBRK YMLT YMAV YMEN YWLM YBAS YPKA YPPD YPLM " +
      "YAMB YBOK YCIN YGIG YMES YMPC YPEA YPED YPTN YPWR YBSG YSNW YSRI";
    for (const icao of airports.split(" ")) expect(bundledLayout(icao).length, icao).toBeGreaterThan(0);
  });
});

describe("runways in use", () => {
  const sydney = bundledLayout("YSSY");

  it("matches exact IDs, and a lone number to a single suffixed end", () => {
    expect(findEnd(sydney, "34L")).toBe("34L");
    expect(findEnd(sydney, "25")).toBe("25");
    expect(findEnd(sydney, "34")).toBeNull(); // ambiguous: 34L or 34R
    expect(findEnd(validLayout(YMML), "16L")).toBe("16");
  });

  it("marks split arrival and departure runways (YMML: 16 ARR, 27 DEP)", () => {
    const { usage, unmatched } = endUsage(validLayout(YMML), ["16"], ["27"]);
    expect(Object.fromEntries(usage)).toEqual({
      "16": { arrival: true, departure: false },
      "27": { arrival: false, departure: true },
    });
    expect(unmatched).toEqual([]);
  });

  it("marks parallel runways used for both, and lists runways not on the map", () => {
    const { usage, unmatched } = endUsage(sydney, ["34L", "34R"], ["34L", "34R", "05"]);
    expect(usage.get("34L")).toEqual({ arrival: true, departure: true });
    expect(usage.get("34R")).toEqual({ arrival: true, departure: true });
    expect(unmatched).toEqual(["05"]);
  });
});

describe("units", () => {
  it("converts Home Assistant wind units back to knots", () => {
    expect(toKnots("10", "kn")).toBe(10);
    expect(toKnots("18.52", "km/h")).toBe(10);
    expect(toKnots(5.14, "m/s")).toBe(10);
    expect(toKnots("11.5", "mph")).toBe(10);
    expect(toKnots("12", undefined)).toBe(12);
    expect(toKnots("unknown", "kn")).toBeNull();
  });
});

describe("projection", () => {
  const layout = validLayout(YMML);

  it("computes headings of travel for each end", () => {
    expect(endHeading(layout[1], 0)).toBeCloseTo(172, 0); // 16, true heading
    expect(endHeading(layout[1], 1)).toBeCloseTo(352, 0); // 34
    expect(endHeading(layout[0], 1)).toBeCloseTo(274, 0); // 27
  });

  it("fits every runway inside the view box with room for approaches", () => {
    const p = project(layout, 400);
    expect(p.height).toBeGreaterThanOrEqual(220);
    expect(p.height).toBeLessThanOrEqual(400);
    for (const runway of p.runways) {
      for (const end of runway.ends) {
        for (const k of [-1, 1]) {
          const x = end.point.x + end.direction.x * p.approachPx * k;
          const y = end.point.y + end.direction.y * p.approachPx * k;
          expect(x).toBeGreaterThanOrEqual(-0.5);
          expect(x).toBeLessThanOrEqual(400.5);
          expect(y).toBeGreaterThanOrEqual(-0.5);
          expect(y).toBeLessThanOrEqual(p.height + 0.5);
        }
      }
    }
  });

  it("draws north up: runway 16 travels down the screen", () => {
    const end16 = project(layout).runways[1].ends[0];
    expect(end16.direction.y).toBeGreaterThan(0.95);
  });

  it("rotates so the arrival runway points up", () => {
    const rotation = arrivalUpRotation(layout, ["16"]);
    expect(rotation).toBe(172);
    const end16 = project(layout, 400, rotation).runways[1].ends[0];
    expect(end16.direction.y).toBeCloseTo(-1, 2);
    expect(arrivalUpRotation(layout, [])).toBe(0);
  });

  it("turns compass headings into screen directions", () => {
    const east = headingVector(90);
    expect(east.x).toBeCloseTo(1);
    expect(east.y).toBeCloseTo(0);
    const rotated = headingVector(90, 90); // map rotated so east is up
    expect(rotated.y).toBeCloseTo(-1);
  });
});
