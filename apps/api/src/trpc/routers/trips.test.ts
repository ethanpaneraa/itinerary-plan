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

const userId = "user_1";

function authedCaller() {
  return appRouter.createCaller({
    session: { user: { id: userId }, session: {} },
  } as never);
}

function anonCaller() {
  return appRouter.createCaller({ session: null } as never);
}

describe("tripsRouter", () => {
  beforeEach(() => {
    selectMock.mockReset();
    insertMock.mockReset();
  });

  it("rejects unauthenticated requests before touching the db", async () => {
    await expect(anonCaller().trips.list()).rejects.toThrow();
    expect(selectMock).not.toHaveBeenCalled();
  });

  it("list scopes the query to the caller's ownerId", async () => {
    const where = vi.fn().mockResolvedValue([]);
    const from = vi.fn().mockReturnValue({ where });
    selectMock.mockReturnValue({ from });

    const result = await authedCaller().trips.list();

    expect(result).toEqual([]);
    expect(where).toHaveBeenCalledTimes(1);
  });

  it("create rejects an empty destination before touching the db", async () => {
    await expect(
      authedCaller().trips.create({
        name: "Mexico City",
        destination: "",
        startDate: "2026-08-15T00:00:00.000Z",
        endDate: "2026-08-22T00:00:00.000Z",
      }),
    ).rejects.toThrow();

    expect(insertMock).not.toHaveBeenCalled();
  });

  it("create inserts the trip with ownerId set from the session, not the input", async () => {
    const returning = vi
      .fn()
      .mockResolvedValue([{ id: "trip_1", ownerId: userId }]);
    const values = vi.fn().mockReturnValue({ returning });
    insertMock.mockReturnValue({ values });

    await authedCaller().trips.create({
      name: "Mexico City",
      destination: "Mexico City, Mexico",
      startDate: "2026-08-15T00:00:00.000Z",
      endDate: "2026-08-22T00:00:00.000Z",
    });

    expect(values).toHaveBeenCalledWith(
      expect.objectContaining({ ownerId: userId }),
    );
  });
});
