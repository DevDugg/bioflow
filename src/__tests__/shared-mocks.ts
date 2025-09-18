import { vi } from "vitest";

export const mockDb = {
  insert: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
  query: {
    artists: {
      findFirst: vi.fn(),
    },
    links: {
      findFirst: vi.fn(),
    },
  },
};

export const mockRevalidatePath = vi.fn();

export const setupMocks = () => {
  vi.mock("next/cache", () => ({
    revalidatePath: mockRevalidatePath,
  }));

  vi.mock("@/db/client", () => ({
    db: mockDb,
  }));

  vi.mock("@/server/errors/error-handler", () => ({
    withErrorHandler: (fn: any) => fn,
  }));

  vi.mock("@/server/errors/with-zod", () => ({
    withZod: (schema: any, fn: any) => fn,
  }));

  vi.mock("server-only", () => ({}));
};

export const clearMocks = () => {
  mockDb.insert.mockClear();
  mockDb.update.mockClear();
  mockDb.delete.mockClear();
  mockDb.query.artists.findFirst.mockClear();
  mockDb.query.links.findFirst.mockClear();
  mockRevalidatePath.mockClear();
};
