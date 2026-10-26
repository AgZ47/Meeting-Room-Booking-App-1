import { useSelector } from "react-redux";
import { useGetAllRoomsQuery } from "../../state/rooms/roomsApiSlice"
import type { RootState } from "../../state/store";
import { tableFeatures, useTable, type ColumnDef } from "@tanstack/react-table";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../ui/table";
import { Button } from "../ui/button";
import { useAddRoomMutation, useDeactivateRoomMutation, useUpdateRoomMutation } from "../../state/admin/adminApiSlice";
import { useState } from "react";
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card";
import { useForm } from "@tanstack/react-form";
import {z} from "zod"
import { Input } from "../ui/input";
import { Checkbox } from "../ui/checkbox";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { Label } from "../ui/label";

const features = tableFeatures({})

type rooms = {
    id: number,
    name: string,
    capacity: number,
    floor: number,
    facilities: string[], 
    is_active: boolean,
}

const availableFacilities = [
  "TV", 
  "Projector", 
  "Video Conferencing system", 
  "WhiteBoard", 
  "Smart Board", 
  "AC", 
  "Sound Proof", 
  "Coffee Bar", 
  "Accessibility+"
];

const addRoomSchema = z.object({
    name: z.string().trim().min(1).max(100),
    capacity: z.number().int().positive(),
    floor: z.number().int().min(0),
    facilities: z.array(z.string().trim().min(1)).default([]),
    is_active: z.boolean().default(true),
})

const updateRoomSchema = z.object({
    id: z.number().int().positive(),
    name: z.string().trim().min(1).max(100),
    capacity: z.number().int().positive(),
    floor: z.number().int().min(0),
    facilities: z.array(z.string().trim().min(1)).default([]),
})

export const Rooms = () => {
    const [isAddOpen, setisAddOpen] = useState<boolean>(false)
    const [isUpdateOpen, setisUpdateOpen] = useState<boolean>(false)
    const token = useSelector((state: RootState) => state.auth.usertoken);
    const userRole = useSelector((state: RootState) => state.auth.role);
    const { data, isLoading, isError, error, refetch} = useGetAllRoomsQuery(undefined, { skip: !token })
    const [deactivateRoom] = useDeactivateRoomMutation()
    const [updateRoom] = useUpdateRoomMutation()
    const [addRoom] = useAddRoomMutation()

    const rooms = data?.roomData ?? [];
    const sortedrooms = [...rooms].sort((a, b) => a.id - b.id)

    const roomAddForm = useForm({
        defaultValues: {
            name: '',
            capacity: 1,
            floor: 0,
            facilities: ["AC"] as string[],
            is_active: true,
        },
        onSubmit: async ({value}) => {
            await addRoom(addRoomSchema.parse(value))
            refetch();
            setisAddOpen(false)
            roomAddForm.reset()
        }
    })

    const roomUpdateForm = useForm({
        defaultValues: {
            id: 0,
            name: '',
            capacity: 1,
            floor: 0,
            facilities: ["AC"] as string[],
        },
        onSubmit: async ({value}) => {
            await updateRoom(updateRoomSchema.parse(value))
            refetch();
            setisUpdateOpen(false)
            roomUpdateForm.reset()
        }
    })

    const handleDelete = async (rowData: rooms) => {
        await deactivateRoom(rowData.id).unwrap()
        refetch();
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
                    <Button variant="outline" onClick={() => handleDelete(info.row.original)}>{info.row.original.is_active ? `Deactivate` : `Activate`}</Button>
                    <Button variant="outline" onClick={() => {
                        setisUpdateOpen(true)
                        roomUpdateForm.setFieldValue('id', info.row.original.id)
                        roomUpdateForm.setFieldValue('name', info.row.original.name)
                        roomUpdateForm.setFieldValue('floor', info.row.original.floor)
                        roomUpdateForm.setFieldValue('capacity', info.row.original.capacity)
                        roomUpdateForm.setFieldValue('facilities',info.row.original.facilities)
                        }}>Update</Button>
                </div>)
            }
        }
    ]

    const table = useTable({
        key: 'roomstable',
        features,
        columns,
        data: sortedrooms,
    })

    if(!token){
        return <div>Please login to view Rooms.</div>
    }

    if(isLoading){
        return(
            <div className="p-auto font-bold text-center">Loding...</div>
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
            <Card>
                <CardHeader>
                    <CardTitle>
                        Meeting Rooms
                    </CardTitle>
                    <CardDescription>
                        View all Meeting Rooms
                    </CardDescription>
                    <CardAction>
                        {userRole === "admin" ? <Button onClick={() => setisAddOpen(true)}>
                            Add Room+
                        </Button> : null}
                    </CardAction>
                </CardHeader>
                <CardContent>
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
                </CardContent>
            </Card>
            <dialog open={isAddOpen} className="fixed inset-0 size-full z-50 bg-slate-950/50">
                <div className="size-full flex justify-center items-center">
                    <Card className="w-3/5">
                        <CardHeader>
                            <CardTitle>
                                Add Rooms
                            </CardTitle>
                            <CardDescription>
                                Enter meeting room details to add
                            </CardDescription>
                            <CardAction>
                                <Button onClick={() => setisAddOpen(false)}>Cancel</Button>
                            </CardAction>
                        </CardHeader>
                        <CardContent>
                            <form id="roomAdd-form" onSubmit={(e) => {
                                e.preventDefault()
                                roomAddForm.handleSubmit()
                            }}>
                                <div className="flex flex-col gap-6">
                                    <div className="grid gap-2">
                                        <label htmlFor="name">Room Name</label>
                                        <roomAddForm.Field name="name">
                                            {(field) => (
                                            <Input className="w-2/5" value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} id="name" type="text" placeholder="Room Name" />
                                            )}
                                        </roomAddForm.Field>
                                    </div>
                                    <div className="grid gap-2">
                                        <label htmlFor="capacity">Room Capacity</label>
                                        <roomAddForm.Field name="capacity">
                                            {(field) => (
                                            <Input className="w-2/5" value={field.state.value} onChange={(e) => field.handleChange(Number(e.target.value))} id="capacity" type="number" placeholder="Room Capacity" />
                                            )}
                                        </roomAddForm.Field>
                                    </div>
                                    <div className="grid gap-2">
                                        <label htmlFor="floor">Floor</label>
                                        <roomAddForm.Field name="floor">
                                            {(field) => (
                                            <Input className="w-2/5" value={field.state.value} onChange={(e) => field.handleChange(Number(e.target.value))} id="floor" type="number" placeholder="Floor" />
                                            )}
                                        </roomAddForm.Field>
                                    </div>
                                    <div className="grid gap-2">
                                        <roomAddForm.Field name="facilities">
                                        {(field) => (
                                            <div className="space-y-3">
                                            <p className="font-medium">Facilities</p>

                                            {availableFacilities.map((facility) => (
                                                <label
                                                key={facility}
                                                className="flex items-center gap-2"
                                                >
                                                <Checkbox
                                                    id={facility}
                                                    checked={field.state.value.includes(facility)}
                                                    onCheckedChange={(checked) => {
                                                        if (checked) {
                                                        field.pushValue(facility);
                                                        } else {
                                                        const index = field.state.value.indexOf(facility);

                                                        if (index !== -1) {
                                                            field.removeValue(index);
                                                        }
                                                        }
                                                    }}
                                                />
                                                {facility}
                                                </label>
                                            ))}
                                            </div>
                                        )}
                                        </roomAddForm.Field>
                                    </div>
                                    <div className="grid gap-2">
                                        <label htmlFor="is_active">Status</label>
                                        <roomAddForm.Field name="is_active">
                                            {(field) => (
                                                <RadioGroup value={String(field.state.value)} onValueChange={(value) => field.handleChange(value === "true")}>
                                                    <RadioGroupItem value="true" id="active"/>
                                                    <Label htmlFor="active">Activate</Label>
                                                    <RadioGroupItem value="false" id="inactive"/>
                                                    <Label htmlFor="inactive">Deactivate</Label>
                                                </RadioGroup>
                                            )}
                                        </roomAddForm.Field>
                                    </div>
                                </div>
                            </form>
                        </CardContent>
                        <CardFooter>
                            <Button type="submit" form="roomAdd-form">Submit</Button>
                        </CardFooter>
                    </Card>
                </div>
            </dialog>
            <dialog open={isUpdateOpen} className="fixed inset-0 size-full z-50 bg-slate-950/50">
                <div className="size-full flex justify-center items-center">
                    <Card className="w-3/5">
                        <CardHeader>
                            <CardTitle>
                                Update Room
                            </CardTitle>
                            <CardDescription>
                                Enter meeting room details to add
                            </CardDescription>
                            <CardAction>
                                <Button onClick={() => {
                                    setisUpdateOpen(false)
                                    roomUpdateForm.reset()
                                    }}>Cancel</Button>
                            </CardAction>
                        </CardHeader>
                        <CardContent>
                            <form id="roomUpdate-form" onSubmit={(e) => {
                                e.preventDefault()
                                roomUpdateForm.handleSubmit()
                            }}>
                                <div className="flex flex-col gap-6">
                                    <div className="grid gap-2">
                                        <label htmlFor="name">Room Name</label>
                                        <roomUpdateForm.Field name="name">
                                            {(field) => (
                                            <Input className="w-2/5" value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} id="name" type="text" placeholder="Room Name" />
                                            )}
                                        </roomUpdateForm.Field>
                                    </div>
                                    <div className="grid gap-2">
                                        <label htmlFor="capacity">Room Capacity</label>
                                        <roomUpdateForm.Field name="capacity">
                                            {(field) => (
                                            <Input className="w-2/5" value={field.state.value} onChange={(e) => field.handleChange(Number(e.target.value))} id="capacity" type="number" placeholder="Room Capacity" />
                                            )}
                                        </roomUpdateForm.Field>
                                    </div>
                                    <div className="grid gap-2">
                                        <label htmlFor="floor">Floor</label>
                                        <roomUpdateForm.Field name="floor">
                                            {(field) => (
                                            <Input className="w-2/5" value={field.state.value} onChange={(e) => field.handleChange(Number(e.target.value))} id="floor" type="number" placeholder="Floor" />
                                            )}
                                        </roomUpdateForm.Field>
                                    </div>
                                    <div className="grid gap-2">
                                        <roomUpdateForm.Field name="facilities">
                                        {(field) => (
                                            <div className="space-y-3">
                                            <p className="font-medium">Facilities</p>

                                            {availableFacilities.map((facility) => (
                                                <label
                                                key={facility}
                                                className="flex items-center gap-2"
                                                >
                                                <Checkbox
                                                    id={facility}
                                                    checked={field.state.value.includes(facility)}
                                                    onCheckedChange={(checked) => {
                                                        if (checked) {
                                                        field.pushValue(facility);
                                                        } else {
                                                        const index = field.state.value.indexOf(facility);

                                                        if (index !== -1) {
                                                            field.removeValue(index);
                                                        }
                                                        }
                                                    }}
                                                />
                                                {facility}
                                                </label>
                                            ))}
                                            </div>
                                        )}
                                        </roomUpdateForm.Field>
                                    </div>
                                </div>
                            </form>
                        </CardContent>
                        <CardFooter>
                            <Button type="submit" form="roomUpdate-form">Submit</Button>
                        </CardFooter>
                    </Card>
                </div>
            </dialog>
        </div>
    )
}