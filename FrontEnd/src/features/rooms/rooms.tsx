import { useSelector } from "react-redux";
import { useGetAllRoomsQuery } from "./api/roomsApiSlice"
import type { RootState } from "../../common/store";
import { tableFeatures, useTable, type CellContext, type ColumnDef, columnVisibilityFeature, columnResizingFeature, columnSizingFeature, type ColumnResizeMode, type ColumnResizeDirection } from "@tanstack/react-table";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../common/ui/table";
import { Button } from "../../common/ui/button";
import { useAddRoomMutation, useDeactivateRoomMutation, useGetAllFacilitiesQuery, useUpdateRoomMutation, useAddFacilityMutation, useDeleteFacilityMutation } from "../adminBookings/api/adminApiService";
import React, { useState } from "react";
import { Card, CardContent,CardFooter} from "../../common/ui/card";
import { useForm } from "@tanstack/react-form";
import {z} from "zod"
import { Input } from "../../common/ui/input";
import { Checkbox } from "../../common/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "../../common/ui/radio-group";
import { Field, FieldDescription, FieldLabel } from "../../common/ui/field";
import { CircleCheck, LoaderCircle, LogInIcon, Plus, ShieldCheck, ShieldX, SquarePen, Trash } from "lucide-react";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "../../common/ui/hover-card";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "../../common/ui/dialog";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "../../common/ui/empty";
import { toast, Toaster } from "../../common/ui/toast";

const features = tableFeatures({
    columnVisibilityFeature,
    columnResizingFeature, 
    columnSizingFeature
})

type modal = "addRoom" | "updateRoom" | "editFacilities" | null

type rooms = {
    id: number,
    name: string,
    capacity: number,
    floor: number,
    facilities: {id: number, name:string}[], 
    is_active: boolean,
}

const addRoomSchema = z.object({
    name: z.string().trim().min(1).max(100),
    capacity: z.number().int().positive(),
    floor: z.number().int().min(0),
    facilities: z.array(z.number().int().positive()).default([]),
    is_active: z.boolean().default(true),
})

const addRoomFormSchema = z.object({
    name: z.string().trim().min(1).max(100),
    capacity: z.number().int().positive(),
    floor: z.number().int().min(0),
    facilities: z.array(z.number().int().positive()),
    is_active: z.boolean(),
})

const updateRoomSchema = z.object({
    id: z.number().int().positive(),
    name: z.string().trim().min(1).max(100),
    capacity: z.number().int().positive(),
    floor: z.number().int().min(0),
    facilities: z.array(z.number().int().positive()).default([]),
})

const updateRoomFormSchema = z.object({
    id: z.number().int().positive(),
    name: z.string().trim().min(1).max(100),
    capacity: z.number().int().positive(),
    floor: z.number().int().min(0),
    facilities: z.array(z.number().int().positive()),
})

export const Rooms = () => {
    const [activeModal, setActiveModal] = useState<modal>(null)
    const token = useSelector((state: RootState) => state.auth.usertoken);
    const userRole = useSelector((state: RootState) => state.auth.role);
    const { data, isLoading, isError, refetch} = useGetAllRoomsQuery(undefined, { skip: !token })
    const {data: fetchedFacilities, refetch: refetchFacilities} = useGetAllFacilitiesQuery(undefined, { skip: !token })
    const [addFacility] = useAddFacilityMutation()
    const [deleteFacility] = useDeleteFacilityMutation()
    const [deactivateRoom] = useDeactivateRoomMutation()
    const [updateRoom] = useUpdateRoomMutation()
    const [addRoom] = useAddRoomMutation()


    const availableFacilities = fetchedFacilities?.facilitiesData ?? [];
    const rooms = data?.roomData ?? [];
    const sortedrooms = [...rooms].sort((a, b) => a.id - b.id)

    function showSuccessToast(description: string) {
        toast.add({
            type: "success",
            title: "Message",
            description: description,
            // actionProps: {
            //     children: "Undo",
            //         onClick() {
            //             toast.close(id)
            //     },
            // },
        })
    }

    function showFailureToast(description: string) {
        toast.add({
            type: "error",
            title: "Message",
            description: description,
            // actionProps: {
            //     children: "Undo",
            //         onClick() {
            //             toast.close(id)
            //     },
            // },
        })
    }

    const roomAddForm = useForm({
        defaultValues: {
            name: '',
            capacity: 1,
            floor: 0,
            facilities: [] as number[],
            is_active: true,
        },
        validators:{
            onChange: addRoomFormSchema,
        },
        onSubmit: async ({value}) => {
            try{
                const parsedValue = addRoomSchema.parse(value)
                await addRoom(parsedValue)
                refetch();
                roomAddForm.reset()
                showSuccessToast("Added room Successfully")
            }catch(err){
                console.log("Failed to add room: ", err);
                showFailureToast("Failed to Add Room")
            }
        }
    })

    const roomUpdateForm = useForm({
        defaultValues: {
            id: 0,
            name: '',
            capacity: 1,
            floor: 0,
            facilities: [] as number[],
        },
        validators:{
            onChange: updateRoomFormSchema
        },
        onSubmit: async ({value}) => {
            try{
                await updateRoom(updateRoomSchema.parse(value))
                refetch();
                roomUpdateForm.reset()
                showSuccessToast("Room Updated Successfully")
            }catch(err){
                console.log(err)
                showFailureToast("Failed to Update Room")
            }
        }
    })

    const facilityAddForm = useForm({
        defaultValues: {
            name: "",   
        },
        onSubmit: async ({ value }) => {
            try{
                await addFacility(value);
                facilityAddForm.reset();
                showSuccessToast("Facility Added Succesfully");
            }catch(err){
                console.log(err)
                showFailureToast("Failed to Add Facility")
            }
        },
    });

    const handleDelete = async (rowData: rooms) => {
        await deactivateRoom(rowData.id).unwrap()
        refetch();
    }   

    const columns: Array<ColumnDef<typeof features, rooms>> = [
    {
        accessorKey: "SL.NO",
        header:"Sl No",
        enableResizing: false,
        minSize:30,
        maxSize:40,
        size: 35,
        cell: (info) => (
            <div className="flex h-full w-full justify-center">
                <span className="text-center">
                    {info.row.index}
                </span>
            </div>
        )
    },
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
        minSize: 80,
        maxSize: 600,
        size: 250,
        cell: (info) => {
        const facilities = info.getValue<{ id: number, name: string }[]>();

        return (
            <div className="flex flex-wrap gap-1.5">
            {facilities.length ? (
                facilities.map((facility) => (
                <span
                    key={facility.id}
                    className="inline-flex rounded-sm border bg-muted/20 px-2 py-1 text-xs font-medium"
                >
                    {facility.name}
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
        enableResizing: false,
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
            enableResizing: false,
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
                            <DialogTrigger
                                className="flex h-8 w-8 items-center justify-center rounded-md text-slate-500 transition-colors hover:bg-slate-100 hover:text-sky-600"
                                onClick={() => {
                                setActiveModal("updateRoom")
                                roomUpdateForm.setFieldValue("id", room.id);
                                roomUpdateForm.setFieldValue("name", room.name);
                                roomUpdateForm.setFieldValue("floor", room.floor);
                                roomUpdateForm.setFieldValue("capacity", room.capacity);
                                roomUpdateForm.setFieldValue("facilities", room.facilities.map(facility => facility.id));
                                }}
                            >
                                <SquarePen className="size-5" />
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

    const [columnResizeMode] = React.useState<ColumnResizeMode>("onChange");
    const [columnResizeDirection] = React.useState<ColumnResizeDirection>("ltr")

    const table = useTable({
        key: "roomstable",
        features,
        columns,
        data: sortedrooms,
        columnResizeMode,
        columnResizeDirection,
        initialState: {
        columnVisibility: {
                id: false,
            },
        },
        defaultColumn: {
            minSize: 80,
            maxSize: 600,
            size: 150,
        },
    });

    if (!token) {
    return (
        <div className="w-full h-dvh flex justify-center items-center">
            <Empty>
                <EmptyHeader>
                    <EmptyMedia>
                        <LogInIcon/>
                    </EmptyMedia>
                    <EmptyTitle>
                        Login Required
                    </EmptyTitle>
                </EmptyHeader>
                <EmptyContent>
                    <EmptyDescription>
                        Please log in to view meeting rooms.
                    </EmptyDescription>
                </EmptyContent>
            </Empty>
        </div>
    );
    }

    if (isLoading) {
    return (
        <div className="w-full h-dvh flex justify-center items-center">
            <Empty>
                <EmptyHeader>
                    <EmptyMedia>
                        <LoaderCircle className="animate-spin"/>
                    </EmptyMedia>
                    <EmptyTitle>
                        Loading meeting rooms...
                    </EmptyTitle>
                </EmptyHeader>
            </Empty>
        </div>
    );
    }

    if (isError) {
    return (
        <div className="h-dvh flex justify-center items-center">
            <Empty>
                <EmptyHeader>
                  <EmptyTitle>
                    Error
                  </EmptyTitle>
                  <EmptyDescription>
                    Something went wrong while retrieving the bookings list.
                  </EmptyDescription>
                </EmptyHeader>
                <EmptyContent>
                  <Button className="mt-5" variant="outline" onClick={() => refetch()}>
                    Try again
                  </Button>
                </EmptyContent>
            </Empty>
        </div>
    );
    }

    return (
    <Dialog>
    <div className="mx-auto w-full space-y-6 p-4 sm:p-6">
        <Toaster/>
        {/* Page heading */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                Workspace / Resources
                </p>
                <h1 className="text-3xl font-semibold tracking-tight text-[#135893]">
                Meeting rooms
                </h1>
            </div>
                {userRole === "admin" && (
                    <div className="flex flex-row gap-2">
                        <DialogTrigger render={
                                <Button className="w-full sm:w-auto bg-[#135893] text-white hover:bg-[#174875]" onClick={() => {setActiveModal("editFacilities"); refetchFacilities()}}>
                                    <Plus/>
                                    Add facilities
                                </Button>
                        }/>
                        <DialogTrigger render={    
                            <Button className="w-full sm:w-auto bg-[#135893] text-white hover:bg-[#174875]" onClick={() => {setActiveModal("addRoom"); refetch()}}>
                                <Plus/>
                                Add room
                            </Button>
                        }/>
                    </div>
                )}
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="gap-2 py-5">
            <CardContent className="space-y-1">
            <p className="text-sm text-muted-foreground">Total rooms</p>
            <p className="text-3xl font-semibold tabular-nums text-[#135893]">
                {rooms.length}
            </p>
            </CardContent>
        </Card>

        <Card className="gap-2 py-5">
            <CardContent className="space-y-1">
            <p className="text-sm text-muted-foreground">Active rooms</p>
            <p className="text-3xl font-semibold tabular-nums text-[#135893]">
                {rooms.filter((room) => room.is_active).length}
            </p>
            </CardContent>
        </Card>

        <Card className="gap-2 py-5">
            <CardContent className="space-y-1">
            <p className="text-sm text-muted-foreground">Deactivated rooms</p>
            <p className="text-3xl font-semibold tabular-nums text-[#135893]">
                {rooms.filter((room) => !room.is_active).length}
            </p>
            </CardContent>
        </Card>
        </div>

        {/* Rooms table */}
        <Card className="gap-0 overflow-hidden py-0 rounded-md">
        {rooms.length > 0 ? (
            <>
            <div className="overflow-x-auto w-full min-w-0">
                <Table style={{width: "100%", tableLayout: "fixed"}}>
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
                            onMouseDown={header.getResizeHandler()}
                            style={{width: header.getSize()}}
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
                    onClick={() => {setActiveModal("addRoom"); refetch()}}
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
                        <roomAddForm.Field name="name">
                            {(field) => (
                            <Field className="space-y-2 sm:col-span-2" 
                                data-invalid={!field.state.meta.isValid && field.state.meta.isTouched}
                            >
                                    <FieldLabel htmlFor="add-name" className="flex flex-row gap-0">
                                        Room name
                                        <p className="text-red-400">
                                            *
                                        </p>
                                    </FieldLabel>
                                    <Input
                                        id={field.name}
                                        name={field.name}
                                        value={field.state.value}
                                        onChange={(e) => field.handleChange(e.target.value)}
                                        placeholder="e.g. Conference Room A"
                                        required
                                        aria-invalid={!field.state.meta.isValid && field.state.meta.isTouched}
                                    />
                                    {!field.state.meta.isValid && field.state.meta.isTouched && (
                                        <div className="text-red-400 font-bold">
                                            {field.state.meta.errors.map((error,index) => (
                                                <p key={index}>
                                                    {typeof error === "string" ? error : error?.message}
                                                </p>
                                            ))}
                                        </div>
                                    )}
                            </Field>
                            )}
                        </roomAddForm.Field>

                    <roomAddForm.Field name="capacity">
                        {(field) => (
                            <Field 
                                className="space-y-2"
                                data-invalid={!field.state.meta.isValid && field.state.meta.isTouched}
                            >                                
                                <FieldLabel htmlFor="add-capacity" className="flex flex-row gap-0">
                                    Capacity
                                    <p className="text-red-400">
                                        *
                                    </p>
                                </FieldLabel>
                                <Input
                                    id="add-capacity"
                                    type="number"
                                    min={1}
                                    value={field.state.value}
                                    onChange={(e) =>
                                    field.handleChange(Number(e.target.value))
                                    }
                                    required
                                    aria-invalid={!field.state.meta.isValid && field.state.meta.isTouched}
                                />
                                {!field.state.meta.isValid && field.state.meta.isTouched && (
                                    <div className="text-red-400 font-bold">
                                        {field.state.meta.errors.map((error,index) => (
                                            <p key={index}>
                                                {typeof error === "string" ? error : error?.message}
                                            </p>
                                        ))}
                                    </div>
                                )}
                            </Field>
                        )}
                    </roomAddForm.Field>

                    <roomAddForm.Field name="floor">
                        {(field) => (
                        <Field 
                            className="space-y-2"
                            data-invalid={!field.state.meta.isValid && field.state.meta.isTouched}
                        >
                            <FieldLabel htmlFor="add-floor" className="flex flex-row gap-0">
                                Floor
                                <p className="text-red-400">
                                    *
                                </p>
                            </FieldLabel>
                            <Input
                                id="add-floor"
                                type="number"
                                min={0}
                                value={field.state.value}
                                onChange={(e) =>
                                field.handleChange(Number(e.target.value))
                                }
                                required
                                aria-invalid={!field.state.meta.isValid && field.state.meta.isTouched}
                            />
                            {!field.state.meta.isValid && field.state.meta.isTouched && (
                                <div className="text-red-400 font-bold">
                                    {field.state.meta.errors.map((error,index) => (
                                        <p key={index}>
                                            {typeof error === "string" ? error : error?.message}
                                        </p>
                                    ))}
                                </div>
                            )}
                        </Field>
                        )}
                    </roomAddForm.Field>
                </div>

                <Field className="space-y-3">
                    <FieldLabel>
                        Facilities
                    </FieldLabel>
                    <FieldDescription className="mt-1 text-xs text-muted-foreground">
                        Select all facilities available in this room.
                    </FieldDescription>

                    <roomAddForm.Field name="facilities">
                    {(field) => (
                        <div className="grid gap-3 rounded-sm border p-4 sm:grid-cols-2">
                        {availableFacilities.map((facility, index) => (
                            <label
                            key={facility.id}
                            className="flex cursor-pointer items-center gap-3 rounded-md p-2 text-sm transition-colors hover:bg-muted/50"
                            >
                            <Checkbox
                                id={`add-facility-${index}`}
                                checked={field.state.value.includes(facility.id)}
                                onCheckedChange={(checked) => {
                                if (checked === true) {
                                    if (!field.state.value.includes(facility.id)) {
                                    field.pushValue(facility.id);
                                    }
                                } else {
                                    const index =
                                    field.state.value.indexOf(facility.id);
                                    if (index !== -1) field.removeValue(index);
                                }
                                }}
                            />
                            {facility.name}
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

            <DialogFooter className="justify-end gap-2 m-1 border-t px-5 py-4 sm:px-6">
                <DialogClose render={
                    <Button
                        variant="outline"
                        onClick={() => {
                        roomAddForm.reset();
                        }}
                    >
                        Cancel
                    </Button>
                }/>
                <DialogClose render={
                    <Button type="submit" className="bg-[#135893] hover:bg-[#174875]" form="roomAdd-form">
                        Create room
                    </Button>
                }/>
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
                        <roomUpdateForm.Field name="name">
                            {(field) => (
                            <Field 
                                className="space-y-2"
                                data-invalid={!field.state.meta.isValid && field.state.meta.isTouched}
                            >
                                <FieldLabel htmlFor="update-name" className="flex flex-row gap-0">
                                    Room name
                                    <p className="text-red-400">
                                        *
                                    </p>
                                </FieldLabel>
                                <Input
                                    id="update-name"
                                    value={field.state.value}
                                    onChange={(e) => field.handleChange(e.target.value)}
                                    required
                                    aria-invalid={!field.state.meta.isValid && field.state.meta.isTouched}
                                />
                                {!field.state.meta.isValid && field.state.meta.isTouched && (
                                <div className="text-red-400 font-bold">
                                        {field.state.meta.errors.map((error,index) => (
                                            <p key={index}>
                                                {typeof error === "string" ? error : error?.message}
                                            </p>
                                        ))}
                                    </div>
                                )}
                            </Field>
                            )}
                            </roomUpdateForm.Field>

                        <div className="grid gap-5 sm:grid-cols-2">
                            <roomUpdateForm.Field name="capacity">
                                {(field) => (
                                <Field 
                                    className="space-y-2"
                                    data-invalid={!field.state.meta.isValid && field.state.meta.isTouched}
                                >
                                    <FieldLabel htmlFor="update-capacity" className="flex flex-row gap-0">
                                        Capacity
                                        <p className="text-red-400">
                                            *
                                        </p>
                                    </FieldLabel>
                                    <Input
                                        id="update-capacity"
                                        type="number"
                                        min={1}
                                        value={field.state.value}
                                        onChange={(e) =>
                                        field.handleChange(Number(e.target.value))
                                        }
                                        required
                                        aria-invalid={!field.state.meta.isValid && field.state.meta.isTouched}
                                    />
                                    {!field.state.meta.isValid && field.state.meta.isTouched && (
                                    <div className="text-red-400 font-bold">
                                            {field.state.meta.errors.map((error,index) => (
                                                <p key={index}>
                                                    {typeof error === "string" ? error : error?.message}
                                                </p>
                                            ))}
                                        </div>
                                    )}
                                </Field>
                                )}
                            </roomUpdateForm.Field>

                            <roomUpdateForm.Field name="floor">
                                {(field) => (
                                <Field 
                                    className="space-y-2"
                                    data-invalid={!field.state.meta.isValid && field.state.meta.isTouched}
                                >
                                <FieldLabel htmlFor="update-floor" className="flex flex-row gap-0">
                                    Floor
                                    <p className="text-red-400">
                                        *
                                    </p>
                                </FieldLabel>                        
                                    <Input
                                        id="update-floor"
                                        type="number"
                                        min={0}
                                        value={field.state.value}
                                        onChange={(e) =>
                                        field.handleChange(Number(e.target.value))
                                        }
                                        required
                                        aria-invalid={!field.state.meta.isValid && field.state.meta.isTouched}
                                    />
                                    {!field.state.meta.isValid && field.state.meta.isTouched && (
                                    <div className="text-red-400 font-bold">
                                            {field.state.meta.errors.map((error,index) => (
                                                <p key={index}>
                                                    {typeof error === "string" ? error : error?.message}
                                                </p>
                                            ))}
                                        </div>
                                    )}
                                </Field>
                                )}
                            </roomUpdateForm.Field>
                        </div>

                        <Field className="space-y-3">
                            <FieldLabel className="flex flex-row gap-0">
                                Facilities
                                <p className="text-red-400">
                                    *
                                </p>
                            </FieldLabel>
                            <FieldDescription className="mt-1 text-xs text-muted-foreground">
                            Update the facilities available in this room.
                            </FieldDescription>

                                <roomUpdateForm.Field name="facilities">
                                {(field) => (
                                    <div className="grid gap-3 rounded-lg border p-4 sm:grid-cols-2">
                                    {availableFacilities.map((facility, index) => (
                                        <label
                                        key={facility.id}
                                        className="flex cursor-pointer items-center gap-3 rounded-md p-2 text-sm transition-colors hover:bg-muted/50"
                                        >
                                        <Checkbox
                                            id={`update-facility-${index}`}
                                            checked={field.state.value.includes(facility.id)}
                                            onCheckedChange={(checked) => {
                                            if (checked === true) {
                                                if (!field.state.value.includes(facility.id)) {
                                                field.pushValue(facility.id);
                                                }
                                            } else {
                                                const index =
                                                field.state.value.indexOf(facility.id);
                                                if (index !== -1) field.removeValue(index);
                                            }
                                            }}
                                        />
                                        {facility.name}
                                        </label>
                                    ))}
                                    </div>
                                )}
                            </roomUpdateForm.Field>
                        </Field>
                        </form>
                    </div>

                    <DialogFooter className="justify-end gap-2 m-1 border-t px-5 py-4 sm:px-6">
                        <DialogClose render={
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
                        }/>
                        <DialogClose render={
                            <Button 
                            className="bg-[#135893] hover:bg-[#174875] text-white" 
                            type="submit" 
                            form="roomUpdate-form"
                            >
                                Save changes
                            </Button>
                        }/>
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
                                    {facility.name}
                                    <Button onClick={() => {deleteFacility(facility.id); refetchFacilities(); showSuccessToast("Facility Deleted Successfully")}} variant="ghost" size="sm" className="float-right text-red-500 hover:bg-red-50 hover:text-red-700">
                                        <Trash/>
                                    </Button>
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

                        <DialogFooter className="justify-end gap-2 m-1 bg-slate-50/50 px-5 py-4 sm:px-6">
                            <DialogClose render={
                                <Button
                                    variant="outline"
                                    onClick={() => facilityAddForm.reset()}
                                >
                                    Close
                                </Button>
                            }/>
                            <DialogClose render={
                                <Button 
                                    type="submit" 
                                    form="facilityAdd-form"
                                    className="bg-[#135893] text-white hover:bg-[#174875]"
                                    >
                                    Add Facility
                                </Button>
                            }/>
                        </DialogFooter>
                    </DialogContent>
                </>
            }
        </DialogContent>
    </div>
    </Dialog>
    );
}