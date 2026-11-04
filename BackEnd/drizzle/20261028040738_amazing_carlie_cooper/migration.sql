CREATE INDEX "booking_user_id_idx" ON "bookings" ("user_id");--> statement-breakpoint
CREATE INDEX "booking_room_id_idx" ON "bookings" ("room_id");--> statement-breakpoint
CREATE INDEX "booking_room_date_idx" ON "bookings" ("room_id","booking_date");