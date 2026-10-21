import { useGetAllRoomsQuery } from "../../state/rooms/roomsApiSlice"

export const Rooms = () => {
    const { data, isLoading, isError, error, refetch} = useGetAllRoomsQuery()

    if(isLoading){
        return(
            <div>Loding...</div>
        )
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

    const rooms = data?.roomData ?? [];

    if(rooms.length === 0){
        return <p>No Rooms available</p>
    }

    return(
        <div>
            {rooms.map((room) => (
            <div key={room.id} className="space-y-2 rounded-lg border p-4">
                <div className="flex justify-between gap-4">
                <h3 className="font-medium">
                    room ID.{room.id}
                </h3>
                <span className="capitalize">{room.is_active}</span>
                </div>

                <p className="flex flex-row gap-4">Facilities: {room.facilities.map((facility) => (
                    <p>{facility}</p>
                ))}</p>
                <p>Capacity: {room.capacity}</p>
                <p>Floor: {room.floor}</p>
                <p>Name: {room.name}</p>
            </div>
            ))}
        </div>
    )
}