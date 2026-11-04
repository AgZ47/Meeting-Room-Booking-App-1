CREATE TYPE "status" AS ENUM('confirmed', 'cancelled', 'completed');--> statement-breakpoint
CREATE TYPE "facility" AS ENUM('TV', 'Projector', 'Video Conferencing system', 'WhiteBoard', 'Smart Board', 'AC', 'Sound Proof', 'Coffee Bar', 'Accessibility+');--> statement-breakpoint
CREATE TYPE "role" AS ENUM('admin', 'user');--> statement-breakpoint
CREATE TABLE "bookings" (
	"id" serial PRIMARY KEY,
	"room_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"booking_date" date NOT NULL,
	"start_time" time NOT NULL,
	"end_time" time NOT NULL,
	"purpose" varchar(255) NOT NULL,
	"status" "status" DEFAULT 'confirmed'::"status" NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "rooms" (
	"id" serial PRIMARY KEY,
	"name" varchar(100) NOT NULL,
	"capacity" integer NOT NULL,
	"floor" integer NOT NULL,
	"facilities" "facility"[] DEFAULT '{AC}'::"facility"[] NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	CONSTRAINT "rooms_capacity_positive" CHECK ("capacity" > 0)
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY,
	"name" varchar(100) NOT NULL,
	"email" varchar(255) NOT NULL UNIQUE,
	"password_hash" varchar(255) NOT NULL,
	"role" "role" DEFAULT 'user'::"role" NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_room_id_rooms_id_fkey" FOREIGN KEY ("room_id") REFERENCES "rooms"("id");--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id");