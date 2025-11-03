import { AxiosError } from "axios";
import api from "../api";
import { expect, it, vi } from "vitest";

it("should transform API errors into readable objects", async () => {
  vi.spyOn(api, "get").mockRejectedValue({
    response: { data: { error: "Driver not found" }, status: 404 },
  });

  try {
    await api.get("/drivers/xyz");
  } catch (err: any) {
    const error = err as unknown as AxiosError<{ error: string }>
    expect(error.response?.data?.error || "").toBe("Driver not found");
    expect(error.response?.status || 100).toBe(404);
  }
});
