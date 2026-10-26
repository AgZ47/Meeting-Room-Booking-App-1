import { useSelector } from "react-redux"
import { useCancelUserBookingMutation, useGetAllUserBookingsQuery, usePostUserBookingMutation, type bookingsFetchType } from "../../state/bookings/bookingsApiSlice"
import type { RootState } from "../../state/store"
import { tableFeatures, useTable, type CellContext } from "@tanstack/react-table"
import { column as adminBookingsColumns } from "./adminBookings"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table"
import { Card, CardContent, CardFooter, CardHeader } from "../ui/card"
import { Button } from "../ui/button"
import { useState } from "react"
import { useForm } from "@tanstack/react-form"
import { Input } from "../ui/input"
import { Field, FieldLabel } from "../ui/field"
import { Textarea } from "../ui/textarea"
import {z} from "zod"

const features = tableFeatures({})

const meetingBookingSchema = z.object({
    room_id: z.number().int().positive(),
    booking_date: z.iso.date(),
    start_time: z.iso.time({precision: -1}),
    end_time: z.iso.time({precision: -1}),
    purpose: z.string().trim().min(1).max(255)
});

export const Bookings = () => {
    const token = useSelector((state: RootState) => (state.auth.usertoken))
    const [isAddBookingOpen,setIsAddBookingOpen] = useState<boolean>(false)
    const {data, isLoading, isError, refetch} = useGetAllUserBookingsQuery(undefined, {skip: !token})
    const [ postData ] = usePostUserBookingMutation()
    const [cancelData] = useCancelUserBookingMutation()

    const columns = [...adminBookingsColumns, 
        {
            accessorKey: 'cancel_booking',
            id: 'cancel_booking',
            header: 'Options',
            cell: (info: CellContext<{}, bookingsFetchType, unknown>) => 
            <Button className="bg-red-500 hover:bg-red-900" onClick={() => {
                    cancelData({id: info.row.original.id})
                    refetch();
                }}>
                Cancel Booking
            </Button>
        }
    ]

    const bookings = data?.data ?? []
    const sortedBookings = [...bookings].sort((a,b) => a.id - b.id)

    const addBookingForm = useForm({
        defaultValues: {
            room_id: 0,
            booking_date: '',
            start_time: '',
            end_time: '',
            purpose:'',
        },
        onSubmit: async ({value}) => {
            console.log(value)

            const parsedValue = meetingBookingSchema.parse(value)

            const result = await postData(parsedValue).unwrap()

            console.log(result)

            setIsAddBookingOpen(false)
            addBookingForm.reset()
            refetch();
        }
    })

    const table = useTable({
        key:'bookings',
        features,
        columns,
        data: sortedBookings,
    })

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

    return(
        <div className="space-y-4">
            <Card>
                <CardHeader className="flex flex-row justify-between">
                    <h2 className="text-xl font-semibold">My Bookings</h2>
                    <Button onClick={() => setIsAddBookingOpen(true)}>Book Meeting Room+</Button>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            {table.getHeaderGroups().map((headerGroup) => (
                                <TableRow key={headerGroup.id}>
                                    {headerGroup.headers.map((header) => (
                                        <TableHead key={header.id}>
                                            {header.isPlaceholder ? null : (
                                                <table.FlexRender header={header}/>
                                            )}
                                        </TableHead>
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
                </CardContent>
                <CardFooter className="justify-between border-t py-4 text-xs text-muted-foreground">
                    <span>Showing all {sortedBookings.length} rooms</span>
                    <span>Sorted by ID</span>
                </CardFooter>
            </Card>
            {
                isAddBookingOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
                        <Card className="max-h-[90vh] w-full max-w-2xl gap-0 overflow-hidden py-0 shadow-2xl">
                            <CardHeader className="flex flex-row justify-between">
                                <h2 className="text-xl font-semibold">My Bookings</h2>
                                <Button variant="outline" onClick={() => setIsAddBookingOpen(false)}>X</Button>
                            </CardHeader>
                            <CardContent>
                                <form id="bookingAdd-form" onSubmit={(e) => {
                                    e.preventDefault();
                                    addBookingForm.handleSubmit();
                                }}>
                                    <Field>
                                        <FieldLabel>Room ID</FieldLabel>
                                        <addBookingForm.Field name="room_id">
                                            {(field) => (
                                                <Input
                                                    id="add-booking-id"
                                                    value={field.state.value}
                                                    type="number"
                                                    onChange={(e) => field.handleChange(Number(e.target.value))}
                                                    placeholder="Meeting Room ID"
                                                    required
                                                />
                                            )}
                                        </addBookingForm.Field>
                                    </Field>
                                    <Field>
                                        <FieldLabel>Meeting Date</FieldLabel>
                                        <addBookingForm.Field name="booking_date">
                                            {(field) => (
                                                <Input
                                                    id="add-booking-date"
                                                    value={field.state.value}
                                                    type="date"
                                                    onChange={(e) => field.handleChange(e.target.value)}
                                                    required
                                                />
                                            )}
                                        </addBookingForm.Field>
                                    </Field>
                                    <Field>
                                        <FieldLabel>Meeting Start Time</FieldLabel>
                                        <addBookingForm.Field name="start_time">
                                            {(field) => (
                                                <Input
                                                    id="add-booking-starttime"
                                                    value={field.state.value}
                                                    type="time"
                                                    onChange={(e) => field.handleChange(e.target.value)}
                                                />
                                            )}
                                        </addBookingForm.Field>
                                    </Field>
                                    <Field>
                                        <FieldLabel>Meeting End Time</FieldLabel>
                                        <addBookingForm.Field name="end_time">
                                            {(field) => (
                                                <Input
                                                    id="add-booking-endtime"
                                                    value={field.state.value}
                                                    type="time"
                                                    onChange={(e) => field.handleChange(e.target.value)}
                                                />
                                            )}
                                        </addBookingForm.Field>
                                    </Field>
                                    <Field>
                                        <FieldLabel>Meeting Purpose</FieldLabel>
                                        <addBookingForm.Field name="purpose">
                                            {(field) => (
                                                <Textarea
                                                    id="add-booking-purpose"
                                                    value={field.state.value}
                                                    onChange={(e) => field.handleChange(e.target.value)}
                                                    placeholder="what is the purpose of the meeting?"
                                                />
                                            )}
                                        </addBookingForm.Field>
                                    </Field>
                                </form>
                            </CardContent>
                            <CardFooter className="justify-end gap-2">
                                <Button variant="outline" onClick={() => {
                                        setIsAddBookingOpen(false)
                                        addBookingForm.reset()
                                    }}>Cancel</Button>
                                <Button type="submit" form="bookingAdd-form">Book</Button>
                            </CardFooter>
                        </Card>
                    </div>
                )
            }
        </div>
    )
}