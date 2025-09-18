import { describe, it, expect, beforeEach, afterEach, mock } from "bun:test";

const mockDb = {
  query: {
    artists: {
      findFirst: mock(),
    },
  },
};

const mockRevalidatePath = mock();

mock.module("next/cache", () => ({
  revalidatePath: mockRevalidatePath,
}));

mock.module("@/db/client", () => ({
  db: mockDb,
}));

mock.module("@/server/errors/error-handler", () => ({
  withErrorHandler: (fn: any) => fn,
}));

mock.module("server-only", () => ({}));

const { getArtistByHandle } = await import("@/server/artists");

describe("getArtistByHandle", () => {
  beforeEach(() => {
    mockDb.query.artists.findFirst.mockClear();
    mockRevalidatePath.mockClear();
  });

  afterEach(() => {
    mock.restore();
  });

  it("should return artist for valid handle", async () => {
    const mockArtist = {
      id: "artist-123",
      slug: "testartist",
      name: "Test Artist",
      description: "Test description",
      links: [],
    };

    mockDb.query.artists.findFirst.mockResolvedValue(mockArtist);

    const result = await getArtistByHandle("testartist");

    expect(result).toEqual(mockArtist);
    expect(mockDb.query.artists.findFirst).toHaveBeenCalled();
  });

  it("should throw NotFoundError for invalid handle", async () => {
    mockDb.query.artists.findFirst.mockResolvedValue(null);

    await expect(getArtistByHandle("nonexistent")).rejects.toThrow();
  });

  it("should throw NotFoundError for empty handle", async () => {
    await expect(getArtistByHandle("")).rejects.toThrow();
  });

  it("should handle subdomain handles correctly", async () => {
    const mockArtist = {
      id: "artist-123",
      slug: "devdugg",
      name: "DevDugg",
      description: "Developer profile",
      links: [],
    };

    mockDb.query.artists.findFirst.mockResolvedValue(mockArtist);

    const result = await getArtistByHandle("devdugg");

    expect(result.slug).toBe("devdugg");
    expect(result.name).toBe("DevDugg");
  });

  it("should include links with proper ordering", async () => {
    const mockArtist = {
      id: "artist-123",
      slug: "testartist",
      name: "Test Artist",
      links: [
        { id: "link-1", order: 1, label: "First Link" },
        { id: "link-2", order: 2, label: "Second Link" },
      ],
    };

    mockDb.query.artists.findFirst.mockResolvedValue(mockArtist);

    const result = await getArtistByHandle("testartist");

    expect(result.links).toHaveLength(2);
    expect(result.links[0].order).toBe(1);
    expect(result.links[1].order).toBe(2);
  });
});
