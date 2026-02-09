import { describe, it, expect } from "vitest";
import {
  DEV_BYPASS,
  DEV_USER,
  DEV_CLIENT,
  DEV_VEHICLES,
  DEV_COMPANY,
} from "./devBypass";

describe("devBypass configuration", () => {
  describe("DEV_USER", () => {
    it("should have required fields", () => {
      expect(DEV_USER).toHaveProperty("id");
      expect(DEV_USER).toHaveProperty("email");
      expect(DEV_USER).toHaveProperty("name");
      expect(typeof DEV_USER.id).toBe("string");
      expect(typeof DEV_USER.email).toBe("string");
      expect(typeof DEV_USER.name).toBe("string");
    });

    it("should have a valid email format", () => {
      expect(DEV_USER.email).toMatch(/.+@.+\..+/);
    });
  });

  describe("DEV_CLIENT", () => {
    it("should have required fields", () => {
      expect(DEV_CLIENT).toHaveProperty("id");
      expect(DEV_CLIENT).toHaveProperty("name");
      expect(DEV_CLIENT).toHaveProperty("phone");
      expect(DEV_CLIENT).toHaveProperty("email");
    });
  });

  describe("DEV_VEHICLES", () => {
    it("should be a non-empty array", () => {
      expect(Array.isArray(DEV_VEHICLES)).toBe(true);
      expect(DEV_VEHICLES.length).toBeGreaterThan(0);
    });

    it("each vehicle should have required fields", () => {
      DEV_VEHICLES.forEach((vehicle) => {
        expect(vehicle).toHaveProperty("id");
        expect(vehicle).toHaveProperty("brand");
        expect(vehicle).toHaveProperty("model");
        expect(vehicle).toHaveProperty("plate");
        expect(vehicle).toHaveProperty("year");
        expect(vehicle).toHaveProperty("color");
        expect(vehicle).toHaveProperty("km");
        expect(vehicle).toHaveProperty("is_active");
        expect(typeof vehicle.year).toBe("number");
        expect(typeof vehicle.km).toBe("number");
        expect(vehicle.is_active).toBe(true);
      });
    });

    it("vehicles should have valid plate format", () => {
      DEV_VEHICLES.forEach((vehicle) => {
        // ABC-1234 or ABC1D23 pattern
        expect(vehicle.plate).toMatch(/^[A-Z]{3}-?\d[A-Z0-9]\d{2}$/);
      });
    });
  });

  describe("DEV_COMPANY", () => {
    it("should have required fields", () => {
      expect(DEV_COMPANY).toHaveProperty("id");
      expect(DEV_COMPANY).toHaveProperty("code");
      expect(DEV_COMPANY).toHaveProperty("name");
      expect(DEV_COMPANY).toHaveProperty("hora_abertura");
      expect(DEV_COMPANY).toHaveProperty("hora_fechamento");
      expect(DEV_COMPANY).toHaveProperty("dias_atendimento");
      expect(DEV_COMPANY).toHaveProperty("is_active");
    });

    it("should have valid time format", () => {
      expect(DEV_COMPANY.hora_abertura).toMatch(/^\d{2}:\d{2}$/);
      expect(DEV_COMPANY.hora_fechamento).toMatch(/^\d{2}:\d{2}$/);
    });

    it("should have valid attendance days", () => {
      const validDays = ["dom", "seg", "ter", "qua", "qui", "sex", "sab"];
      DEV_COMPANY.dias_atendimento.forEach((day) => {
        expect(validDays).toContain(day);
      });
    });

    it("should have positive financial goals", () => {
      expect(DEV_COMPANY.meta_mensal).toBeGreaterThan(0);
      expect(DEV_COMPANY.meta_diaria).toBeGreaterThan(0);
    });

    it("should have daily goal less than monthly goal", () => {
      expect(DEV_COMPANY.meta_diaria).toBeLessThan(DEV_COMPANY.meta_mensal);
    });

    it("should be active", () => {
      expect(DEV_COMPANY.is_active).toBe(true);
    });
  });
});
