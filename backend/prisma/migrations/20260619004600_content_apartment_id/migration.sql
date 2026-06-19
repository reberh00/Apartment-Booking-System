ALTER TABLE "contents" ADD COLUMN "apartment_id" TEXT;

ALTER TABLE "contents" ADD CONSTRAINT "contents_apartment_id_fkey" FOREIGN KEY ("apartment_id") REFERENCES "apartments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE INDEX "contents_apartment_id_idx" ON "contents"("apartment_id");