import "dotenv/config";
import axios from "axios";
import cors from "cors";
import express from "express";
import mongoose from "mongoose";
import { connectDb } from "./db.js";
import { BookingModel, toBooking, type BookingDoc } from "./models/booking.js";
import type { CreateBookingBody } from "./types.js";

const app = express();
const PORT = Number(process.env.PORT) || 3002;
const EVENT_SERVICE_URL = (process.env.EVENT_SERVICE_URL || "http://localhost:3001").replace(/\/$/, "");

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "booking-service", db: "mongodb" });
});

app.get("/bookings", async (_req, res) => {
  try {
    const docs = await BookingModel.find().sort({ _id: -1 }).lean().exec();
    res.json(docs.map((d) => toBooking(d as BookingDoc)));
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to list bookings" });
  }
});

app.get("/bookings/:id", async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ error: "Booking not found" });
    }
    const doc = await BookingModel.findById(req.params.id).lean().exec();
    if (!doc) return res.status(404).json({ error: "Booking not found" });
    res.json(toBooking(doc as BookingDoc));
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to load booking" });
  }
});

app.post("/bookings", async (req, res) => {
  const body = req.body as CreateBookingBody;
  if (!body?.eventId || !body?.attendeeName || body?.seats == null) {
    return res.status(400).json({ error: "eventId, attendeeName, and seats are required" });
  }
  if (body.seats < 1) {
    return res.status(400).json({ error: "seats must be at least 1" });
  }
  try {
    await axios.get(`${EVENT_SERVICE_URL}/events/${body.eventId}`, { timeout: 5000 });
  } catch {
    return res.status(400).json({ error: "Invalid or unavailable event" });
  }
  const createdAt = new Date().toISOString();
  try {
    const created = await BookingModel.create({
      eventId: body.eventId,
      attendeeName: body.attendeeName,
      seats: body.seats,
      createdAt,
    });
    res.status(201).json(
      toBooking({
        _id: created._id as mongoose.Types.ObjectId,
        eventId: created.eventId,
        attendeeName: created.attendeeName,
        seats: created.seats,
        createdAt: created.createdAt,
      }),
    );
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to create booking" });
  }
});

async function main() {
  await connectDb();
  app.listen(PORT, () => {
    console.log(`booking-service listening on ${PORT} (events at ${EVENT_SERVICE_URL})`);
  });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
