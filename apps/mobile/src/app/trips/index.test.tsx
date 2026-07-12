import { render, screen, fireEvent, waitFor } from "@testing-library/react-native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const mockList = jest.fn();
const mockCreateTrip = jest.fn();

jest.mock("@/lib/trpc", () => ({
  trpc: {
    trips: {
      list: {
        queryOptions: () => ({
          queryKey: ["trips.list"],
          queryFn: mockList,
        }),
        queryKey: () => ["trips.list"],
      },
      create: {
        mutationOptions: (opts: { onSuccess?: () => void }) => ({
          mutationFn: async (input: unknown) => {
            const result = mockCreateTrip(input);
            opts.onSuccess?.();
            return result;
          },
        }),
      },
    },
  },
}));

const TripsScreen = require("./index").default;

async function renderWithQueryClient() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <TripsScreen />
    </QueryClientProvider>,
  );
}

describe("TripsScreen", () => {
  beforeEach(() => {
    mockList.mockReset();
    mockCreateTrip.mockReset();
  });

  it("renders the list of trips from the query", async () => {
    mockList.mockResolvedValue([
      {
        id: "1",
        name: "Mexico City",
        destination: "Mexico City, Mexico",
        startDate: "2026-08-15T00:00:00.000Z",
        endDate: "2026-08-22T00:00:00.000Z",
      },
    ]);

    await renderWithQueryClient();

    expect(await screen.findByText("Mexico City")).toBeTruthy();
  });

  it("shows an empty state when there are no trips", async () => {
    mockList.mockResolvedValue([]);

    await renderWithQueryClient();

    expect(await screen.findByText(/no trips yet/i)).toBeTruthy();
  });

  it("submits the create trip form with the entered values", async () => {
    mockList.mockResolvedValue([]);
    mockCreateTrip.mockReturnValue([{ id: "2" }]);

    await renderWithQueryClient();

    await screen.findByText(/no trips yet/i);

    await fireEvent.changeText(screen.getByTestId("name-input"), "Mexico City");
    await fireEvent.changeText(
      screen.getByTestId("destination-input"),
      "Mexico City, Mexico",
    );
    await fireEvent.changeText(screen.getByTestId("start-date-input"), "2026-08-15");
    await fireEvent.changeText(screen.getByTestId("end-date-input"), "2026-08-22");
    await fireEvent.press(screen.getByTestId("create-trip-button"));

    await waitFor(() => expect(mockCreateTrip).toHaveBeenCalledTimes(1));
    expect(mockCreateTrip).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "Mexico City",
        destination: "Mexico City, Mexico",
      }),
    );
  });
});
