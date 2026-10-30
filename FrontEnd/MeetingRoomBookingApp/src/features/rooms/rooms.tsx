import { useSelector } from "react-redux";
import { useGetAllRoomsQuery } from "./api/roomsApiSlice"
import type { RootState } from "../../common/store";
import { tableFeatures, useTable, type CellContext, type ColumnDef, columnVisibilityFeature } from "@tanstack/react-table";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../common/ui/table";
import { Button } from "../../common/ui/button";
import { useAddRoomMutation, useDeactivateRoomMutation, useUpdateRoomMutation } from "../adminBookings/api/adminApiSlice";
import { useState } from "react";
import { Card, CardContent,CardFooter} from "../../common/ui/card";
import { useForm } from "@tanstack/react-form";
import {z} from "zod"
import { Input } from "../../common/ui/input";
import { Checkbox } from "../../common/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "../../common/ui/radio-group";
import { Field, FieldDescription, FieldLabel } from "../../common/ui/field";
import { CircleCheck, Plus, ShieldCheck, ShieldX, SquarePen } from "lucide-react";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "../../common/ui/hover-card";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "../../common/ui/dialog";

const features = tableFeatures({
    columnVisibilityFeature,
})

type modal = "addRoom" | "updateRoom" | "editFacilities" | null

type rooms = {
    id: number,
    name: string,
    capacity: number,
    floor: number,
    facilities: string[], 
    is_active: boolean,
}

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
    const [activeModal, setActiveModal] = useState<modal>(null)
    const token = useSelector((state: RootState) => state.auth.usertoken);
    const userRole = useSelector((state: RootState) => state.auth.role);
    const { data, isLoading, isError, refetch} = useGetAllRoomsQuery(undefined, { skip: !token })
    const [deactivateRoom] = useDeactivateRoomMutation()
    const [updateRoom] = useUpdateRoomMutation()
    const [addRoom] = useAddRoomMutation()

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
            roomUpdateForm.reset()
        }
    })

    const facilityAddForm = useForm({
        defaultValues: {
            name: "",   
        },
        onSubmit: async ({ value }) => {
            // await onSubmitFacility(value);
            console.log(value);
            facilityAddForm.reset();
        },
    });

    const handleDelete = async (rowData: rooms) => {
        await deactivateRoom(rowData.id).unwrap()
        refetch();
    }   

    const columns: Array<ColumnDef<typeof features, rooms>> = [
    {
        accessorKey: "id",
        header: "ID",
    },
    {
        accessorKey: "name",
        id: "name",
        header: "Room",
        cell: (info) => (
        <span className="font-semibold text-foreground">
            {info.getValue<string>()}
        </span>
        ),
    },
    {
        accessorKey: "capacity",
        id: "capacity",
        header: "Capacity",
        cell: (info) => (
        <span className="tabular-nums">
            {info.getValue<number>()} people
        </span>
        ),
    },
    {
        accessorKey: "floor",
        id: "floor",
        header: "Floor",
        cell: (info) => (
        <span className="text-muted-foreground">
            Floor {info.getValue<number>()}
        </span>
        ),
    },
    {
        accessorKey: "facilities",
        id: "facilities",
        header: "Facilities",
        cell: (info) => {
        const facilities = info.getValue<string[]>();

        return (
            <div className="flex flex-wrap gap-1.5">
            {facilities.length ? (
                facilities.map((facility) => (
                <span
                    key={facility}
                    className="inline-flex rounded-md border bg-muted/40 px-2 py-1 text-xs font-medium"
                >
                    {facility}
                </span>
                ))
            ) : (
                <span className="text-sm text-muted-foreground">
                None
                </span>
            )}
            </div>
        );
        },
    },
    {
        accessorKey: "is_active",
        id: "is_active",
        header: "Status",
        cell: (info) => {
        const active = info.getValue<boolean>();

        return (
            <span
            className={`inline-flex items-center gap-2 rounded-full p-1 text-xs outline-1 justify-between ${
                active
                ? " bg-green-100 text-green-700 font-bold outline-green-700"
                : " bg-red-100 text-red-700 font-bold outline-red-700"
            }`}
            >
            <CircleCheck size="16"/>
            {active ? "Active" : "Deactivated"}
            </span>
        );
        },
    },
    ...(userRole === "admin"
        ? [
            {
            accessorKey: "action_room",
            id: "action_room",
            header: "Actions",
            cell: (info: CellContext<typeof features, rooms, unknown>) => {
                const room = info.row.original;

                return (
                <div className="flex flex-wrap items-center gap-2">
                    <HoverCard>
                        <HoverCardTrigger delay={100} closeDelay={100} render={
                            <button
                                className={`flex h-8 w-8 items-center justify-center rounded-full transition-colors ${
                                room.is_active 
                                    ? "text-red-500 hover:bg-red-50 hover:text-red-700" 
                                    : "text-green-500 hover:bg-green-50 hover:text-green-700"
                                }`}
                                onClick={() => handleDelete(room)}
                            >
                                {room.is_active ? <ShieldX className="size-5" /> : <ShieldCheck className="size-5" />}
                            </button>
                        }/>
                        <HoverCardContent side="top" className="mid-w-xs">
                            {room.is_active ? <div>Deactivate room</div> : <div>Activate room</div>}
                        </HoverCardContent>
                    </HoverCard>
                    <HoverCard>
                        <HoverCardTrigger delay={100} closeDelay={100} render={
                            <DialogTrigger>
                                <button
                                    className="flex h-8 w-8 items-center justify-center rounded-md text-slate-500 transition-colors hover:bg-slate-100 hover:text-sky-600"
                                    onClick={() => {
                                    setActiveModal("updateRoom")
                                    roomUpdateForm.setFieldValue("id", room.id);
                                    roomUpdateForm.setFieldValue("name", room.name);
                                    roomUpdateForm.setFieldValue("floor", room.floor);
                                    roomUpdateForm.setFieldValue("capacity", room.capacity);
                                    roomUpdateForm.setFieldValue("facilities", room.facilities);
                                    }}
                                >
                                    <SquarePen className="size-5" />
                                </button>
                            </DialogTrigger>
                        }/>
                        <HoverCardContent side="top">
                            <div>
                                Edit details
                            </div>
                        </HoverCardContent>
                    </HoverCard>
                </div>
                );
            },
            },
        ]
        : []),
    ];

    const table = useTable({
        key: "roomstable",
        features,
        columns,
        data: sortedrooms,
        initialState: {
        columnVisibility: {
                id: false,
            },
        },
    });

    if (!token) {
    return (
        <div className="mx-auto mt-12 max-w-md rounded-xl border p-8 text-center">
        <h2 className="text-lg font-semibold">Login required</h2>
        <p className="mt-2 text-sm text-muted-foreground">
            Please log in to view meeting rooms.
        </p>
        </div>
    );
    }

    if (isLoading) {
    return (
        <div className="mx-auto flex min-h-64 items-center justify-center">
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <span className="size-5 animate-spin rounded-full border-2 border-foreground/20 border-t-foreground" />
            Loading meeting rooms...
        </div>
        </div>
    );
    }

    if (isError) {
    return (
        <div className="mx-auto max-w-2xl rounded-xl border p-8 text-center">
        <h2 className="font-semibold">Unable to load rooms</h2>
        <p className="mt-2 text-sm text-muted-foreground">
            Something went wrong while retrieving the room list.
        </p>
        <Button className="mt-5" variant="outline" onClick={() => refetch()}>
            Try again
        </Button>
        </div>
    );
    }

    return (
    <Dialog>
    <div className="mx-auto w-full space-y-6 p-4 sm:p-6">
        {/* Page heading */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                Workspace / Resources
                </p>
                <h1 className="text-3xl font-semibold tracking-tight">
                Meeting rooms
                </h1>
            </div>
                {userRole === "admin" && (
                    <DialogTrigger render={
                        <div className="flex flex-row gap-2">
                            <Button className="w-full sm:w-auto bg-[#135893] text-white hover:bg-[#174875]" onClick={() => setActiveModal("editFacilities")}>
                                <Plus/>
                                Add facilities
                            </Button>    
                            <Button className="w-full sm:w-auto bg-[#135893] text-white hover:bg-[#174875]" onClick={() => setActiveModal("addRoom")}>
                                <Plus/>
                                Add room
                            </Button>
                        </div>
                    }/>
                )}
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="gap-2 py-5">
            <CardContent className="space-y-1">
            <p className="text-sm text-muted-foreground">Total rooms</p>
            <p className="text-3xl font-semibold tabular-nums">
                {rooms.length}
            </p>
            </CardContent>
        </Card>

        <Card className="gap-2 py-5">
            <CardContent className="space-y-1">
            <p className="text-sm text-muted-foreground">Active rooms</p>
            <p className="text-3xl font-semibold tabular-nums">
                {rooms.filter((room) => room.is_active).length}
            </p>
            </CardContent>
        </Card>

        <Card className="gap-2 py-5">
            <CardContent className="space-y-1">
            <p className="text-sm text-muted-foreground">Deactivated rooms</p>
            <p className="text-3xl font-semibold tabular-nums">
                {rooms.filter((room) => !room.is_active).length}
            </p>
            </CardContent>
        </Card>
        </div>

        {/* Rooms table */}
        <Card className="gap-0 overflow-hidden py-0 rounded-md">
        {rooms.length > 0 ? (
            <>
            <div className="overflow-x-auto">
                <Table>
                <TableHeader>
                    {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow
                        key={headerGroup.id}
                        className="bg-muted/40 hover:bg-muted/40"
                    >
                        {headerGroup.headers.map((header) => (
                        <TableCell
                            key={header.id}
                            className="h-11 whitespace-nowrap text-xs font-semibold uppercase tracking-wide bg-[#135893] text-white px-3 border-r border-sky-700 last:border-r-0"
                        >
                            {header.isPlaceholder
                            ? null
                            : <table.FlexRender header={header} />}
                        </TableCell>
                        ))}
                    </TableRow>
                    ))}
                </TableHeader>

                <TableBody>
                    {table.getRowModel().rows.map((row) => (
                    <TableRow
                        key={row.id}
                        className="transition-colors hover:bg-muted/30"
                    >
                        {row.getVisibleCells().map((cell) => (
                        <TableCell
                            key={cell.id}
                            className="py-4 align-middle px-3 border-r border-gray-200 last:border-r-0"
                        >
                            <table.FlexRender cell={cell} />
                        </TableCell>
                        ))}
                    </TableRow>
                    ))}
                </TableBody>
                </Table>
            </div>

            <CardFooter className="justify-between border-t py-4 text-xs text-muted-foreground">
                <span>Showing all {rooms.length} rooms</span>
                <span>Sorted by ID</span>
            </CardFooter>
            </>
        ) : (
            <CardContent className="flex flex-col items-center justify-center px-6 py-16 text-center">
            <div className="mb-4 flex size-14 items-center justify-center rounded-full border bg-muted/30 text-2xl">
                —
            </div>
            <h3 className="font-semibold">No rooms yet</h3>
            <p className="mt-2 max-w-sm text-sm text-muted-foreground">
                Rooms will appear here once they have been added to your workspace.
            </p>
            {userRole === "admin" && (
                <DialogTrigger render={
                    <Button
                    variant="outline"
                    className="mt-5"
                    >
                        Add your first room
                    </Button>
                }/>
            )}
            </CardContent>
        )}
        </Card>

        {/* Add room dialog */}
        <DialogContent className="max-h-[100vh] w-full max-w-2xl flex flex-col gap-0 overflow-hidden p-0 sm:max-w-2xl">
            {activeModal === "addRoom" &&
            <>
            <DialogHeader className="border-b px-5 py-5 sm:px-6">
                <DialogTitle className="text-xl">Add a room</DialogTitle>
                <DialogDescription>
                Enter the room details and choose its facilities.
                </DialogDescription>
            </DialogHeader>

            <div className="overflow-y-auto p-5 sm:p-6">
                <form
                id="roomAdd-form"
                className="space-y-6"
                onSubmit={(e) => {
                    e.preventDefault();
                    roomAddForm.handleSubmit();
                }}
                >
                <div className="grid gap-5 sm:grid-cols-2">
                    <Field className="space-y-2 sm:col-span-2">
                    <FieldLabel htmlFor="add-name">Room name</FieldLabel>
                    <roomAddForm.Field name="name">
                        {(field) => (
                        <Input
                            id="add-name"
                            value={field.state.value}
                            onChange={(e) => field.handleChange(e.target.value)}
                            placeholder="e.g. Conference Room A"
                            required
                        />
                        )}
                    </roomAddForm.Field>
                    </Field>

                    <Field className="space-y-2">
                    <FieldLabel htmlFor="add-capacity">Capacity</FieldLabel>
                    <roomAddForm.Field name="capacity">
                        {(field) => (
                        <Input
                            id="add-capacity"
                            type="number"
                            min={1}
                            value={field.state.value}
                            onChange={(e) =>
                            field.handleChange(Number(e.target.value))
                            }
                            required
                        />
                        )}
                    </roomAddForm.Field>
                    </Field>

                    <Field className="space-y-2">
                    <FieldLabel htmlFor="add-floor">Floor</FieldLabel>
                    <roomAddForm.Field name="floor">
                        {(field) => (
                        <Input
                            id="add-floor"
                            type="number"
                            min={0}
                            value={field.state.value}
                            onChange={(e) =>
                            field.handleChange(Number(e.target.value))
                            }
                            required
                        />
                        )}
                    </roomAddForm.Field>
                    </Field>
                </div>

                <Field className="space-y-3">
                    <FieldLabel>Facilities</FieldLabel>
                    <FieldDescription className="mt-1 text-xs text-muted-foreground">
                    Select all facilities available in this room.
                    </FieldDescription>

                    <roomAddForm.Field name="facilities">
                    {(field) => (
                        <div className="grid gap-3 rounded-lg border p-4 sm:grid-cols-2">
                        {availableFacilities.map((facility, index) => (
                            <label
                            key={facility}
                            className="flex cursor-pointer items-center gap-3 rounded-md p-2 text-sm transition-colors hover:bg-muted/50"
                            >
                            <Checkbox
                                id={`add-facility-${index}`}
                                checked={field.state.value.includes(facility)}
                                onCheckedChange={(checked) => {
                                if (checked === true) {
                                    if (!field.state.value.includes(facility)) {
                                    field.pushValue(facility);
                                    }
                                } else {
                                    const index =
                                    field.state.value.indexOf(facility);
                                    if (index !== -1) field.removeValue(index);
                                }
                                }}
                            />
                            {facility}
                            </label>
                        ))}
                        </div>
                    )}
                    </roomAddForm.Field>
                </Field>

                <Field className="space-y-3">
                    <FieldLabel>Initial status</FieldLabel>
                    <roomAddForm.Field name="is_active">
                    {(field) => (
                        <RadioGroup
                        className="grid grid-cols-2 gap-3"
                        value={String(field.state.value)}
                        onValueChange={(value) =>
                            field.handleChange(value === "true")
                        }
                        >
                        <label
                            htmlFor="add-active"
                            className="flex cursor-pointer items-center gap-3 rounded-lg border p-4 hover:bg-muted/40"
                        >
                            <RadioGroupItem value="true" id="add-active" />
                            <span className="text-sm font-medium">Active</span>
                        </label>
                        <label
                            htmlFor="add-inactive"
                            className="flex cursor-pointer items-center gap-3 rounded-lg border p-4 hover:bg-muted/40"
                        >
                            <RadioGroupItem value="false" id="add-inactive" />
                            <span className="text-sm font-medium">Inactive</span>
                        </label>
                        </RadioGroup>
                    )}
                    </roomAddForm.Field>
                </Field>
                </form>
            </div>

            <DialogFooter className="justify-end gap-2 border-t px-5 py-4 sm:px-6">
                <DialogClose>
                    <Button
                            variant="outline"
                            onClick={() => {
                            roomAddForm.reset();
                            }}
                        >
                            Cancel
                    </Button>
                    <Button type="submit" className="bg-[#135893] hover:bg-[#174875]" form="roomAdd-form">
                        Create room
                    </Button>
                </DialogClose>
            </DialogFooter>
            </>
            }
            {
                activeModal === "updateRoom" && 
                <>
                    <DialogHeader className="border-b px-5 py-5 sm:px-6">
                        <DialogTitle className="text-xl">Update room</DialogTitle>
                        <DialogDescription>
                        Change the room details and facilities.
                        </DialogDescription>
                    </DialogHeader>

                    {/* Form Content Area - Scrolls vertically if the form gets too tall */}
                    <div className="overflow-y-auto p-5 sm:p-6">
                        <form
                        id="roomUpdate-form"
                        className="space-y-6"
                        onSubmit={(e) => {
                            e.preventDefault();
                            roomUpdateForm.handleSubmit();
                        }}
                        >
                        <Field className="space-y-2">
                            <FieldLabel htmlFor="update-name">Room name</FieldLabel>
                            <roomUpdateForm.Field name="name">
                            {(field) => (
                                <Input
                                id="update-name"
                                value={field.state.value}
                                onChange={(e) => field.handleChange(e.target.value)}
                                required
                                />
                            )}
                            </roomUpdateForm.Field>
                        </Field>

                        <div className="grid gap-5 sm:grid-cols-2">
                            <Field className="space-y-2">
                            <FieldLabel htmlFor="update-capacity">Capacity</FieldLabel>
                            <roomUpdateForm.Field name="capacity">
                                {(field) => (
                                <Input
                                    id="update-capacity"
                                    type="number"
                                    min={1}
                                    value={field.state.value}
                                    onChange={(e) =>
                                    field.handleChange(Number(e.target.value))
                                    }
                                    required
                                />
                                )}
                            </roomUpdateForm.Field>
                            </Field>

                            <Field className="space-y-2">
                            <FieldLabel htmlFor="update-floor">Floor</FieldLabel>
                            <roomUpdateForm.Field name="floor">
                                {(field) => (
                                <Input
                                    id="update-floor"
                                    type="number"
                                    min={0}
                                    value={field.state.value}
                                    onChange={(e) =>
                                    field.handleChange(Number(e.target.value))
                                    }
                                    required
                                />
                                )}
                            </roomUpdateForm.Field>
                            </Field>
                        </div>

                        <Field className="space-y-3">
                            <FieldLabel>Facilities</FieldLabel>
                            <FieldDescription className="mt-1 text-xs text-muted-foreground">
                            Update the facilities available in this room.
                            </FieldDescription>

                            <roomUpdateForm.Field name="facilities">
                            {(field) => (
                                <div className="grid gap-3 rounded-lg border p-4 sm:grid-cols-2">
                                {availableFacilities.map((facility, index) => (
                                    <label
                                    key={facility}
                                    className="flex cursor-pointer items-center gap-3 rounded-md p-2 text-sm transition-colors hover:bg-muted/50"
                                    >
                                    <Checkbox
                                        id={`update-facility-${index}`}
                                        checked={field.state.value.includes(facility)}
                                        onCheckedChange={(checked) => {
                                        if (checked === true) {
                                            if (!field.state.value.includes(facility)) {
                                            field.pushValue(facility);
                                            }
                                        } else {
                                            const index =
                                            field.state.value.indexOf(facility);
                                            if (index !== -1) field.removeValue(index);
                                        }
                                        }}
                                    />
                                    {facility}
                                    </label>
                                ))}
                                </div>
                            )}
                            </roomUpdateForm.Field>
                        </Field>
                        </form>
                    </div>

                    <DialogFooter className="justify-end gap-2 border-t px-5 py-4 sm:px-6">
                        <DialogClose>
                            <Button
                                variant="outline"
                                onClick={() => {
                                // DialogClose handles closing the modal automatically.
                                // You just need to reset the form state here.
                                roomUpdateForm.reset();
                                }}
                            >
                                Cancel
                            </Button>
                            <Button 
                            className="bg-[#135893] hover:bg-[#174875] text-white" 
                            type="submit" 
                            form="roomUpdate-form"
                            >
                            Save changes
                            </Button>
                        </DialogClose>
                    </DialogFooter>
                </>
            }
            {
                activeModal === "editFacilities" &&
                <>
                    <DialogContent className="flex w-full max-w-3xl flex-col gap-0 overflow-hidden p-0 sm:max-w-3xl">
                        <DialogHeader className="border-b px-5 py-5 sm:px-6 bg-white">
                            <DialogTitle className="text-xl">Manage Facilities</DialogTitle>
                            <DialogDescription>
                            Add a new facility or view currently available ones.
                            </DialogDescription>
                        </DialogHeader>

                        {/* Two-column layout: Form on left, List on right */}
                        <div className="grid grid-cols-1 divide-y md:grid-cols-2 md:divide-x md:divide-y-0 border-b">
                            
                            {/* Left Side: TanStack Form */}
                            <div className="bg-slate-50/50 p-5 sm:p-6 flex flex-col">
                            <form
                                id="facilityAdd-form"
                                className="flex-1 space-y-4"
                                onSubmit={(e) => {
                                e.preventDefault();
                                facilityAddForm.handleSubmit();
                                }}
                            >
                                <div className="space-y-2">
                                <label htmlFor="facility-name" className="text-sm font-medium text-slate-900">
                                    New Facility Name
                                </label>
                                <facilityAddForm.Field name="name">
                                    {(field) => (
                                    <Input
                                        id="facility-name"
                                        placeholder="e.g. Projector, Video Conferencing"
                                        value={field.state.value}
                                        onChange={(e) => field.handleChange(e.target.value)}
                                        required
                                    />
                                    )}
                                </facilityAddForm.Field>
                                <p className="text-xs text-muted-foreground mt-2">
                                    This facility will immediately become available for selection when adding or updating rooms.
                                </p>
                                </div>
                            </form>
                            </div>

                            {/* Right Side: Scrollable List */}
                            <div className="flex flex-col p-5 sm:p-6 h-[300px] bg-white">
                            <h3 className="mb-3 text-sm font-semibold text-slate-900">
                                Available Facilities ({availableFacilities.length})
                            </h3>
                            
                            <div className="flex-1 overflow-y-auto rounded-md border border-slate-200">
                                <ul className="divide-y divide-slate-100">
                                {availableFacilities.map((facility, index) => (
                                    <li 
                                    key={index} 
                                    className="px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                                    >
                                    {facility}
                                    </li>
                                ))}
                                
                                {availableFacilities.length === 0 && (
                                    <li className="p-4 text-center text-sm text-muted-foreground">
                                    No facilities added yet.
                                    </li>
                                )}
                                </ul>
                            </div>
                            </div>
                        </div>

                        <DialogFooter className="justify-end gap-2 bg-slate-50/50 px-5 py-4 sm:px-6">
                            <DialogClose>
                                <Button
                                    variant="outline"
                                    onClick={() => facilityAddForm.reset()}
                                >
                                    Close
                                </Button>
                                <Button 
                                    type="submit" 
                                    form="facilityAdd-form"
                                    className="bg-[#135893] text-white hover:bg-[#174875]"
                                    >
                                    Add Facility
                                </Button>
                            </DialogClose>
                        </DialogFooter>
                        </DialogContent>
                </>
            }
        </DialogContent>
    </div>
    </Dialog>
    );
}