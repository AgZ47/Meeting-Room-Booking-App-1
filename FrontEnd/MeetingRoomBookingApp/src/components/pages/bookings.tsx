import { useSelector } from "react-redux"
import { useGetAllUserBookingsQuery } from "../../state/bookings/bookingsApiSlice"
import type { RootState } from "../../state/store"
import { tableFeatures, useTable } from "@tanstack/react-table"
import { columns } from "./adminBookings"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table"

const features = tableFeatures({})

export const Bookings = () => {
    const token = useSelector((state: RootState) => (state.auth.usertoken))
    const {data, isLoading, isError, error, refetch} = useGetAllUserBookingsQuery(undefined, {skip: !token})

    const bookings = data?.data ?? []

    const table = useTable({
        key:'bookings',
        features,
        columns,
        data: bookings,
    })

    if(!token){
        return <div>Please login to view your bookings.</div>
    }

    if(isLoading){
        return <div></div>
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
            <h2 className="text-xl font-semibold">My Bookings</h2>
            <div className="outline-2 rounded-lg">
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
            </div>
        </div>
    )
}