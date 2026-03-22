import "dotenv/config";
import cors from "cors";
import express from "express";
import mongoose from "mongoose";
import { connectDb } from "./db.js";
import { EventModel, toEvent, type EventDoc } from "./models/event.js";
import type { CreateEventBody } from "./types.js";

const app = express();
const PORT = Number(process.env.PORT) || 3001;

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "event-service", db: "mongodb" });
});

app.get("/events", async (_req, res) => {
  try {
    const docs = await EventModel.find().sort({ _id: -1 }).lean().exec();
    res.json(docs.map((d) => toEvent(d as EventDoc)));
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to list events" });
  }
});

app.get("/events/:id", async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ error: "Event not found" });
    }
    const doc = await EventModel.findById(req.params.id).lean().exec();
    if (!doc) return res.status(404).json({ error: "Event not found" });
    res.json(toEvent(doc as EventDoc));
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to load event" });
  }
});

app.post("/events", async (req, res) => {
  const body = req.body as CreateEventBody;
  if (!body?.title || !body?.date || !body?.venue) {
    return res.status(400).json({ error: "title, date, and venue are required" });
  }
  try {
    const created = await EventModel.create({
      title: body.title,
      date: body.date,
      venue: body.venue,
    });
    res.status(201).json(
      toEvent({
        _id: created._id as mongoose.Types.ObjectId,
        title: created.title,
        date: created.date,
        venue: created.venue,
      }),
    );
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to create event" });
  }
});

async function main() {
  await connectDb();
  app.listen(PORT, () => {
    console.log(`event-service listening on ${PORT}`);
  });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
