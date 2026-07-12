import { render, screen } from "@testing-library/react-native";
import { ThemedText } from "./themed-text";

describe("ThemedText", () => {
  it("renders its children", async () => {
    await render(<ThemedText>Mexico City</ThemedText>);
    expect(screen.getByText("Mexico City")).toBeTruthy();
  });

  it("applies the title style when type is title", async () => {
    await render(<ThemedText type="title">Itinerary</ThemedText>);
    const node = screen.getByText("Itinerary");
    const flatStyle = Array.isArray(node.props.style)
      ? Object.assign({}, ...node.props.style.flat(Infinity).filter(Boolean))
      : node.props.style;
    expect(flatStyle.fontSize).toBe(48);
  });
});
