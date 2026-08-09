/**
 * Decoder for Google's encoded polyline format, which Strava uses for
 * `map.summary_polyline`.
 *
 * Hand-rolled rather than pulled from `@mapbox/polyline`: the algorithm is
 * ~25 stable lines, and the package is CJS with types in a separate
 * `@types/mapbox__polyline` install.
 */

/**
 * Decodes an encoded polyline into `[lat, lng]` pairs.
 *
 * Returns an empty array for empty or malformed input rather than throwing —
 * callers treat "no drawable points" as a skip, not an error.
 *
 * @param encoded Encoded polyline string.
 * @param precision Coordinate precision. Strava's summary_polyline uses 5.
 */
export function decodePolyline(
  encoded: string,
  precision = 5
): Array<[number, number]> {
  if (!encoded) {
    return [];
  }

  const factor = Math.pow(10, precision);
  const points: Array<[number, number]> = [];

  let index = 0;
  let lat = 0;
  let lng = 0;

  while (index < encoded.length) {
    let result = 1;
    let shift = 0;
    let b: number;

    // Latitude delta.
    do {
      b = encoded.charCodeAt(index++) - 63 - 1;
      result += b << shift;
      shift += 5;
    } while (b >= 0x1f && index < encoded.length);
    lat += result & 1 ? ~(result >> 1) : result >> 1;

    result = 1;
    shift = 0;

    // Longitude delta.
    do {
      b = encoded.charCodeAt(index++) - 63 - 1;
      result += b << shift;
      shift += 5;
    } while (b >= 0x1f && index < encoded.length);
    lng += result & 1 ? ~(result >> 1) : result >> 1;

    const decodedLat = lat / factor;
    const decodedLng = lng / factor;

    // Guard against truncated input decoding into nonsense coordinates.
    if (
      Number.isFinite(decodedLat) &&
      Number.isFinite(decodedLng) &&
      Math.abs(decodedLat) <= 90 &&
      Math.abs(decodedLng) <= 180
    ) {
      points.push([decodedLat, decodedLng]);
    }
  }

  return points;
}
