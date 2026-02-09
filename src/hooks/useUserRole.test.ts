import { describe, it, expect } from "vitest";
import { getHomeRouteForRole } from "./useUserRole";

describe("getHomeRouteForRole", () => {
  it('should return "/admin" for dev role', () => {
    expect(getHomeRouteForRole("dev")).toBe("/admin");
  });

  it('should return "/admin" for admin role', () => {
    expect(getHomeRouteForRole("admin")).toBe("/admin");
  });

  it('should return "/gestao" for gestao role', () => {
    expect(getHomeRouteForRole("gestao")).toBe("/gestao");
  });

  it('should return "/" for user role', () => {
    expect(getHomeRouteForRole("user")).toBe("/");
  });

  it('should return "/" for null role', () => {
    expect(getHomeRouteForRole(null)).toBe("/");
  });
});
