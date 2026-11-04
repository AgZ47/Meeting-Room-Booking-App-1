CREATE TABLE "facilities" (
	"id" serial PRIMARY KEY,
	"name" varchar(100) NOT NULL UNIQUE
);
--> statement-breakpoint
CREATE TABLE "room_facilities" (
	"room_id" integer,
	"facility_id" integer,
	CONSTRAINT "room_facilities_pkey" PRIMARY KEY("room_id","facility_id")
);
--> statement-breakpoint
ALTER TABLE "rooms" DROP COLUMN "facilities";--> statement-breakpoint
ALTER TABLE "room_facilities" ADD CONSTRAINT "room_facilities_room_id_rooms_id_fkey" FOREIGN KEY ("room_id") REFERENCES "rooms"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "room_facilities" ADD CONSTRAINT "room_facilities_facility_id_facilities_id_fkey" FOREIGN KEY ("facility_id") REFERENCES "facilities"("id") ON DELETE CASCADE;--> statement-breakpoint
DROP TYPE "facility";