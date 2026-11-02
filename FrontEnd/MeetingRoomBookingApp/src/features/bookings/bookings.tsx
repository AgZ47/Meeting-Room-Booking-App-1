import { useSelector } from "react-redux";
import { useState } from "react";
import { useForm } from "@tanstack/react-form";
import { z } from "zod";
import {
  addDays,
  addWeeks,
  format,
  isSameDay,
  startOfWeek,
} from "date-fns";

import type { RootState } from "../../common/store";
import type { bookingsResponse } from "../adminBookings/api/adminApiSlice";

import {
  useCancelUserBookingMutation,
  useGetAllUserBookingsQuery,
  usePostUserBookingMutation,
} from "./api/bookingsApiSlice";

import { useGetAllRoomsQuery } from "../rooms/api/roomsApiSlice";

import { Button } from "../../common/ui/button";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "../../common/ui/hover-card"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "../../common/ui/card";
import { Input } from "../../common/ui/input";
import { Textarea } from "../../common/ui/textarea";
import { Field, FieldLabel } from "../../common/ui/field";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "../../common/ui/select";

// --------------------------------------------------
// Calendar configuration
// --------------------------------------------------

const START_HOUR = 8;
const END_HOUR = 20;
const HOUR_HEIGHT = 64;

const meetingBookingSchema = z
  .object({
    room_id: z.number().int().positive(),
    booking_date: z.iso.date(),
    start_time: z.iso.time({ precision: -1 }),
    end_time: z.iso.time({ precision: -1 }),
    purpose: z.string().trim().min(1).max(255),
  })
  .refine(
    (value) => value.end_time > value.start_time,
    {
      message: "End time must be later than start time",
      path: ["end_time"],
    }
  );

const getMinutes = (time: string) => {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
};

const getBookingPosition = (
  startTime: string,
  endTime: string
) => {
  const start = getMinutes(startTime);
  const end = getMinutes(endTime);

  const calendarStart = START_HOUR * 60;
  const calendarEnd = END_HOUR * 60;

  const visibleStart = Math.max(start, calendarStart);
  const visibleEnd = Math.min(end, calendarEnd);

  if (visibleEnd <= visibleStart) {
    return null;
  }

  return {
    top: ((visibleStart - calendarStart) / 60) * HOUR_HEIGHT,
    height: Math.max(
      24,
      ((visibleEnd - visibleStart) / 60) * HOUR_HEIGHT
    ),
  };
};

// --------------------------------------------------
// Booking layout: place overlapping bookings side by side
// --------------------------------------------------

type PositionedBooking = {
  booking: bookingsResponse;
  lane: number;
  laneCount: number;
};

const getDayBookingsLayout = (
  bookings: bookingsResponse[]
): PositionedBooking[] => {
  const validBookings = bookings
    .filter((booking) => {
      return (
        getBookingPosition(
          booking.startTime,
          booking.endTime
        ) !== null
      );
    })
    .sort(
      (a, b) =>
        getMinutes(a.startTime) - getMinutes(b.startTime)
    );

  const assigned: {
    booking: bookingsResponse;
    lane: number;
  }[] = [];

  for (const booking of validBookings) {
    const start = getMinutes(booking.startTime);

    // Find the first lane that is no longer occupied.
    const occupiedLanes = assigned
      .filter(
        (item) =>
          getMinutes(item.booking.endTime) > start
      )
      .map((item) => item.lane);

    let lane = 0;

    while (occupiedLanes.includes(lane)) {
      lane++;
    }

    assigned.push({ booking, lane });
  }

  return assigned.map((item) => {
    const start = getMinutes(item.booking.startTime);
    const end = getMinutes(item.booking.endTime);

    // Count the lanes needed by this booking's overlapping group.
    const overlapping = assigned.filter((other) => {
      const otherStart = getMinutes(other.booking.startTime);
      const otherEnd = getMinutes(other.booking.endTime);

      return start < otherEnd && end > otherStart;
    });

    const laneCount = Math.max(
      1,
      ...overlapping.map((other) => other.lane + 1)
    );

    return {
      ...item,
      laneCount,
    };
  });
};

// --------------------------------------------------
// Component
// --------------------------------------------------

export const Bookings = () => {
  const token = useSelector(
    (state: RootState) => state.auth.usertoken
  );

  const [isAddBookingOpen, setIsAddBookingOpen] =
    useState(false);

  const [currentWeek, setCurrentWeek] = useState(
    startOfWeek(new Date(), { weekStartsOn: 1 })
  );

  const {
    data,
    isLoading,
    isError,
    refetch,
  } = useGetAllUserBookingsQuery(undefined, {
    skip: !token,
  });

  const {
    data: roomsData,
    refetch: refetchRooms,
  } = useGetAllRoomsQuery();

  const [postData, { isLoading: isPosting }] =
    usePostUserBookingMutation();

  const [cancelData] = useCancelUserBookingMutation();

  const rooms = roomsData?.roomData ?? [];
  const bookings: bookingsResponse[] = data?.data ?? [];

  const sortedBookings = [...bookings].sort(
    (a, b) => a.bookingId - b.bookingId
  );

  const weekDays = Array.from(
    { length: 7 },
    (_, index) => addDays(currentWeek, index)
  );

  const timeSlots = Array.from(
    { length: END_HOUR - START_HOUR },
    (_, index) => START_HOUR + index
  );

  const addBookingForm = useForm({
    defaultValues: {
      room_id: 0,
      booking_date: "",
      start_time: "",
      end_time: "",
      purpose: "",
    },

    onSubmit: async ({ value }) => {
      const parsedValue = meetingBookingSchema.parse(value);

      await postData(parsedValue).unwrap();

      setIsAddBookingOpen(false);
      addBookingForm.reset();

      await refetch();
    },
  });

  // --------------------------------------------------
  // Authentication and loading states
  // --------------------------------------------------

  if (!token) {
    return (
      <div className="mx-auto mt-12 max-w-md rounded-xl border p-8 text-center">
        <h2 className="text-lg font-semibold">
          Login required
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Please log in to view bookings.
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="mx-auto flex min-h-64 items-center justify-center">
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <span className="size-5 animate-spin rounded-full border-2 border-foreground/20 border-t-foreground" />
          Loading meeting bookings...
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="mx-auto max-w-2xl rounded-xl border p-8 text-center">
        <h2 className="font-semibold">
          Unable to load bookings
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong while retrieving your bookings.
        </p>
        <Button
          className="mt-5"
          variant="outline"
          onClick={() => refetch()}
        >
          Try again
        </Button>
      </div>
    );
  }

  // --------------------------------------------------
  // Calendar UI
  // --------------------------------------------------

  return (
    <div className="flex min-h-screen flex-col gap-4 p-4">

      {/* Calendar toolbar */}
      <Card>
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold">
              Meeting Calendar
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {format(currentWeek, "MMMM d")} –{" "}
              {format(addDays(currentWeek, 6), "MMMM d, yyyy")}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              onClick={() =>
                setCurrentWeek(addWeeks(currentWeek, -1))
              }
            >
              Previous
            </Button>

            <Button
              variant="outline"
              onClick={() =>
                setCurrentWeek(
                  startOfWeek(new Date(), {
                    weekStartsOn: 1,
                  })
                )
              }
            >
              Today
            </Button>

            <Button
              variant="outline"
              onClick={() =>
                setCurrentWeek(addWeeks(currentWeek, 1))
              }
            >
              Next
            </Button>

            <Button
              onClick={() => {
                refetchRooms();
                setIsAddBookingOpen(true);
              }}
            >
              + Book a room
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          {/* Calendar legend */}
          <div className="mb-4 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <span className="size-3 rounded-sm border border-blue-300 bg-blue-100 dark:border-blue-800 dark:bg-blue-950" />
              Confirmed booking
            </div>

            <div className="flex items-center gap-2">
              <span className="size-3 rounded-sm border bg-muted" />
              Cancelled booking
            </div>
          </div>

          {/* Scrollable calendar */}
          <div className="max-h-[calc(100vh-260px)] overflow-auto rounded-lg border">
            <div className="min-w-[1050px]">

              {/* Day headers */}
              <div className="sticky top-0 z-30 grid grid-cols-[76px_repeat(7,minmax(0,1fr))] border-b bg-background">
                <div className="border-r p-3 text-center text-xs text-muted-foreground">
                  GMT+5:30
                </div>

                {weekDays.map((day) => {
                  const isToday = isSameDay(
                    day,
                    new Date()
                  );

                  return (
                    <div
                      key={day.toISOString()}
                      className="border-r px-2 py-3 text-center"
                    >
                      <p className="text-xs font-medium text-muted-foreground">
                        {format(day, "EEE")}
                      </p>

                      <div
                        className={`mx-auto mt-1 flex size-8 items-center justify-center rounded-full text-sm font-semibold ${
                          isToday
                            ? "bg-primary text-primary-foreground"
                            : ""
                        }`}
                      >
                        {format(day, "d")}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Calendar grid */}
              <div className="grid grid-cols-[76px_repeat(7,minmax(0,1fr))]">

                {/* Time labels */}
                <div className="border-r">
                  {timeSlots.map((hour) => (
                    <div
                      key={hour}
                      className="relative border-b pr-2 text-right text-xs text-muted-foreground"
                      style={{ height: HOUR_HEIGHT }}
                    >
                      <span className="relative -top-2">
                        {format(
                          new Date(2000, 0, 1, hour),
                          "h a"
                        )}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Day columns */}
                {weekDays.map((day) => {
                  const dayBookings = sortedBookings.filter(
                    (booking) => {
                      const bookingDate = new Date(
                        `${booking.bookingDate}T00:00:00`
                      );

                      return isSameDay(bookingDate, day);
                    }
                  );

                  const positionedBookings =
                    getDayBookingsLayout(dayBookings);

                    return (
                            <div
                            key={day.toISOString()}
                            className="relative border-r"
                            style={{
                                height:
                                timeSlots.length * HOUR_HEIGHT,
                            }}
                            >
                                {/* Hour grid lines */}
                                {timeSlots.map((hour) => (
                                    <div
                                    key={hour}
                                    className="absolute w-full border-b"
                                    style={{
                                        top:
                                        (hour - START_HOUR) *
                                        HOUR_HEIGHT,
                                        height: HOUR_HEIGHT,
                                    }}
                                    />
                                ))}

                                {/* Booking cards */}
                                {positionedBookings.map(
                                    ({
                                    booking,
                                    lane,
                                    laneCount,
                                    }) => {
                                    const position =
                                        getBookingPosition(
                                        booking.startTime,
                                        booking.endTime
                                        );

                                    if (!position) return null;

                                    const isCancelled =
                                        booking.status?.toLowerCase() ===
                                        "cancelled";

                                    const isCompleted =
                                        booking.status?.toLowerCase() ===
                                        "completed";

                                    const width =
                                        100 / laneCount;

                                    return (
                                        <div
                                        key={booking.bookingId}
                                        className={`absolute z-10 overflow-hidden rounded-md border p-1.5 text-xs shadow-sm ${
                                            isCancelled
                                            ? "border-muted-foreground/20 bg-muted text-muted-foreground"
                                            : isCompleted
                                            ? "border-green-300 bg-green-100 text-green-950 dark:border-green-800 dark:bg-green-950 dark:text-green-100"
                                            : "border-blue-300 bg-blue-100 text-blue-950 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-100"
                                        }`}
                                        style={{
                                            top: position.top,
                                            height: position.height,
                                            left: `${lane * width}%`,
                                            width: `${width}%`,
                                        }}
                                        >
                                        <HoverCard>
                                        <HoverCardTrigger delay={10} closeDelay={100}>
                                        <div className="flex h-full flex-col overflow-hidden">
                                            <p className="truncate font-semibold">
                                            {booking.roomName}
                                            </p>
{/* 
                                            <p className="mt-0.5 line-clamp-2 break-words">
                                            {booking.purpose}
                                            </p> */}

                                            <p className="mt-1 truncate opacity-75">
                                            {booking.startTime.slice(0, 5)}{" "}
                                            –{" "}
                                            {booking.endTime.slice(0, 5)}
                                            </p>

                                            <div className="mt-auto flex items-center justify-between gap-1">
                                            <span className="truncate capitalize">
                                                {booking.status}
                                            </span>

                                            {!isCancelled &&
                                                !isCompleted && (
                                                <button
                                                    type="button"
                                                    className="shrink-0 rounded px-1 py-0.5 font-medium hover:bg-black/10"
                                                    onClick={async () => {
                                                    try {
                                                        await cancelData({
                                                        id: booking.bookingId,
                                                        }).unwrap();

                                                        await refetch();
                                                    } catch (error) {
                                                        console.error(
                                                        "Unable to cancel booking",
                                                        error
                                                        );
                                                    }
                                                    }}
                                                >
                                                    Cancel
                                                </button>
                                                )}
                                            </div>
                                        </div>
                                        </HoverCardTrigger>
                                            <HoverCardContent>
                                                <div>
                                                    <p className="mt-0.5 line-clamp-2 break-words">
                                                        Purpose: {booking.purpose}
                                                    </p>
                                                </div>
                                            </HoverCardContent>
                                        </HoverCard>
                                        </div>
                                    );
                                }
                            )}
                            </div>
                  );
                })}
              </div>
            </div>
          </div>
        </CardContent>

        <CardFooter className="justify-between border-t py-3 text-xs text-muted-foreground">
          <span>
            Showing {sortedBookings.length} bookings
          </span>
          <span>
            {format(currentWeek, "MMM d")} –{" "}
            {format(addDays(currentWeek, 6), "MMM d")}
          </span>
        </CardFooter>
      </Card>

      {/* Add booking dialog */}
      {isAddBookingOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <Card className="max-h-[90vh] w-full max-w-xl gap-0 overflow-y-auto shadow-2xl">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">
                  Book a meeting room
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Select a room, date, and meeting time.
                </p>
              </div>

              <Button
                variant="outline"
                onClick={() => {
                  setIsAddBookingOpen(false);
                  addBookingForm.reset();
                }}
              >
                X
              </Button>
            </CardHeader>

            <CardContent>
              <form
                id="bookingAdd-form"
                className="space-y-4"
                onSubmit={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  addBookingForm.handleSubmit();
                }}
              >
                {/* Room */}
                <Field>
                  <FieldLabel>Meeting room</FieldLabel>

                  <addBookingForm.Field name="room_id">
                    {(field) => (
                      <Select
                        items={rooms
                          .filter((room) => room.is_active)
                          .map((room) => ({
                            label: room.name,
                            value: room.id.toString(),
                          }))}
                        value={
                          field.state.value
                            ? field.state.value.toString()
                            : ""
                        }
                        onValueChange={(value) => {
                          if (value !== null) {
                            field.handleChange(Number(value));
                          }
                        }}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select a room" />
                        </SelectTrigger>

                        <SelectContent>
                          <SelectGroup>
                            <SelectLabel>Available rooms</SelectLabel>

                            {rooms
                              .filter((room) => room.is_active)
                              .map((room) => (
                                <SelectItem
                                  key={room.id}
                                  value={room.id.toString()}
                                >
                                  {room.name}
                                </SelectItem>
                              ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    )}
                  </addBookingForm.Field>
                </Field>

                {/* Date */}
                <Field>
                  <FieldLabel>Meeting date</FieldLabel>

                  <addBookingForm.Field name="booking_date">
                    {(field) => (
                      <Input
                        type="date"
                        value={field.state.value}
                        onChange={(event) =>
                          field.handleChange(event.target.value)
                        }
                        required
                      />
                    )}
                  </addBookingForm.Field>
                </Field>

                {/* Start time */}
                <Field>
                  <FieldLabel>Start time</FieldLabel>

                  <addBookingForm.Field name="start_time">
                    {(field) => (
                      <Input
                        type="time"
                        value={field.state.value}
                        onChange={(event) =>
                          field.handleChange(event.target.value)
                        }
                        required
                      />
                    )}
                  </addBookingForm.Field>
                </Field>

                {/* End time */}
                <Field>
                  <FieldLabel>End time</FieldLabel>

                  <addBookingForm.Field name="end_time">
                    {(field) => (
                      <Input
                        type="time"
                        value={field.state.value}
                        onChange={(event) =>
                          field.handleChange(event.target.value)
                        }
                        required
                      />
                    )}
                  </addBookingForm.Field>
                </Field>

                {/* Purpose */}
                <Field>
                  <FieldLabel>Meeting purpose</FieldLabel>

                  <addBookingForm.Field name="purpose">
                    {(field) => (
                      <Textarea
                        value={field.state.value}
                        onChange={(event) =>
                          field.handleChange(event.target.value)
                        }
                        placeholder="What is the purpose of the meeting?"
                        required
                      />
                    )}
                  </addBookingForm.Field>
                </Field>
              </form>
            </CardContent>

            <CardFooter className="justify-end gap-2 border-t">
              <Button
                variant="outline"
                onClick={() => {
                  setIsAddBookingOpen(false);
                  addBookingForm.reset();
                }}
              >
                Cancel
              </Button>

              <Button
                type="submit"
                form="bookingAdd-form"
                disabled={isPosting}
              >
                {isPosting ? "Booking..." : "Book meeting"}
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}
    </div>
  );
};