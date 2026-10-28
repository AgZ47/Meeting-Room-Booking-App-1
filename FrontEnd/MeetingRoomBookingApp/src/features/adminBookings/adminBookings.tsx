import { useSelector } from "react-redux";
import { useCancelBookingMutation, useDeleteBookingMutation, useGetBookingsQuery } from "./api/adminApiSlice";
import type { RootState } from "../../common/store";
import { useTable, tableFeatures, columnVisibilityFeature } from "@tanstack/react-table"
import type { ColumnDef } from "@tanstack/react-table";
import type {bookingsResponse} from "./api/adminApiSlice"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../common/ui/table";
import { Button } from "../../common/ui/button";
import { Card, CardFooter} from "../../common/ui/card";
import { SquareX, Trash } from "lucide-react";
import { useMemo } from "react";

export const features = tableFeatures({
  columnVisibilityFeature
})

export const column: ColumnDef<typeof features, bookingsResponse>[] = [
  {
    accessorKey:'bookingId',
    id:'bookingId',
    header: 'bookingId',
    cell: (info) => info.getValue(),
  },
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
        return (<div className="bg-green-100 text-green-500 rounded-xl text-center p-1">{info.getValue<string>()}</div>)
      }
      if(info.getValue() === 'cancelled'){
        return(<div className="bg-red-100 text-red-500 rounded-xl text-center p-1">{info.getValue<string>()}</div>)
      }
      if(info.getValue() === 'completed'){
        return(<div className="bg-blue-100 text-blue-500 rounded-xl text-center p-1">{info.getValue<string>()}</div>)
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

  const columns = useMemo(() => [
    ...column, 
    {
      id: 'actions',
      header: 'Options',
      // Let TypeScript infer `info` automatically
      cell: (info) => (
        <div className="flex flex-row gap-4 items-center justify-center">
          {/* Wrap icons in semantic buttons for better accessibility and hover states */}
          <button 
            title="Cancel Booking"
            className="text-red-500 hover:text-red-700 transition-colors"
            onClick={() => {
              cancelBooking(info.row.original.bookingId);
              refetch();
            }}
          >
            <SquareX className="size-5" />
          </button>
          
          <button 
            title="Delete Booking"
            className="text-red-500 hover:text-red-700 transition-colors"
            onClick={() => {
              deleteBooking(info.row.original.bookingId);
              refetch();
            }}
          >
            <Trash className="size-5" />
          </button>
        </div>
      )
    }
  ], [cancelBooking, deleteBooking, refetch]);

  const bookings = data?.bookingData ?? [];
  const sortedBookings = [...bookings].sort((a,b) => a.bookingId-b.bookingId)

  const table = useTable({
    key: 'bookingstable',
    features,
    columns,
    data: sortedBookings,
    initialState: {
      columnVisibility: {
        bookingId: false,
      },
    },
  })

  if (!token) {
    return (
        <div className="mx-auto mt-12 max-w-md rounded-xl border p-8 text-center">
        <h2 className="text-lg font-semibold">Login required</h2>
        <p className="mt-2 text-sm text-muted-foreground">
            Please log in to view all bookings.
        </p>
        </div>
    );
    }

    if (isLoading) {
    return (
        <div className="mx-auto flex min-h-64 items-center justify-center">
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <span className="size-5 animate-spin rounded-full border-2 border-foreground/20 border-t-foreground" />
            Loading All Bookings...
        </div>
        </div>
    );
    }

    if (isError) {
    return (
        <div className="mx-auto max-w-2xl rounded-xl border p-8 text-center">
        <h2 className="font-semibold">Unable to load bookings</h2>
        <p className="mt-2 text-sm text-muted-foreground">
            Something went wrong while retrieving the bookings list.
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
    <div className="flex flex-col gap-6">
      {/* Page Header */}
      <div className="space-y-1">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          Workspace / Resources
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
          All Bookings
        </h1>
      </div>

      {/* Summary Cards */}
      {/* Changed to 4 columns on large screens to fit all 4 cards perfectly */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="p-6 transition-shadow hover:shadow-sm">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">Total Bookings</p>
            <p className="text-3xl font-bold tabular-nums text-slate-900">
              {sortedBookings.length}
            </p>
          </div>
        </Card>

        <Card className="p-6 transition-shadow hover:shadow-sm">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">Confirmed</p>
            <p className="text-3xl font-bold tabular-nums text-emerald-600">
              {sortedBookings.filter((booking) => booking.status === "confirmed").length}
            </p>
          </div>
        </Card>

        <Card className="p-6 transition-shadow hover:shadow-sm">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">Cancelled</p>
            <p className="text-3xl font-bold tabular-nums text-red-600">
              {sortedBookings.filter((booking) => booking.status === "cancelled").length}
            </p>
          </div>
        </Card>

        <Card className="p-6 transition-shadow hover:shadow-sm">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">Completed</p>
            <p className="text-3xl font-bold tabular-nums text-blue-600">
              {sortedBookings.filter((booking) => booking.status === "completed").length}
            </p>
          </div>
        </Card>
      </div>

      {/* Table Section */}
      <Card className="gap-0 overflow-hidden py-0 rounded-lg shadow-sm border-slate-200">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id} className="hover:bg-transparent">
                  {headerGroup.headers.map((header) => (
                    <TableHead 
                      key={header.id}
                      className="h-11 bg-sky-600 px-4 text-xs font-semibold uppercase tracking-wider text-white whitespace-nowrap border-r border-sky-500 last:border-r-0"
                    >
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
                <TableRow 
                  key={row.id}
                  className="transition-colors hover:bg-slate-50"
                >
                  {/* Replaced getAllCells with getVisibleCells for proper column hiding */}
                  {row.getVisibleCells().map((cell) => (
                    <TableCell 
                      key={cell.id}
                      className="px-4 py-3 align-middle border-r border-slate-100 last:border-r-0 whitespace-nowrap"
                    >
                      <table.FlexRender cell={cell} />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        
        {/* Properly aligned footer */}
        <CardFooter className="flex items-center justify-between border-t border-slate-100 bg-slate-50/50 px-6 py-4 text-xs text-muted-foreground">
          <span>Showing all {sortedBookings.length} bookings</span>
          <span>Sorted by ID</span>
        </CardFooter>
      </Card>
    </div>
  );
};