/**
 * Turns a Strava encoded polyline into an SVG path `d` string normalized into
 * a square viewBox.
 *
 * The whole pipeline runs at sync time and the result is persisted, so
 * rendering a run is a string interpolation. The raw polyline is persisted
 * alongside it, which makes retuning the constants below a DB-only backfill
 * (see /api/running/backfill) with zero Strava API calls.
 */

import { decodePolyline } from "./polyline";

/** Both viewBox dimensions. Paths are emitted in this coordinate space. */
export const ROUTE_VIEWBOX = 100;

/** Inset per side, as a fraction of the viewBox, so strokes don't clip. */
export const ROUTE_PADDING = 0.08;

/**
 * Ramer-Douglas-Peucker tolerance, in viewBox units — i.e. percent of the
 * tile. Applied *after* normalization so it is scale-free: a 2km loop and a
 * 42km point-to-point get the same visual fidelity. ~0.5px on a 128px tile.
 */
export const ROUTE_SIMPLIFY_TOLERANCE = 0.4;

/** Decimal places kept in the emitted path. */
export const ROUTE_COORD_PRECISION = 1;

/** Below this, a bounding box counts as a single point. */
const DEGENERATE_SPAN = 1e-9;

type Point = { x: number; y: number };

/**
 * Equirectangular projection about the route's own centroid latitude.
 *
 * Not Web Mercator: over the largest extent in this dataset (a ~42km
 * north-south marathon at 34°N) Mercator's sec(lat) scaling varies by ~0.46%
 * end to end, which is under a pixel on a 128px tile. Equirectangular is
 * exactly shape-correct at the centroid, needs no pole guard, and is three
 * lines.
 *
 * y is negated because SVG's y axis grows downward.
 */
function project(coords: Array<[number, number]>): Point[] {
  let latSum = 0;
  let lngSum = 0;
  for (let i = 0; i < coords.length; i++) {
    latSum += coords[i][0];
    lngSum += coords[i][1];
  }

  const lat0 = latSum / coords.length;
  const lng0 = lngSum / coords.length;
  const lngScale = Math.cos((lat0 * Math.PI) / 180);

  return coords.map(([lat, lng]) => ({
    x: (lng - lng0) * lngScale,
    y: -(lat - lat0),
  }));
}

/**
 * Fits points into a `size` x `size` box, scaling both axes by the same
 * factor so the route's aspect ratio survives — a point-to-point marathon
 * stays a long diagonal instead of being stretched to fill the square.
 */
function normalize(points: Point[], size: number, padding: number): Point[] {
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;

  for (let i = 0; i < points.length; i++) {
    const p = points[i];
    if (p.x < minX) minX = p.x;
    if (p.x > maxX) maxX = p.x;
    if (p.y < minY) minY = p.y;
    if (p.y > maxY) maxY = p.y;
  }

  const spanX = maxX - minX;
  const spanY = maxY - minY;
  const span = Math.max(spanX, spanY);
  const center = size / 2;

  // Every point identical (a stationary GPS trace): collapse to a centered
  // dot rather than dividing by ~zero.
  if (span < DEGENERATE_SPAN) {
    return points.map(() => ({ x: center, y: center }));
  }

  const inner = size * (1 - padding * 2);
  const scale = inner / span;

  // Centering offset: half the leftover space on each axis.
  const offsetX = center - ((minX + maxX) / 2) * scale;
  const offsetY = center - ((minY + maxY) / 2) * scale;

  return points.map((p) => ({
    x: p.x * scale + offsetX,
    y: p.y * scale + offsetY,
  }));
}

/** Perpendicular distance from `p` to the segment `a`-`b`. */
function perpendicularDistance(p: Point, a: Point, b: Point): number {
  const dx = b.x - a.x;
  const dy = b.y - a.y;

  if (dx === 0 && dy === 0) {
    return Math.hypot(p.x - a.x, p.y - a.y);
  }

  const t = ((p.x - a.x) * dx + (p.y - a.y) * dy) / (dx * dx + dy * dy);
  const clamped = Math.max(0, Math.min(1, t));

  return Math.hypot(p.x - (a.x + clamped * dx), p.y - (a.y + clamped * dy));
}

/**
 * Ramer-Douglas-Peucker. Iterative with an explicit stack rather than
 * recursive — inputs run to several hundred points and this avoids any risk
 * of blowing the call stack.
 */
function simplify(points: Point[], tolerance: number): Point[] {
  if (points.length <= 2) {
    return points;
  }

  const keep = new Array<boolean>(points.length).fill(false);
  keep[0] = true;
  keep[points.length - 1] = true;

  const stack: Array<[number, number]> = [[0, points.length - 1]];

  while (stack.length > 0) {
    const range = stack.pop() as [number, number];
    const first = range[0];
    const last = range[1];

    let maxDistance = 0;
    let farthest = -1;

    for (let i = first + 1; i < last; i++) {
      const distance = perpendicularDistance(
        points[i],
        points[first],
        points[last]
      );
      if (distance > maxDistance) {
        maxDistance = distance;
        farthest = i;
      }
    }

    if (maxDistance > tolerance && farthest !== -1) {
      keep[farthest] = true;
      stack.push([first, farthest]);
      stack.push([farthest, last]);
    }
  }

  return points.filter((_, i) => keep[i]);
}

/** Emits `M`/`L` absolute commands, dropping points that round to duplicates. */
function toPathD(points: Point[]): string {
  const round = (n: number) => {
    const fixed = n.toFixed(ROUTE_COORD_PRECISION);
    // Avoid "-0" and trailing ".0" noise in the persisted string.
    const parsed = parseFloat(fixed);
    return (parsed === 0 ? 0 : parsed).toString();
  };

  let d = "";
  let prevX: string | null = null;
  let prevY: string | null = null;

  for (let i = 0; i < points.length; i++) {
    const x = round(points[i].x);
    const y = round(points[i].y);

    if (x === prevX && y === prevY) {
      continue;
    }

    d += `${d === "" ? "M" : "L"}${x} ${y}`;
    prevX = x;
    prevY = y;
  }

  return d;
}

/**
 * Full pipeline: decode -> project -> normalize -> simplify -> emit.
 *
 * Normalization deliberately precedes simplification so the tolerance is
 * expressed in tile-percent rather than degrees.
 *
 * @returns The path `d`, or `null` if the polyline yields nothing drawable.
 */
export function polylineToPathD(encodedPolyline: string): string | null {
  const coords = decodePolyline(encodedPolyline);

  if (coords.length < 2) {
    return null;
  }

  const normalized = normalize(
    project(coords),
    ROUTE_VIEWBOX,
    ROUTE_PADDING
  );
  const simplified = simplify(normalized, ROUTE_SIMPLIFY_TOLERANCE);
  const d = toPathD(simplified);

  if (d === "") {
    return null;
  }

  // A route that collapsed to a single point still renders as a dot under
  // stroke-linecap="round", but needs an explicit second command to do so.
  if (!d.includes("L")) {
    const center = ROUTE_VIEWBOX / 2;
    return `M${center} ${center}L${center} ${center}`;
  }

  return d;
}
