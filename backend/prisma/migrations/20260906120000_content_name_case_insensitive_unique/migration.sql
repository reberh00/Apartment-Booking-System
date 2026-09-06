-- Prevent two contents in the same scope (global, or the same apartment)
-- from differing only by case, e.g. "PS5" vs "ps5". We store a normalized
-- (trimmed, lower-cased) copy of the name and enforce uniqueness on that
-- instead of the raw "name" column.

-- 1. Add the column as nullable first so it can be backfilled.
ALTER TABLE "contents" ADD COLUMN "name_normalized" TEXT;

-- 2. Backfill existing rows.
UPDATE "contents" SET "name_normalized" = lower(trim("name"));

-- 3. Now that every row has a value, make it required.
ALTER TABLE "contents" ALTER COLUMN "name_normalized" SET NOT NULL;

-- 4. Swap the old case-sensitive unique constraint for a case-insensitive one.
DROP INDEX IF EXISTS "contents_name_apartment_id_key";

CREATE UNIQUE INDEX "contents_name_normalized_apartment_id_key" ON "contents"("name_normalized", "apartment_id");
