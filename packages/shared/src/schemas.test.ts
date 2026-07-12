import { describe, expect, it } from "vitest";
import { createItineraryItemSchema, itineraryItemSchema } from "./schemas";

describe("itineraryItemSchema", () => {
  const valid = {
    id: "b3f1e2b0-5c2a-4b8a-9e3a-0f1a2b3c4d5e",
    tripId: "b3f1e2b0-5c2a-4b8a-9e3a-0f1a2b3c4d5f",
    title: "Visit Frida Kahlo Museum",
    startTime: "2026-08-15T14:00:00.000Z",
    endTime: "2026-08-15T16:00:00.000Z",
    location: "Coyoacán",
    notes: null,
  };

  it("accepts a valid itinerary item", () => {
    expect(itineraryItemSchema.parse(valid)).toEqual(valid);
  });

  it("rejects a missing title", () => {
    expect(() =>
      itineraryItemSchema.parse({ ...valid, title: "" }),
    ).toThrow();
  });

  it("rejects a non-uuid id", () => {
    expect(() =>
      itineraryItemSchema.parse({ ...valid, id: "not-a-uuid" }),
    ).toThrow();
  });

  it("allows a null endTime", () => {
    expect(() =>
      itineraryItemSchema.parse({ ...valid, endTime: null }),
    ).not.toThrow();
  });
});

describe("createItineraryItemSchema", () => {
  it("omits id from the required fields", () => {
    const { id: _id, ...withoutId } = {
      id: "b3f1e2b0-5c2a-4b8a-9e3a-0f1a2b3c4d5e",
      tripId: "b3f1e2b0-5c2a-4b8a-9e3a-0f1a2b3c4d5f",
      title: "Tacos at El Huequito",
      startTime: "2026-08-16T20:00:00.000Z",
      endTime: null,
      location: "Centro Histórico",
      notes: null,
    };

    expect(() => createItineraryItemSchema.parse(withoutId)).not.toThrow();
  });
});
