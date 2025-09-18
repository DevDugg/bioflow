import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

const mockGetArtistByHandle = vi.fn();
const mockGenerateSeo = vi.fn();

vi.mock("@/server/artists", () => ({
  getArtistByHandle: mockGetArtistByHandle,
}));

vi.mock("@/lib/seo", () => ({
  generateSeo: mockGenerateSeo,
}));

vi.mock("next/navigation", () => ({
  notFound: vi.fn(),
}));

describe("Subdomain Profile Page", () => {
  const mockArtist = {
    id: "artist-123",
    slug: "devdugg",
    name: "DevDugg",
    description: "Developer profile",
    image: "https://example.com/avatar.jpg",
    theme: {
      background: "#000000",
      foreground: "#ffffff",
    },
    links: [
      {
        id: "link-1",
        label: "GitHub",
        url: "https://github.com/devdugg",
        icon: "github",
        order: 1,
      },
    ],
  };

  const mockMetadata = {
    title: "DevDugg | Bioflow",
    description: "Developer profile",
    openGraph: {
      title: "DevDugg",
      description: "Developer profile",
      url: "https://devdugg.bioflow.app",
    },
  };

  const mockJsonLd = (
    <script type="application/ld+json">
      {JSON.stringify({ "@context": "https://schema.org" })}
    </script>
  );

  beforeEach(() => {
    mockGetArtistByHandle.mockClear();
    mockGenerateSeo.mockClear();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("generateMetadata", () => {
    it("should generate correct metadata for subdomain profile", async () => {
      mockGetArtistByHandle.mockResolvedValue(mockArtist);
      mockGenerateSeo.mockReturnValue({
        metadata: mockMetadata,
        jsonLd: mockJsonLd,
      });

      const { generateMetadata } = await import(
        "@/app/subdomain/[handle]/page"
      );

      const result = await generateMetadata({
        params: { handle: "devdugg" },
      });

      expect(result).toEqual(mockMetadata);
      expect(mockGenerateSeo).toHaveBeenCalledWith({
        title: "DevDugg",
        description: "Developer profile",
        url: "https://devdugg.bioflow.app",
        links: mockArtist.links,
        handle: "devdugg",
      });
    });

    it("should handle missing artist", async () => {
      mockGetArtistByHandle.mockResolvedValue(null);

      const { generateMetadata } = await import(
        "@/app/subdomain/[handle]/page"
      );

      const result = await generateMetadata({
        params: { handle: "nonexistent" },
      });

      expect(result).toEqual({
        title: "Not Found",
      });
    });

    it("should generate subdomain URL correctly", async () => {
      mockGetArtistByHandle.mockResolvedValue(mockArtist);
      mockGenerateSeo.mockReturnValue({
        metadata: mockMetadata,
        jsonLd: mockJsonLd,
      });

      const { generateMetadata } = await import(
        "@/app/subdomain/[handle]/page"
      );

      await generateMetadata({
        params: { handle: "devdugg" },
      });

      expect(mockGenerateSeo).toHaveBeenCalledWith(
        expect.objectContaining({
          url: "https://devdugg.bioflow.app",
        })
      );
    });
  });

  describe("SubdomainArtistPage component", () => {
    it("should generate subdomain URL correctly", async () => {
      mockGetArtistByHandle.mockResolvedValue(mockArtist);
      mockGenerateSeo.mockReturnValue({
        metadata: mockMetadata,
        jsonLd: mockJsonLd,
      });

      const { generateMetadata } = await import(
        "@/app/subdomain/[handle]/page"
      );

      await generateMetadata({
        params: { handle: "devdugg" },
      });

      expect(mockGenerateSeo).toHaveBeenCalledWith(
        expect.objectContaining({
          url: "https://devdugg.bioflow.app",
        })
      );
    });

    it("should handle artist without theme", async () => {
      const artistWithoutTheme = { ...mockArtist, theme: null };
      mockGetArtistByHandle.mockResolvedValue(artistWithoutTheme);
      mockGenerateSeo.mockReturnValue({
        metadata: mockMetadata,
        jsonLd: mockJsonLd,
      });

      const { generateMetadata } = await import(
        "@/app/subdomain/[handle]/page"
      );

      await generateMetadata({
        params: { handle: "devdugg" },
      });

      expect(mockGenerateSeo).toHaveBeenCalled();
    });

    it("should handle artist without description", async () => {
      const artistWithoutDescription = { ...mockArtist, description: null };
      mockGetArtistByHandle.mockResolvedValue(artistWithoutDescription);
      mockGenerateSeo.mockReturnValue({
        metadata: mockMetadata,
        jsonLd: mockJsonLd,
      });

      const { generateMetadata } = await import(
        "@/app/subdomain/[handle]/page"
      );

      await generateMetadata({
        params: { handle: "devdugg" },
      });

      expect(mockGenerateSeo).toHaveBeenCalledWith(
        expect.objectContaining({
          description: undefined,
        })
      );
    });
  });

  describe("Error states", () => {
    it("should handle not found response", async () => {
      mockGetArtistByHandle.mockResolvedValue(new Response());

      const { generateMetadata } = await import(
        "@/app/subdomain/[handle]/page"
      );

      const result = await generateMetadata({
        params: { handle: "nonexistent" },
      });

      expect(result).toEqual({
        title: "Not Found",
      });
    });
  });
});
