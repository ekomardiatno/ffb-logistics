import { z, ZodError } from "zod";
import { formatZodError } from "../src/utils";

describe("formatZodError", () => {
  test("formats simple errors with field and message", () => {
    const schema = z.object({
      name: z.string(),
      age: z.number().min(0),
    });

    try {
      // intentionally invalid
      schema.parse({ name: 123, age: -1 });
      throw new Error("Expected parse to throw");
    } catch (e) {
      expect(e).toBeInstanceOf(ZodError);
      const formatted = formatZodError(e as ZodError);
      expect(formatted).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ field: "name", message: expect.any(String) }),
          expect.objectContaining({ field: "age", message: expect.any(String) }),
        ])
      );
    }
  });

  test("joins nested paths with dot", () => {
    const schema = z.object({
      address: z.object({
        street: z.string(),
      }),
    });

    try {
      schema.parse({ address: { street: 123 } });
      throw new Error("Expected parse to throw");
    } catch (e) {
      const formatted = formatZodError(e as ZodError);
      expect(formatted).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ field: "address.street", message: expect.any(String) }),
        ])
      );
    }
  });

  test("handles root-level errors producing empty string field", () => {
    const schema = z.string();
    try {
      schema.parse(123);
      throw new Error("Expected parse to throw");
    } catch (e) {
      const formatted = formatZodError(e as ZodError);
      // root-level errors have an empty path -> joined to empty string
      expect(formatted[0]).toEqual(expect.objectContaining({ field: "", message: expect.any(String) }));
    }
  });
});
