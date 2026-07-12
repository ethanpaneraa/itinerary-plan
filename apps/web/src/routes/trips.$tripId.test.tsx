import { describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const listByTripMock = vi.fn();
const createMutateMock = vi.fn();
const tripId = "b3f1e2b0-5c2a-4b8a-9e3a-0f1a2b3c4d5f";

vi.mock("../lib/trpc", () => ({
  trpc: {
    itinerary: {
      listByTrip: {
        queryOptions: () => ({
          queryKey: ["itinerary.listByTrip", tripId],
          queryFn: listByTripMock,
        }),
        queryKey: () => ["itinerary.listByTrip", tripId],
      },
      create: {
        mutationOptions: (opts: { onSuccess?: () => void }) => ({
          mutationFn: async (input: unknown) => {
            const result = createMutateMock(input);
            opts.onSuccess?.();
            return result;
          },
        }),
      },
    },
  },
}));

const { TripDetail, Route } = await import("./trips.$tripId");

vi.spyOn(Route, "useParams").mockReturnValue({ tripId });

function renderWithQueryClient() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <TripDetail />
    </QueryClientProvider>,
  );
}

describe("TripDetail", () => {
  it("renders itinerary items sorted by start time", async () => {
    listByTripMock.mockResolvedValue([
      {
        id: "1",
        tripId,
        title: "Dinner",
        startTime: "2026-08-15T20:00:00.000Z",
        endTime: null,
        location: null,
        notes: null,
      },
      {
        id: "2",
        tripId,
        title: "Museum",
        startTime: "2026-08-15T10:00:00.000Z",
        endTime: null,
        location: "Coyoacán",
        notes: null,
      },
    ]);

    renderWithQueryClient();

    const items = await screen.findAllByRole("listitem");
    expect(items[0]).toHaveTextContent("Museum");
    expect(items[1]).toHaveTextContent("Dinner");
  });

  it("shows an empty state when there are no itinerary items", async () => {
    listByTripMock.mockResolvedValue([]);

    renderWithQueryClient();

    expect(await screen.findByText(/no itinerary items yet/i)).toBeInTheDocument();
  });

  it("submits the create itinerary item form with the entered values", async () => {
    listByTripMock.mockResolvedValue([]);
    createMutateMock.mockReturnValue([{ id: "2" }]);

    const user = userEvent.setup();
    renderWithQueryClient();

    await screen.findByText(/no itinerary items yet/i);

    await user.type(screen.getByLabelText(/title/i), "Visit Frida Kahlo Museum");
    await user.type(screen.getByLabelText(/start time/i), "2026-08-15T10:00");
    await user.type(screen.getByLabelText(/location/i), "Coyoacán");
    await user.click(screen.getByRole("button", { name: /add item/i }));

    await waitFor(() => expect(createMutateMock).toHaveBeenCalledTimes(1));
    expect(createMutateMock).toHaveBeenCalledWith(
      expect.objectContaining({
        tripId,
        title: "Visit Frida Kahlo Museum",
        location: "Coyoacán",
      }),
    );
  });
});
