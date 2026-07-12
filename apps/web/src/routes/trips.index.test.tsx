import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const listMock = vi.fn();
const createMutateMock = vi.fn();

vi.mock("@tanstack/react-router", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@tanstack/react-router")>();
  return {
    ...actual,
    Link: ({ children }: { children: ReactNode }) => <a href="#">{children}</a>,
  };
});

vi.mock("../lib/trpc", () => ({
  trpc: {
    trips: {
      list: {
        queryOptions: () => ({
          queryKey: ["trips.list"],
          queryFn: listMock,
        }),
        queryKey: () => ["trips.list"],
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

const { Trips } = await import("./trips.index");

function renderWithQueryClient() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <Trips />
    </QueryClientProvider>,
  );
}

describe("Trips", () => {
  it("renders the list of trips from the query", async () => {
    listMock.mockResolvedValue([
      {
        id: "1",
        name: "Mexico City",
        destination: "Mexico City, Mexico",
        startDate: "2026-08-15T00:00:00.000Z",
        endDate: "2026-08-22T00:00:00.000Z",
      },
    ]);

    renderWithQueryClient();

    expect(await screen.findByText(/Mexico City/)).toBeInTheDocument();
  });

  it("shows an empty state when there are no trips", async () => {
    listMock.mockResolvedValue([]);

    renderWithQueryClient();

    expect(await screen.findByText(/no trips yet/i)).toBeInTheDocument();
  });

  it("submits the create trip form with the entered values", async () => {
    listMock.mockResolvedValue([]);
    createMutateMock.mockReturnValue([{ id: "2" }]);

    const user = userEvent.setup();
    renderWithQueryClient();

    await screen.findByText(/no trips yet/i);

    await user.type(screen.getByLabelText(/^name$/i), "Mexico City");
    await user.type(screen.getByLabelText(/destination/i), "Mexico City, Mexico");
    await user.type(screen.getByLabelText(/start date/i), "2026-08-15");
    await user.type(screen.getByLabelText(/end date/i), "2026-08-22");
    await user.click(screen.getByRole("button", { name: /create trip/i }));

    await waitFor(() => expect(createMutateMock).toHaveBeenCalledTimes(1));
    expect(createMutateMock).toHaveBeenCalledWith(
      expect.objectContaining({ name: "Mexico City", destination: "Mexico City, Mexico" }),
    );
  });
});
