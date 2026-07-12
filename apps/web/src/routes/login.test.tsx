import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const navigateMock = vi.fn();
const signInEmailMock = vi.fn();

vi.mock("@tanstack/react-router", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@tanstack/react-router")>();
  return { ...actual, useNavigate: () => navigateMock };
});

vi.mock("../lib/auth-client", () => ({
  authClient: {
    signIn: { email: signInEmailMock },
  },
}));

const { Login } = await import("./login");

describe("Login", () => {
  beforeEach(() => {
    navigateMock.mockReset();
    signInEmailMock.mockReset();
  });

  it("navigates to /trips on successful sign in", async () => {
    signInEmailMock.mockResolvedValue({ error: null });
    const user = userEvent.setup();
    render(<Login />);

    await user.type(screen.getByLabelText(/email/i), "test@example.com");
    await user.type(screen.getByLabelText(/password/i), "password123");
    await user.click(screen.getByRole("button", { name: /log in/i }));

    expect(signInEmailMock).toHaveBeenCalledWith({
      email: "test@example.com",
      password: "password123",
    });
    expect(navigateMock).toHaveBeenCalledWith({ to: "/trips" });
  });

  it("shows an error and does not navigate on failed sign in", async () => {
    signInEmailMock.mockResolvedValue({
      error: { message: "Invalid credentials" },
    });
    const user = userEvent.setup();
    render(<Login />);

    await user.type(screen.getByLabelText(/email/i), "test@example.com");
    await user.type(screen.getByLabelText(/password/i), "wrong-password");
    await user.click(screen.getByRole("button", { name: /log in/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Invalid credentials",
    );
    expect(navigateMock).not.toHaveBeenCalled();
  });
});
