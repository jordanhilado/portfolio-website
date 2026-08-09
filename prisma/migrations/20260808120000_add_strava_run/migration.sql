-- Strava-synced runs plus the OAuth token cache.
--
-- Written idempotently to match the rest of this migration history, parts of
-- which were created out-of-band: a database that already has these tables
-- (e.g. from a `prisma db push` during development) is a no-op.
CREATE TABLE IF NOT EXISTS "StravaRun" (
    "id" TEXT NOT NULL,
    "stravaId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sportType" TEXT NOT NULL,
    "startDateLocal" TIMESTAMP(3) NOT NULL,
    "distanceMeters" DOUBLE PRECISION NOT NULL,
    "movingTime" INTEGER NOT NULL,
    "polyline" TEXT NOT NULL,
    "pathD" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StravaRun_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "StravaRun_stravaId_key" ON "StravaRun"("stravaId");

CREATE INDEX IF NOT EXISTS "StravaRun_startDateLocal_idx" ON "StravaRun"("startDateLocal");

CREATE TABLE IF NOT EXISTS "StravaToken" (
    "id" TEXT NOT NULL,
    "accessToken" TEXT NOT NULL,
    "refreshToken" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StravaToken_pkey" PRIMARY KEY ("id")
);
