import { useSelector } from "react-redux";
import { useCancelBookingMutation, useDeleteBookingMutation, useGetBookingsQuery } from "./api/adminApiSlice";
import type { RootState } from "../../common/store";
import { useTable, tableFeatures } from "@tanstack/react-table"
import type { CellContext, ColumnDef } from "@tanstack/react-table";
import type {bookingsResponse} from "./api/adminApiSlice"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../common/ui/table";
import { Button } from "../../common/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "../../common/ui/card";

const features = tableFeatures({})

export const column: ColumnDef<typeof features, bookingsResponse>[] = [
  {
    accessorKey:'userName',
    id:'userName',
    header: 'User Name',
    cell: (info) => info.getValue(),
  },
  {
    accessorKey: 'roomName',
    id: 'roomName',
    header: 'Room Name',
    cell: (info) => info.getValue(),
  },
  {
    accessorKey: 'bookingDate',
    id: 'booking_date',
    header: 'Booking Date',
    cell: (info) => info.getValue(),
  },
  {
    accessorKey: 'startTime',
    id: 'start_time',
    header: 'Start Time',
    cell: (info) => info.getValue(),
  },
  {
    accessorKey: 'endTime',
    id: 'end_time',
    header: 'End Time',
    cell: (info) => info.getValue(),
  },
  {
    accessorKey: 'purpose',
    id: 'purpose',
    header: 'Purpose',
    cell: (info) => info.getValue(),
  },
  {
    accessorKey: 'status',
    id: 'status',
    header: 'Status',
    cell: (info) => {
      if(info.getValue() === 'confirmed'){
        return (<div className="outline-2 outline-green-500 rounded-lg text-center p-2">{info.getValue<string>()}</div>)
      }
      if(info.getValue() === 'cancelled'){
        return(<div className="outline-2 outline-red-500 rounded-lg text-center p-2">{info.getValue<string>()}</div>)
      }
      if(info.getValue() === 'completed'){
        return(<div className="outline-2 outline-blue-500 rounded-lg text-center p-2">{info.getValue<string>()}</div>)
      }
    },
  },
  {
    accessorKey: 'created_at',
    id: 'created_at',
    header: 'Created At',
    cell: (info) => {
      const value = info.getValue<string>();
      return new Date(value).toLocaleString();
    },
  },
]

export const AdminBookings = () => {
  const token = useSelector((state: RootState) => state.auth.usertoken);
  const { data, isLoading, isError, refetch} = useGetBookingsQuery(undefined, { skip: !token });
  const [ cancelBooking ] = useCancelBookingMutation();
  const [ deleteBooking ] = useDeleteBookingMutation();

  const columns = [...column, {
    id: 'actions',
    header: 'Options',
    cell: (info: CellContext<{}, bookingsResponse, unknown>) => 
    <div>
      <Button className="bg-red-500 hover:bg-red-900" onClick={() => {
              cancelBooking(info.row.original.id)
              refetch();
          }}>
          Cancel Booking
      </Button>
      <Button className="bg-red-500 hover:bg-red-900" onClick={() => {
              deleteBooking(info.row.original.id)
              refetch();
          }}>
          Delete Booking
      </Button>
    </div>
  }]

  const bookings = data?.bookingData ?? [];
  const sortedBookings = [...bookings].sort((a,b) => a.id-b.id)

  const table = useTable({
    key: 'bookingstable',
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

  if (bookings.length === 0) {
    return <p>No bookings found.</p>;
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold">All Bookings</h2>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id}>
                      {header.isPlaceholder ? null : (
                        <table.FlexRender header={header} />
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
        <CardFooter>
          <span>Showing all {sortedBookings.length} rooms</span>
          <span>Sorted by ID</span>
        </CardFooter>
      </Card>
    </div>
  );
};