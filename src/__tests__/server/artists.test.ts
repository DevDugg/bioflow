import { describe, it, expect, beforeEach, afterEach, vi, test } from "vitest";
import { mockDb, setupMocks, clearMocks } from "../shared-mocks";
import { getArtistByHandle, uploadAlbumArt } from "@/server/artists";

const mockSupabase = {
  storage: {
    from: vi.fn().mockReturnThis(),
    upload: vi.fn().mockResolvedValue({ error: null }),
    getPublicUrl: vi.fn().mockReturnValue({
      data: {
        publicUrl: "http://example.com/album.jpg",
      },
    }),
  },
};

vi.mock("../../../supabase/admin", () => ({
  createSupabaseAdminClient: vi.fn(() => mockSupabase),
}));

setupMocks();

describe("getArtistByHandle", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    clearMocks();
  });

  it("should return artist for valid handle", async () => {
    const handle = "test-artist";
    mockDb.query.artists.findFirst.mockResolvedValue({
      id: "1",
      name: "Test Artist",
      slug: handle,
    });

    const artist = await getArtistByHandle(handle);

    expect(artist).toBeDefined();
    expect(artist.slug).toBe(handle);
    expect(mockDb.query.artists.findFirst).toHaveBeenCalledWith({
      where: expect.any(Object),
      with: {
        links: {
          orderBy: expect.any(Function),
        },
      },
    });
  });

  it("should throw NotFoundError for invalid handle", async () => {
    const handle = "non-existent-artist";
    mockDb.query.artists.findFirst.mockResolvedValue(null);

    await expect(getArtistByHandle(handle)).rejects.toThrow("Route not found");
  });

  it("should throw NotFoundError for empty handle", async () => {
    await expect(getArtistByHandle("")).rejects.toThrow("Route not found");
  });

  it("should handle subdomain handles correctly", async () => {
    const handle = "sub.domain";
    mockDb.query.artists.findFirst.mockResolvedValue({ slug: handle });
    const artist = await getArtistByHandle(handle);
    expect(artist.slug).toBe(handle);
  });

  it("should include links with proper ordering", async () => {
    const handle = "artist-with-links";
    const mockArtistWithLinks = {
      slug: handle,
      links: [
        { id: "1", order: 1 },
        { id: "2", order: 2 },
      ],
    };
    mockDb.query.artists.findFirst.mockResolvedValue(mockArtistWithLinks);

    const artist = await getArtistByHandle(handle);
    expect(artist.links).toBeDefined();
    expect(artist.links.length).toBe(2);
  });
});

describe("uploadAlbumArt", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    const mockUpdate = {
      set: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      returning: vi.fn().mockResolvedValue([{ slug: "test-artist" }]),
    };
    mockDb.update.mockReturnValue(mockUpdate);
  });

  test("should upload a file and update the artist", async () => {
    const formData = new FormData();
    formData.append("id", "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11");
    const file = new File([""], "album.jpg", { type: "image/jpeg" });
    formData.append("albumArt", file);

    const result = await uploadAlbumArt(formData);

    expect(mockSupabase.storage.from).toHaveBeenCalledWith("album-art");
    expect(mockSupabase.storage.upload).toHaveBeenCalled();
    expect(mockDb.update).toHaveBeenCalled();
    const mockUpdateInstance = mockDb.update.mock.results[0].value;
    expect(mockUpdateInstance.set).toHaveBeenCalledWith({
      albumCoverUrl: "http://example.com/album.jpg",
    });
    expect(result).toEqual({ slug: "test-artist" });
  });
});
