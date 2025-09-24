import { render, screen } from "@testing-library/react";
import { ThemeForm } from "@/components/theme-form";
import { expect, test, vi } from "vitest";

vi.mock("@/server/artists", () => {
  console.log("Mocking @/server/artists");
  return {
    updateArtistTheme: vi.fn(),
  };
});

const mockArtist = {
  id: "artist-id",
  ownerId: "owner-id",
  name: "Test Artist",
  slug: "test-artist",
  createdAt: new Date(),
  updatedAt: new Date(),
};

test("renders file input and generate button", () => {
  render(<ThemeForm artist={mockArtist} onThemeChange={() => {}} />);

  expect(screen.getByLabelText(/album art/i)).toBeInTheDocument();
  expect(screen.getByRole("button", { name: /generate/i })).toBeInTheDocument();
});
