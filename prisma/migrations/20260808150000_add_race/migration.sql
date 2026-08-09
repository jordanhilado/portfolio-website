-- Races shown above the run grid on the landing page.
--
-- Written idempotently to match the rest of this migration history, parts of
-- which were created out-of-band: a database that already has this table
-- (e.g. from a `prisma db push` during development) is a no-op.
CREATE TABLE IF NOT EXISTS "Race" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "timeSeconds" INTEGER NOT NULL,
    "paceSecondsPerMile" INTEGER NOT NULL,
    "elevationFeet" INTEGER NOT NULL,
    "ageGroupRank" INTEGER NOT NULL,
    "ageGroupTotal" INTEGER NOT NULL,
    "ageGroup" TEXT NOT NULL,
    "imageUrl" TEXT,
    "resultsUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Race_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "Race_slug_key" ON "Race"("slug");

CREATE INDEX IF NOT EXISTS "Race_date_idx" ON "Race"("date");
