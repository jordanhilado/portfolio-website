-- The Hobbies section was renamed to Running; the table follows.
--
-- Written to be idempotent because "HobbiesContent" was created outside this
-- migration history: existing databases get the rename, fresh ones get the
-- table created directly, and a database already renamed out-of-band is a
-- no-op.
DO $$
BEGIN
  IF to_regclass('public."HobbiesContent"') IS NOT NULL THEN
    ALTER TABLE "HobbiesContent" RENAME TO "RunningContent";
    ALTER TABLE "RunningContent"
      RENAME CONSTRAINT "HobbiesContent_pkey" TO "RunningContent_pkey";
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS "RunningContent" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RunningContent_pkey" PRIMARY KEY ("id")
);
