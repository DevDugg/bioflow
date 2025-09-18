import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  mockDb,
  mockRevalidatePath,
  setupMocks,
  clearMocks,
} from "../shared-mocks";

setupMocks();

vi.mock("@/server/errors/bad-request-error", () => ({
  BadRequestError: class BadRequestError extends Error {
    statusCode = 400;
    constructor(message: string) {
      super(message);
    }
  },
}));

const { createLink, updateLink, deleteLink } = await import("@/server/links");

describe("Server Actions - Links", () => {
  beforeEach(() => {
    clearMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("createLink", () => {
    it("should create link and revalidate subdomain route", async () => {
      const linkData = {
        artistId: "12345678-1234-1234-1234-123456789012",
        label: "Test Link",
        url: "https://example.com",
        icon: "link",
        linkType: "link" as const,
      };

      const mockNewLink = {
        id: "12345678-1234-1234-1234-123456789012",
        ...linkData,
      };
      const mockArtist = { slug: "testartist" };

      mockDb.insert.mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([mockNewLink]),
        }),
      });

      mockDb.query.links.findFirst.mockResolvedValue({
        artist: mockArtist,
      });

      const result = await createLink(linkData);

      expect(result).toEqual(mockNewLink);
      expect(mockRevalidatePath).toHaveBeenCalledWith("/admin");
      expect(mockRevalidatePath).toHaveBeenCalledWith("/subdomain/testartist");
    });

    it("should handle link creation without artist", async () => {
      const linkData = {
        artistId: "12345678-1234-1234-1234-123456789012",
        label: "Test Link",
        url: "https://example.com",
        linkType: "link" as const,
      };

      const mockNewLink = {
        id: "12345678-1234-1234-1234-123456789012",
        ...linkData,
      };

      mockDb.insert.mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([mockNewLink]),
        }),
      });

      mockDb.query.links.findFirst.mockResolvedValue(null);

      const result = await createLink(linkData);

      expect(result).toEqual(mockNewLink);
      expect(mockRevalidatePath).toHaveBeenCalledWith("/admin");
      expect(mockRevalidatePath).not.toHaveBeenCalledWith(
        expect.stringContaining("/subdomain/")
      );
    });
  });

  describe("updateLink", () => {
    it("should update link and revalidate subdomain route", async () => {
      const updateData = {
        id: "12345678-1234-1234-1234-123456789012",
        label: "Updated Link",
        url: "https://updated.com",
        linkType: "link" as const,
      };

      const mockUpdatedLink = { ...updateData };
      const mockArtist = { slug: "testartist" };

      mockDb.update.mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([mockUpdatedLink]),
          }),
        }),
      });

      mockDb.query.links.findFirst.mockResolvedValue({
        artist: mockArtist,
      });

      await expect(updateLink(updateData)).rejects.toThrow();
    });
  });

  describe("deleteLink", () => {
    it("should delete link and revalidate subdomain route", async () => {
      const linkId = "12345678-1234-1234-1234-123456789012";
      const mockDeletedLink = { id: linkId, label: "Deleted Link" };
      const mockArtist = { slug: "testartist" };

      mockDb.query.links.findFirst.mockResolvedValue({
        artist: mockArtist,
      });

      mockDb.delete.mockReturnValue({
        where: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([mockDeletedLink]),
        }),
      });

      const result = await deleteLink(linkId);

      expect(result).toEqual(mockDeletedLink);
      expect(mockRevalidatePath).toHaveBeenCalledWith("/admin");
      expect(mockRevalidatePath).toHaveBeenCalledWith("/subdomain/testartist");
    });
  });

  describe("subdomain route invalidation", () => {
    it("should revalidate subdomain route for all link operations", async () => {
      const linkData = {
        artistId: "12345678-1234-1234-1234-123456789012",
        label: "Test Link",
        url: "https://example.com",
        linkType: "link" as const,
      };

      const mockNewLink = {
        id: "12345678-1234-1234-1234-123456789012",
        ...linkData,
      };
      const mockArtist = { slug: "devdugg" };

      mockDb.insert.mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([mockNewLink]),
        }),
      });

      mockDb.query.links.findFirst.mockResolvedValue({
        artist: mockArtist,
      });

      await createLink(linkData);

      expect(mockRevalidatePath).toHaveBeenCalledWith("/subdomain/devdugg");
    });
  });
});
