import { useSelector } from "react-redux";
import { useGetAllRoomsQuery } from "../../state/rooms/roomsApiSlice"
import type { RootState } from "../../state/store";
import { tableFeatures, useTable, type ColumnDef } from "@tanstack/react-table";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../ui/table";
import { Button } from "../ui/button";
import { useAddRoomMutation, useDeactivateRoomMutation, useUpdateRoomMutation } from "../../state/admin/adminApiSlice";
import { useState } from "react";

const features = tableFeatures({})

type rooms = {
    id: number,
    name: string,
    capacity: number,
    floor: number,
    facilities: string[], 
    is_active: boolean,
}

export const Rooms = () => {
    const [isAddOpen, setisAddOpen] = useState<boolean>(false)
    const token = useSelector((state: RootState) => state.auth.usertoken);
    const userRole = useSelector((state: RootState) => state.auth.role);
    const { data, isLoading, isError, error, refetch} = useGetAllRoomsQuery(undefined, { skip: !token })
    const [deactivateRoom] = useDeactivateRoomMutation()
    const [updateRoom] = useUpdateRoomMutation()
    const [addRoom] = useAddRoomMutation()

    const handleDelete = async (rowData: rooms) => {
        await deactivateRoom(rowData.id).unwrap()
        refetch();
    }   

    const handleUpdate = async (rowData: rooms) => {
        await updateRoom(rowData).unwrap()
        refetch();
    }

    const handleAdd = async () => {
        // const addRowData = {
        //     name: 'Gemba 1',
        //     capacity: 6,
        //     floor: 0,
        //     facilities: ['AC'],
        // }
        // await addRoom(addRowData)
        // refetch();
        const val = isAddOpen
        setisAddOpen(!val)
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
        {
            accessorKey: 'action_room',
            id: 'action_room',
            header: 'Action',
            cell: (info) => {
                return(<div className="flex gap-2">
                    <Button variant="outline" onClick={() => handleDelete(info.row.original)}>Deactivate</Button>
                    <Button variant="outline" onClick={() => handleUpdate(info.row.original)}>Update</Button>
                </div>)
            }
        }
    ]

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

    return(
        <div className="space-y-4">
            <div className="flex flex-row justify-between">
                <h2 className="text-xl font-semibold">
                    Meeting Rooms
                </h2>
                {userRole === "admin" ? <Button onClick={() => handleAdd()}>
                    Add+
                </Button> : null}
            </div>
            <div className="outline-2 rounded-lg">
                {rooms.length !== 0 ? <Table>
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
                </Table> : 
                <div className="p-5 text-center">
                    No rooms Available
                </div>
                }
            </div>
            <dialog open={isAddOpen} className="outline-2 fixed inset-0 m-auto rounded-lg p-10 z-50">
                <div>
                    this is a dialog box
                </div>
            </dialog>
        </div>
    )
}