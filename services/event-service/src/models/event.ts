import mongoose from "mongoose";
import type { Event } from "../types.js";

const schema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    date: { type: String, required: true },
    venue: { type: String, required: true },
  },
  { collection: "events" },
);

export const EventModel = mongoose.model("Event", schema);

export type EventDoc = {
  _id: mongoose.Types.ObjectId;
  title: string;
  date: string;
  venue: string;
};

export function toEvent(doc: EventDoc): Event {
  return {
    id: doc._id.toString(),
    title: doc.title,
    date: doc.date,
    venue: doc.venue,
  };
}
