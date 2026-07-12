import { render, screen, fireEvent, waitFor } from "@testing-library/react-native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const mockListByTrip = jest.fn();
const mockCreateItem = jest.fn();
const tripId = "b3f1e2b0-5c2a-4b8a-9e3a-0f1a2b3c4d5f";

jest.mock("expo-router", () => ({
  useLocalSearchParams: () => ({ tripId }),
}));

jest.mock("@/lib/trpc", () => ({
  trpc: {
    itinerary: {
      listByTrip: {
        queryOptions: () => ({
          queryKey: ["itinerary.listByTrip", tripId],
          queryFn: mockListByTrip,
        }),
        queryKey: () => ["itinerary.listByTrip", tripId],
      },
      create: {
        mutationOptions: (opts: { onSuccess?: () => void }) => ({
          mutationFn: async (input: unknown) => {
            const result = mockCreateItem(input);
            opts.onSuccess?.();
            return result;
          },
        }),
      },
    },
  },
}));

const TripDetailScreen = require("./[tripId]").default;

async function renderWithQueryClient() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <TripDetailScreen />
    </QueryClientProvider>,
  );
}

describe("TripDetailScreen", () => {
  beforeEach(() => {
    mockListByTrip.mockReset();
    mockCreateItem.mockReset();
  });

  it("renders itinerary items sorted by start time", async () => {
    mockListByTrip.mockResolvedValue([
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

    await renderWithQueryClient();

    expect(await screen.findByText("Museum")).toBeTruthy();
    expect(await screen.findByText("Dinner")).toBeTruthy();
  });

  it("shows an empty state when there are no itinerary items", async () => {
    mockListByTrip.mockResolvedValue([]);

    await renderWithQueryClient();

    expect(await screen.findByText(/no itinerary items yet/i)).toBeTruthy();
  });

  it("submits the create itinerary item form with the entered values", async () => {
    mockListByTrip.mockResolvedValue([]);
    mockCreateItem.mockReturnValue([{ id: "2" }]);

    await renderWithQueryClient();

    await screen.findByText(/no itinerary items yet/i);

    await fireEvent.changeText(
      screen.getByTestId("title-input"),
      "Visit Frida Kahlo Museum",
    );
    await fireEvent.changeText(
      screen.getByTestId("start-time-input"),
      "2026-08-15T10:00",
    );
    await fireEvent.changeText(screen.getByTestId("location-input"), "Coyoacán");
    await fireEvent.press(screen.getByTestId("add-item-button"));

    await waitFor(() => expect(mockCreateItem).toHaveBeenCalledTimes(1));
    expect(mockCreateItem).toHaveBeenCalledWith(
      expect.objectContaining({
        tripId,
        title: "Visit Frida Kahlo Museum",
        location: "Coyoacán",
      }),
    );
  });
});
