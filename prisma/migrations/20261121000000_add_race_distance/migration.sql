-- Races are listed in tabs by distance on the Running page.
CREATE TYPE "RaceDistance" AS ENUM ('FIVE_K', 'HALF_MARATHON', 'MARATHON');

-- Every race before the 5Ks was a marathon, so the default backfills them;
-- the two 5Ks are corrected by slug. The default is then dropped so a new race
-- has to say what it is rather than silently landing under Marathon.
ALTER TABLE "Race" ADD COLUMN "distance" "RaceDistance" NOT NULL DEFAULT 'MARATHON';

UPDATE "Race" SET "distance" = 'FIVE_K'
WHERE "slug" IN ('lululemon-run-with-the-roses-5k-2026', 'city-of-artesia-5k-2026');

ALTER TABLE "Race" ALTER COLUMN "distance" DROP DEFAULT;
