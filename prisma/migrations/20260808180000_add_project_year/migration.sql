-- Year a project was built, shown in the corner of its card on the landing page.
--
-- Written idempotently to match the rest of this migration history, parts of
-- which were created out-of-band: a database that already has this column
-- (e.g. from a `prisma db push` during development) is a no-op.
--
-- Added nullable, backfilled, then made NOT NULL — a bare NOT NULL column
-- cannot be added to a table that already has rows without a default, and a
-- default here would quietly bake a wrong year into every future insert.
ALTER TABLE "Project" ADD COLUMN IF NOT EXISTS "year" INTEGER;

-- Placeholder backfill: existing rows have no recorded build year, so they
-- inherit the year their row was created. That is when the project was entered
-- here, not necessarily when it was built — these are meant to be corrected by
-- hand in the admin dashboard.
UPDATE "Project" SET "year" = EXTRACT(YEAR FROM "createdAt")::INTEGER WHERE "year" IS NULL;

ALTER TABLE "Project" ALTER COLUMN "year" SET NOT NULL;
