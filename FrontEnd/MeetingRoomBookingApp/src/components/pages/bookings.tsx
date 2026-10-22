import { useSelector } from "react-redux"
import { useGetAllUserBookingsQuery } from "../../state/bookings/bookingsApiSlice"
import type { RootState } from "../../state/store"

export const Bookings = () => {
    const token = useSelector((state: RootState) => (state.auth.usertoken))
    const {data, isLoading, isError, error, refetch} = useGetAllUserBookingsQuery(undefined, {skip: !token})

    if(!token){
        return <div>Please login to view your bookings.</div>
    }

    if(isLoading){
        return <div></div>
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

    return(
        <div>
            {data?.data.map((booking) => (
                <div key={booking.id.toString()}>
                    <h2>{booking.room_id}</h2>
                    <h2>{booking.purpose}</h2>
                    <h2>{booking.start_time}</h2>
                    <h2>{booking.end_time}</h2>
                    <h2>{booking.status}</h2>
                </div>
            ))}
        </div>
    )
}