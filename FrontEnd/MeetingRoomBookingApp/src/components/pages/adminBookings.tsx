import { useSelector } from "react-redux";
import { useGetBookingsQuery } from "../../state/admin/adminApiSlice";
import type { RootState } from "../../state/store";
import { useTable, tableFeatures } from "@tanstack/react-table"
import type { ColumnDef } from "@tanstack/react-table";
import type { bookingsFetchType } from "../../state/bookings/bookingsApiSlice";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";

const features = tableFeatures({})

export const columns: ColumnDef<typeof features, bookingsFetchType>[] = [
  {
    accessorKey: 'id',
    id: 'id',
    header: 'ID',
    cell: (info) => info.getValue(),
  },
  {
    accessorKey:'user_id',
    id:'user_id',
    header: 'User ID',
    cell: (info) => info.getValue(),
  },
  {
    accessorKey: 'room_id',
    id: 'room_id',
    header: 'Room ID',
    cell: (info) => info.getValue(),
  },
  {
    accessorKey: 'booking_date',
    id: 'booking_date',
    header: 'Booking Date',
    cell: (info) => info.getValue(),
  },
  {
    accessorKey: 'start_time',
    id: 'start_time',
    header: 'Start Time',
    cell: (info) => info.getValue(),
  },
  {
    accessorKey: 'end_time',
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
        return (<div className="outline-2 outline-green-500 rounded-lg text-center">{info.getValue<string>()}</div>)
      }
      if(info.getValue() === 'cancelled'){
        return(<div className="outline-2 outline-red-500 rounded-lg text-center">{info.getValue<string>()}</div>)
      }
      if(info.getValue() === 'completed'){
        return(<div className="outline-2 outline-blue-500 rounded-lg text-center">{info.getValue<string>()}</div>)
      }
    },
  },
  {
    accessorKey: 'created_at',
    id: 'created_at',
    header: 'Created At',
    cell: (info) => info.getValue(),
  },
]

export const AdminBookings = () => {
  const token = useSelector((state: RootState) => state.auth.usertoken);
  const { data, isLoading, isError, error, refetch} = useGetBookingsQuery(undefined, { skip: !token });


  const bookings = data?.bookingData ?? [];

  const table = useTable({
    key: 'bookingstable',
    features,
    columns,
    data: bookings,
  })

  if (!token) {
    return <p>Please log in to view bookings.</p>;
  }

  if (isLoading) {
    return <div>Loading...</div>;
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

  if (bookings.length === 0) {
    return <p>No bookings found.</p>;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">All Bookings</h2>
      <div className="outline-2 rounded-lg">
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
      </div>
    </div>
  );
};