import { useSelector } from "react-redux";
import { useGetBookingsQuery } from "../../state/admin/adminApiSlice";
import type { RootState } from "../../state/store";

export const AdminBookings = () => {
  const token = useSelector((state: RootState) => state.auth.usertoken);
  const { data, isLoading, isError, error, refetch} = useGetBookingsQuery(undefined, { skip: !token });

  if (!token) {
    return <p>Please log in to view bookings.</p>;
  }

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (isError) {
    return (
      <div>
        <p>Failed to load bookings.</p>
        <pre>{JSON.stringify(error, null, 2)}</pre>
        <button onClick={() => refetch()}>Try again</button>
      </div>
    );
  }

  const bookings = data?.bookingData ?? [];

  if (bookings.length === 0) {
    return <p>No bookings found.</p>;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">All Bookings</h2>

      <div className="space-y-3">
        {bookings.map((booking) => (
          <div key={booking.id} className="space-y-2 rounded-lg border p-4">
            <div className="flex justify-between gap-4">
              <h3 className="font-medium">
                Booking ID.{booking.id}
              </h3>
              <span className="capitalize">{booking.status}</span>
            </div>

            <p>Room ID: {booking.room_id}</p>
            <p>User ID: {booking.user_id}</p>
            <p>Date: {booking.booking_date}</p>
            <p>
              Time: {booking.start_time} - {booking.end_time}
            </p>
            <p>Purpose: {booking.purpose}</p>
            <p className="text-sm text-muted-foreground">
              Created: {booking.created_at}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};