import mongoose from "mongoose";
import type { Booking } from "../types.js";

const schema = new mongoose.Schema(
  {
    eventId: { type: String, required: true, index: true },
    attendeeName: { type: String, required: true },
    seats: { type: Number, required: true, min: 1 },
    createdAt: { type: String, required: true },
  },
  { collection: "bookings" },
);

export const BookingModel = mongoose.model("Booking", schema);

export type BookingDoc = {
  _id: mongoose.Types.ObjectId;
  eventId: string;
  attendeeName: string;
  seats: number;
  createdAt: string;
};

export function toBooking(doc: BookingDoc): Booking {
  return {
    id: doc._id.toString(),
    eventId: doc.eventId,
    attendeeName: doc.attendeeName,
    seats: doc.seats,
    createdAt: doc.createdAt,
  };
}
