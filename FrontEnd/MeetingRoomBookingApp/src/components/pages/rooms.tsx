import { useSelector } from "react-redux";
import { useGetAllRoomsQuery } from "../../state/rooms/roomsApiSlice"
import type { RootState } from "../../state/store";
import { tableFeatures, useTable, type ColumnDef } from "@tanstack/react-table";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../ui/table";

const features = tableFeatures({})

type rooms = {
    id: number,
    name: string,
    capacity: number,
    floor: number,
    facilities: string[], 
    is_active: boolean,
}

const columns: Array<ColumnDef<typeof features, rooms>> = [
    {
        accessorKey: 'id',
        id: 'id',
        header:'ID',
        cell: (info) => info.getValue()
    },
    {
        accessorKey: 'name',
        id: 'name',
        header:'Name',
        cell: (info) => info.getValue()
    },
    {
        accessorKey: 'capacity',
        id: 'capacity',
        header:'Capacity',
        cell: (info) => info.getValue()
    },
    {
        accessorKey: 'floor',
        id: 'floor',
        header:'Floor',
        cell: (info) => info.getValue()
    },
    {
        accessorKey: 'facilities',
        id: 'facilities',
        header:'Facilities',
        cell: (info) => {
            return(
                <div className="flex flex-row gap-2">
                    {info.getValue<string[]>().map((facility) => (
                        <div key={facility} className="text-center">
                            {facility},
                        </div>
                    ))}
                </div>
            )
        }
    },
    {
        accessorKey: 'is_active',
        id: 'is_active',
        header:'Status',
        cell: (info) => {
            if(info.getValue() === true){
                return <div className="outline-2 outline-green-500 rounded-md text-center">Active</div>
            }
            if(info.getValue() === false){
                return <div className="outline-2 outline-red-500 rounded-md text-center">Deactivated</div>
            }
        }
    },
]

export const Rooms = () => {
    const token = useSelector((state: RootState) => state.auth.usertoken);
    const { data, isLoading, isError, error, refetch} = useGetAllRoomsQuery(undefined, { skip: !token })

    const rooms = data?.roomData ?? [];

    const table = useTable({
        key: 'roomstable',
        features,
        columns,
        data: rooms,
    })

    if(!token){
        return <div>Please login to view Rooms.</div>
    }

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

    if(rooms.length === 0){
        return <p>No Rooms available</p>
    }

    return(
        <div className="space-y-4">
            <h2 className="text-xl font-semibold">
                Meeting Rooms
            </h2>
            <div className="outline-2 rounded-lg">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => (
                                    <TableCell key={header.id}>
                                        {header.isPlaceholder ? null : (
                                            <table.FlexRender header={header}/>
                                        )}
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows.map((row) => (
                        <TableRow key={row.id}>
                            {row.getAllCells().map((cell) => (
                                <TableCell key={cell.id}>
                                    <table.FlexRender cell={cell} />
                                </TableCell>
                            ))}
                        </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}