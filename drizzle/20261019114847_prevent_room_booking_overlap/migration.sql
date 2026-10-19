-- Custom SQL migration file, put your code below! --
-- Required for GiST equality checks on integer room IDs.
CREATE EXTENSION IF NOT EXISTS btree_gist;

-- Reject invalid booking intervals.
ALTER TABLE "bookings"
ADD CONSTRAINT "bookings_valid_time"
CHECK ("start_time" < "end_time");

-- Prevent overlapping bookings for the same room.
ALTER TABLE "bookings"
ADD CONSTRAINT "bookings_no_room_overlap"
EXCLUDE USING gist (
  "room_id" WITH =,
  tsrange(
    "booking_date" + "start_time",
    "booking_date" + "end_time",
    '[)'
  ) WITH &&
)
WHERE ("status" <> 'cancelled');
