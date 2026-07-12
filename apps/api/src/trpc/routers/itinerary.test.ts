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

const tripId = "b3f1e2b0-5c2a-4b8a-9e3a-0f1a2b3c4d5f";
const userId = "user_1";

function authedCaller() {
  return appRouter.createCaller({
    session: { user: { id: userId }, session: {} },
  } as never);
}

function anonCaller() {
  return appRouter.createCaller({ session: null } as never);
}

function mockOwnershipCheck(owned: boolean) {
  const where = vi.fn().mockResolvedValue(owned ? [{ id: tripId }] : []);
  const from = vi.fn().mockReturnValue({ where });
  selectMock.mockReturnValueOnce({ from });
}

describe("itineraryRouter", () => {
  beforeEach(() => {
    selectMock.mockReset();
    insertMock.mockReset();
  });

  it("rejects unauthenticated requests before touching the db", async () => {
    await expect(
      anonCaller().itinerary.listByTrip({ tripId }),
    ).rejects.toThrow();

    expect(selectMock).not.toHaveBeenCalled();
  });

  it("listByTrip rejects a non-uuid tripId before touching the db", async () => {
    await expect(
      authedCaller().itinerary.listByTrip({ tripId: "not-a-uuid" }),
    ).rejects.toThrow();

    expect(selectMock).not.toHaveBeenCalled();
  });

  it("listByTrip rejects when the trip isn't owned by the caller", async () => {
    mockOwnershipCheck(false);

    await expect(
      authedCaller().itinerary.listByTrip({ tripId }),
    ).rejects.toThrow();

    expect(selectMock).toHaveBeenCalledTimes(1);
  });

  it("listByTrip queries the db with a valid, owned tripId", async () => {
    mockOwnershipCheck(true);

    const where = vi.fn().mockResolvedValue([]);
    const from = vi.fn().mockReturnValue({ where });
    selectMock.mockReturnValueOnce({ from });

    const result = await authedCaller().itinerary.listByTrip({ tripId });

    expect(result).toEqual([]);
    expect(selectMock).toHaveBeenCalledTimes(2);
  });

  it("create rejects an empty title before touching the db", async () => {
    await expect(
      authedCaller().itinerary.create({
        tripId,
        title: "",
        startTime: "2026-08-15T14:00:00.000Z",
        endTime: null,
        location: null,
        notes: null,
      }),
    ).rejects.toThrow();

    expect(insertMock).not.toHaveBeenCalled();
    expect(selectMock).not.toHaveBeenCalled();
  });

  it("create rejects when the trip isn't owned by the caller", async () => {
    mockOwnershipCheck(false);

    await expect(
      authedCaller().itinerary.create({
        tripId,
        title: "Tacos at El Huequito",
        startTime: "2026-08-16T20:00:00.000Z",
        endTime: null,
        location: null,
        notes: null,
      }),
    ).rejects.toThrow();

    expect(insertMock).not.toHaveBeenCalled();
  });
});
