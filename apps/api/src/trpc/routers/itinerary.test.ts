import { beforeEach, describe, expect, it, vi } from "vitest";

const { selectMock, insertMock } = vi.hoisted(() => ({
  selectMock: vi.fn(),
  insertMock: vi.fn(),
}));

vi.mock("../../db/client.js", () => ({
  db: {
    select: selectMock,
    insert: insertMock,
  },
}));

const { appRouter } = await import("../router.js");

describe("itineraryRouter", () => {
  beforeEach(() => {
    selectMock.mockReset();
    insertMock.mockReset();
  });

  it("listByTrip rejects a non-uuid tripId before touching the db", async () => {
    const caller = appRouter.createCaller({} as never);

    await expect(
      caller.itinerary.listByTrip({ tripId: "not-a-uuid" }),
    ).rejects.toThrow();

    expect(selectMock).not.toHaveBeenCalled();
  });

  it("listByTrip queries the db with a valid tripId", async () => {
    const tripId = "b3f1e2b0-5c2a-4b8a-9e3a-0f1a2b3c4d5f";
    const where = vi.fn().mockResolvedValue([]);
    const from = vi.fn().mockReturnValue({ where });
    selectMock.mockReturnValue({ from });

    const caller = appRouter.createCaller({} as never);
    const result = await caller.itinerary.listByTrip({ tripId });

    expect(result).toEqual([]);
    expect(selectMock).toHaveBeenCalledTimes(1);
    expect(from).toHaveBeenCalledTimes(1);
    expect(where).toHaveBeenCalledTimes(1);
  });

  it("create rejects an empty title before touching the db", async () => {
    const caller = appRouter.createCaller({} as never);

    await expect(
      caller.itinerary.create({
        tripId: "b3f1e2b0-5c2a-4b8a-9e3a-0f1a2b3c4d5f",
        title: "",
        startTime: "2026-08-15T14:00:00.000Z",
        endTime: null,
        location: null,
        notes: null,
      }),
    ).rejects.toThrow();

    expect(insertMock).not.toHaveBeenCalled();
  });
});
