import { render, screen, fireEvent, waitFor } from "@testing-library/react-native";

const mockReplace = jest.fn();
const mockSignInEmail = jest.fn();

jest.mock("expo-router", () => ({
  router: { replace: mockReplace },
}));

jest.mock("@/lib/auth-client", () => ({
  authClient: {
    signIn: { email: mockSignInEmail },
  },
}));

const LoginScreen = require("./login").default;

describe("LoginScreen", () => {
  beforeEach(() => {
    mockReplace.mockReset();
    mockSignInEmail.mockReset();
  });

  it("navigates to /trips on successful sign in", async () => {
    mockSignInEmail.mockResolvedValue({ error: null });

    await render(<LoginScreen />);

    await fireEvent.changeText(screen.getByTestId("email-input"), "test@example.com");
    await fireEvent.changeText(screen.getByTestId("password-input"), "password123");
    await fireEvent.press(screen.getByTestId("login-button"));

    await waitFor(() => {
      expect(mockSignInEmail).toHaveBeenCalledWith({
        email: "test@example.com",
        password: "password123",
      });
    });
    expect(mockReplace).toHaveBeenCalledWith("/trips");
  });

  it("shows an error and does not navigate on failed sign in", async () => {
    mockSignInEmail.mockResolvedValue({
      error: { message: "Invalid credentials" },
    });

    await render(<LoginScreen />);

    await fireEvent.changeText(screen.getByTestId("email-input"), "test@example.com");
    await fireEvent.changeText(screen.getByTestId("password-input"), "wrong-password");
    await fireEvent.press(screen.getByTestId("login-button"));

    expect(await screen.findByTestId("error-text")).toHaveTextContent(
      "Invalid credentials",
    );
    expect(mockReplace).not.toHaveBeenCalled();
  });
});
