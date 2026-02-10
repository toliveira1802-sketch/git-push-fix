import { describe, it, expect } from "vitest";
import {
  COOKIE_NAME,
  ONE_YEAR_MS,
  AXIOS_TIMEOUT_MS,
  UNAUTHED_ERR_MSG,
  NOT_ADMIN_ERR_MSG,
} from "./const";

describe("Application constants", () => {
  it("should have a valid cookie name", () => {
    expect(COOKIE_NAME).toBe("app_session_id");
    expect(typeof COOKIE_NAME).toBe("string");
    expect(COOKIE_NAME.length).toBeGreaterThan(0);
  });

  it("should have ONE_YEAR_MS equal to ~365 days in milliseconds", () => {
    const expectedMs = 1000 * 60 * 60 * 24 * 365;
    expect(ONE_YEAR_MS).toBe(expectedMs);
    expect(ONE_YEAR_MS).toBe(31_536_000_000);
  });

  it("should have a reasonable axios timeout", () => {
    expect(AXIOS_TIMEOUT_MS).toBe(30_000);
    expect(AXIOS_TIMEOUT_MS).toBeGreaterThan(0);
    expect(AXIOS_TIMEOUT_MS).toBeLessThanOrEqual(60_000);
  });

  it("should have descriptive error messages", () => {
    expect(UNAUTHED_ERR_MSG).toContain("login");
    expect(UNAUTHED_ERR_MSG).toContain("10001");
    expect(NOT_ADMIN_ERR_MSG).toContain("permission");
    expect(NOT_ADMIN_ERR_MSG).toContain("10002");
  });
});
