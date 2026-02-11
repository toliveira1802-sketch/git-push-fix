import { describe, it, expect } from "vitest";
import { getHomeRouteForRole } from "./useUserRole";

describe("getHomeRouteForRole", () => {
  it('should return "/admin" for dev role', () => {
    expect(getHomeRouteForRole("dev")).toBe("/admin");
  });

  it('should return "/admin" for admin role', () => {
    expect(getHomeRouteForRole("admin")).toBe("/admin");
  });

  it('should return "/admin" for gestao role', () => {
    expect(getHomeRouteForRole("gestao")).toBe("/admin");
  });

  it('should return "/minha-garagem" for user role', () => {
    expect(getHomeRouteForRole("user")).toBe("/minha-garagem");
  });

  it('should return "/minha-garagem" for null role', () => {
    expect(getHomeRouteForRole(null)).toBe("/minha-garagem");
  });
});
