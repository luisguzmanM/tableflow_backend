import { describe, it, expect, vi } from "vitest";
import request from "supertest";
import { createApp } from "../src/app";
import * as dbModule from "../src/shared/infrastructure/database/pool";

describe("Health Check API", () => {
  it("should return status ok and report db connection status", async () => {
    vi.spyOn(dbModule, "checkDatabaseConnection").mockResolvedValue(true);

    const app = createApp();
    const response = await request(app).get("/health");

    expect(response.status).toBe(200);
    expect(response.body.status).toBe("ok");
    expect(response.body.database).toBe("connected");
    expect(response.body).toHaveProperty("timestamp");
  });
});
