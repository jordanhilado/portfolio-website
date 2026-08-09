/**
 * Strava API v3 access: token lifecycle and the activities endpoint.
 *
 * Token handling is DB-backed rather than env-only. Strava's docs state the
 * refresh token returned from an exchange may differ from the one sent; when
 * that happens an env-only design breaks silently and permanently, so
 * whatever comes back is persisted.
 */

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { STRAVA_ATHLETE_ID } from "@/constants/site";

const STRAVA_TOKEN_URL = "https://www.strava.com/oauth/token";
const STRAVA_API_BASE = "https://www.strava.com/api/v3";

/** Refresh this far before actual expiry, so a slow sync can't straddle it. */
const TOKEN_REFRESH_MARGIN_MS = 5 * 60 * 1000;

/**
 * Raised when Strava rejects our credentials, as opposed to a transport or
 * data problem. Callers map this to a distinct message so the admin UI can
 * say "reconnect Strava" rather than a generic failure.
 */
export class StravaAuthError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "StravaAuthError";
    this.status = status;
  }
}

const TokenResponseSchema = z.object({
  access_token: z.string(),
  refresh_token: z.string(),
  expires_at: z.number(),
  // Undocumented but returned in practice; used to catch a wrong-scoped token
  // before it gets cached. Optional so a change on Strava's side can't break us.
  scope: z.string().optional(),
});

/**
 * Discards the cached token pair so the next call re-seeds from
 * STRAVA_REFRESH_TOKEN.
 *
 * Without this, a bad token cached in the database outranks the environment
 * variable forever, and fixing .env would appear to do nothing.
 */
export async function clearStravaToken(): Promise<void> {
  await prisma.stravaToken.deleteMany({});
}

/**
 * The subset of Strava's SummaryActivity this feature reads.
 *
 * `map` and `trainer` are optional/nullable because Strava omits them for
 * some activity types; every field we actually depend on is validated.
 */
export const StravaActivitySchema = z.object({
  id: z.number(),
  name: z.string(),
  sport_type: z.string(),
  distance: z.number(),
  moving_time: z.number(),
  start_date_local: z.string(),
  trainer: z.boolean().optional(),
  map: z
    .object({ summary_polyline: z.string().nullable().optional() })
    .nullable()
    .optional(),
});

export type StravaActivity = z.infer<typeof StravaActivitySchema>;

/**
 * Returns a usable access token, refreshing and persisting it if needed.
 *
 * @throws {StravaAuthError} if Strava rejects the refresh.
 */
export async function getStravaAccessToken(): Promise<string> {
  const existing = await prisma.stravaToken.findFirst();

  if (
    existing &&
    existing.expiresAt.getTime() - Date.now() > TOKEN_REFRESH_MARGIN_MS
  ) {
    return existing.accessToken;
  }

  const clientId = process.env.STRAVA_CLIENT_ID;
  const clientSecret = process.env.STRAVA_CLIENT_SECRET;
  const refreshToken = existing?.refreshToken ?? process.env.STRAVA_REFRESH_TOKEN;

  if (!clientId || !clientSecret || !refreshToken) {
    throw new StravaAuthError(
      "Strava is not configured — set STRAVA_CLIENT_ID, STRAVA_CLIENT_SECRET and STRAVA_REFRESH_TOKEN.",
      500
    );
  }

  const response = await fetch(STRAVA_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    const body = await response.text();
    throw new StravaAuthError(
      `Strava token refresh failed (${response.status}). Re-run the OAuth flow with scope=activity:read_all and update STRAVA_REFRESH_TOKEN. ${body.slice(0, 200)}`,
      response.status
    );
  }

  const parsed = TokenResponseSchema.safeParse(await response.json());

  if (!parsed.success) {
    throw new StravaAuthError(
      "Strava returned an unrecognized token response.",
      502
    );
  }

  const token = parsed.data;

  // Reject a token that cannot read activities *before* caching it. The
  // refresh token shown on Strava's own API settings page is scoped `read`,
  // which refreshes successfully but returns an authorization error from every
  // activities request — so without this check the useless token gets stored
  // and then outranks any corrected STRAVA_REFRESH_TOKEN.
  if (token.scope !== undefined && token.scope.indexOf("activity:read") === -1) {
    throw new StravaAuthError(
      `Strava token is scoped "${token.scope}" and cannot read activities. Re-run the OAuth flow with scope=activity:read_all and update STRAVA_REFRESH_TOKEN.`,
      403
    );
  }

  const expiresAt = new Date(token.expires_at * 1000);

  // Persist whatever came back — the refresh token may have rotated.
  if (existing) {
    await prisma.stravaToken.update({
      where: { id: existing.id },
      data: {
        accessToken: token.access_token,
        refreshToken: token.refresh_token,
        expiresAt,
      },
    });
  } else {
    await prisma.stravaToken.create({
      data: {
        accessToken: token.access_token,
        refreshToken: token.refresh_token,
        expiresAt,
      },
    });
  }

  return token.access_token;
}

/**
 * Fetches one page of the authenticated athlete's activities.
 *
 * Returns the raw array; per-item validation is the caller's job so one
 * malformed activity can't void an entire page.
 */
export async function fetchAthleteActivityPage(
  accessToken: string,
  params: { page: number; perPage: number; after: number; before: number }
): Promise<unknown[]> {
  const query = new URLSearchParams({
    page: String(params.page),
    per_page: String(params.perPage),
    after: String(params.after),
    before: String(params.before),
  });

  const response = await fetch(
    `${STRAVA_API_BASE}/athlete/activities?${query.toString()}`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
      cache: "no-store",
    }
  );

  if (response.status === 401 || response.status === 403) {
    throw new StravaAuthError(
      "Strava rejected the access token. The most common cause is a token scoped `read` instead of `activity:read_all` — re-run the OAuth flow.",
      response.status
    );
  }

  if (!response.ok) {
    throw new Error(
      `Strava activities request failed: ${response.status} ${response.statusText}`
    );
  }

  // Surface remaining quota in logs; cheap and invaluable when debugging.
  const usage = response.headers.get("x-readratelimit-usage");
  const limit = response.headers.get("x-readratelimit-limit");
  if (usage && limit) {
    console.log(`Strava read rate limit: ${usage} of ${limit} (15min,daily)`);
  }

  const body = await response.json();

  if (!Array.isArray(body)) {
    throw new Error("Strava activities response was not an array.");
  }

  return body;
}

const AthleteStatsSchema = z.object({
  all_run_totals: z.object({
    count: z.number(),
    /** Metres. */
    distance: z.number(),
  }),
});

/** Lifetime run totals as Strava reports them. */
export type StravaRunTotals = {
  runs: number;
  meters: number;
};

/**
 * Fetches the athlete's all-time run totals.
 *
 * One request, unlike walking `/athlete/activities`, and it counts every run
 * on the account — including treadmill runs and any that carry no GPS trace,
 * which the run grid's sync deliberately drops. The blurb is a career total,
 * not a description of the tiles below it, so that wider count is the right
 * one.
 *
 * Cached for an hour rather than `no-store`: this feeds a statically rendered
 * page whose own revalidate window is the same, so a shorter TTL would only
 * spend quota on a number no reader would see change.
 */
export async function fetchAthleteRunTotals(
  accessToken: string
): Promise<StravaRunTotals> {
  const response = await fetch(
    `${STRAVA_API_BASE}/athletes/${STRAVA_ATHLETE_ID}/stats`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
      next: { revalidate: 3600 },
    }
  );

  if (response.status === 401 || response.status === 403) {
    throw new StravaAuthError(
      "Strava rejected the access token for the athlete stats endpoint.",
      response.status
    );
  }

  if (!response.ok) {
    throw new Error(
      `Strava athlete stats request failed: ${response.status} ${response.statusText}`
    );
  }

  const parsed = AthleteStatsSchema.safeParse(await response.json());

  if (!parsed.success) {
    throw new Error("Strava athlete stats response was not in the expected shape.");
  }

  return {
    runs: parsed.data.all_run_totals.count,
    meters: parsed.data.all_run_totals.distance,
  };
}
