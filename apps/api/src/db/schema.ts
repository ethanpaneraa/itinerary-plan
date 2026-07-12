import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const trips = pgTable("trips", {
  id: uuid("id").primaryKey().defaultRandom(),
  ownerId: text("owner_id").notNull(),
  name: text("name").notNull(),
  destination: text("destination").notNull(),
  startDate: timestamp("start_date", { withTimezone: true, mode: "string" }).notNull(),
  endDate: timestamp("end_date", { withTimezone: true, mode: "string" }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
    .defaultNow()
    .notNull(),
});

export const itineraryItems = pgTable("itinerary_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  tripId: uuid("trip_id")
    .references(() => trips.id, { onDelete: "cascade" })
    .notNull(),
  title: text("title").notNull(),
  startTime: timestamp("start_time", { withTimezone: true, mode: "string" }).notNull(),
  endTime: timestamp("end_time", { withTimezone: true, mode: "string" }),
  location: text("location"),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
    .defaultNow()
    .notNull(),
});
