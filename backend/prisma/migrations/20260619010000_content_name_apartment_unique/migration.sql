DROP INDEX IF EXISTS "contents_name_key";

CREATE UNIQUE INDEX "contents_name_apartmentId_key" ON "contents"("name", "apartment_id");
