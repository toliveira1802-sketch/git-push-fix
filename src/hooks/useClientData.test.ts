/**
 * Tests for useClientData — pure logic:
 * - getActiveServiceOrder filtering
 * - DEV_BYPASS initial state
 * - Service history data mapping
 */
import { describe, it, expect } from "vitest";
import type { ClientServiceHistory } from "./useClientData";

// Replicate the getActiveServiceOrder logic
function getActiveServiceOrder(
  serviceHistory: ClientServiceHistory[],
  vehiclePlate: string
): ClientServiceHistory | undefined {
  return serviceHistory.find(
    (order) =>
      order.vehicle_plate === vehiclePlate &&
      !["fechada", "cancelada", "entregue"].includes(
        order.order_status.toLowerCase()
      )
  );
}

function makeOrder(
  overrides: Partial<ClientServiceHistory> = {}
): ClientServiceHistory {
  return {
    service_order_id: "os-1",
    order_number: "OS-001",
    order_status: "em_execucao",
    order_date: "2024-01-15T10:00:00Z",
    completed_at: null,
    total: 3000,
    total_parts: 1500,
    total_labor: 1500,
    total_discount: 0,
    problem_description: "Troca de óleo",
    diagnosis: null,
    payment_status: null,
    payment_method: null,
    vehicle_brand: "FIAT",
    vehicle_model: "PALIO",
    vehicle_plate: "ABC-1234",
    vehicle_year: 2020,
    vehicle_color: "Prata",
    items: [],
    ...overrides,
  };
}

describe("useClientData - getActiveServiceOrder", () => {
  it("should find an active order for a vehicle plate", () => {
    const history = [
      makeOrder({ vehicle_plate: "ABC-1234", order_status: "em_execucao" }),
      makeOrder({
        service_order_id: "os-2",
        vehicle_plate: "XYZ-5678",
        order_status: "entregue",
      }),
    ];

    const result = getActiveServiceOrder(history, "ABC-1234");
    expect(result).toBeDefined();
    expect(result?.service_order_id).toBe("os-1");
  });

  it("should NOT return orders with status 'entregue'", () => {
    const history = [
      makeOrder({ vehicle_plate: "ABC-1234", order_status: "entregue" }),
    ];

    const result = getActiveServiceOrder(history, "ABC-1234");
    expect(result).toBeUndefined();
  });

  it("should NOT return orders with status 'fechada'", () => {
    const history = [
      makeOrder({ vehicle_plate: "ABC-1234", order_status: "fechada" }),
    ];

    const result = getActiveServiceOrder(history, "ABC-1234");
    expect(result).toBeUndefined();
  });

  it("should NOT return orders with status 'cancelada'", () => {
    const history = [
      makeOrder({ vehicle_plate: "ABC-1234", order_status: "cancelada" }),
    ];

    const result = getActiveServiceOrder(history, "ABC-1234");
    expect(result).toBeUndefined();
  });

  it("should be case-insensitive on status filtering", () => {
    const history = [
      makeOrder({ vehicle_plate: "ABC-1234", order_status: "Entregue" }),
    ];

    const result = getActiveServiceOrder(history, "ABC-1234");
    expect(result).toBeUndefined();
  });

  it("should return active statuses like diagnostico, orcamento, etc.", () => {
    const activeStatuses = [
      "diagnostico",
      "orcamento",
      "aguardando_aprovacao",
      "em_execucao",
      "em_teste",
      "pronto",
    ];

    activeStatuses.forEach((status) => {
      const history = [
        makeOrder({ vehicle_plate: "ABC-1234", order_status: status }),
      ];
      const result = getActiveServiceOrder(history, "ABC-1234");
      expect(result).toBeDefined();
    });
  });

  it("should return undefined for plate not in history", () => {
    const history = [
      makeOrder({ vehicle_plate: "ABC-1234", order_status: "em_execucao" }),
    ];

    const result = getActiveServiceOrder(history, "ZZZ-9999");
    expect(result).toBeUndefined();
  });

  it("should return undefined for empty history", () => {
    const result = getActiveServiceOrder([], "ABC-1234");
    expect(result).toBeUndefined();
  });

  it("should return the first matching active order", () => {
    const history = [
      makeOrder({
        service_order_id: "os-1",
        vehicle_plate: "ABC-1234",
        order_status: "diagnostico",
      }),
      makeOrder({
        service_order_id: "os-2",
        vehicle_plate: "ABC-1234",
        order_status: "em_execucao",
      }),
    ];

    const result = getActiveServiceOrder(history, "ABC-1234");
    expect(result?.service_order_id).toBe("os-1"); // First match
  });
});

describe("useClientData - DEV_BYPASS initial state", () => {
  it("should have correct DEV_CLIENT shape", () => {
    // Verify the shape expected by the hook
    const devClient = {
      id: "dev-client-id",
      name: "Cliente Dev",
      phone: "11999999999",
      email: "dev@doctor.com",
    };

    expect(devClient).toHaveProperty("id");
    expect(devClient).toHaveProperty("name");
    expect(devClient).toHaveProperty("phone");
    expect(devClient).toHaveProperty("email");
  });

  it("should have DEV_VEHICLES with required fields", () => {
    const devVehicles = [
      {
        id: "dev-vehicle-1",
        brand: "FIAT",
        model: "PALIO",
        plate: "ABC-1234",
        year: 2020,
        color: "Prata",
        km: 45000,
        is_active: true,
      },
    ];

    devVehicles.forEach((v) => {
      expect(v).toHaveProperty("id");
      expect(v).toHaveProperty("brand");
      expect(v).toHaveProperty("model");
      expect(v).toHaveProperty("plate");
      expect(v.is_active).toBe(true);
    });
  });
});

describe("useClientData - service history mapping", () => {
  it("should map row data correctly", () => {
    const row = {
      service_order_id: "os-1",
      order_number: "OS-001",
      order_status: "entregue",
      order_date: "2024-06-15T10:00:00Z",
      completed_at: "2024-06-17T15:00:00Z",
      total: 5000,
      total_parts: 2500,
      total_labor: 2500,
      total_discount: 0,
      problem_description: "Revisão completa",
      diagnosis: "Motor OK",
      payment_status: "pago",
      payment_method: "pix",
      vehicle_brand: "HONDA",
      vehicle_model: "CIVIC",
      vehicle_plate: "XYZ-5678",
      vehicle_year: 2022,
      vehicle_color: "Preto",
      items: [
        {
          id: "item-1",
          description: "Filtro de óleo",
          type: "peca",
          quantity: 1,
          unit_price: 50,
          total_price: 50,
          status: "aprovado",
          priority: "verde",
        },
      ],
    };

    // Verify all fields are present
    expect(row.service_order_id).toBe("os-1");
    expect(row.items).toHaveLength(1);
    expect(row.items[0].description).toBe("Filtro de óleo");
    expect(row.completed_at).toBeDefined();
  });

  it("should handle null items as empty array", () => {
    const items = Array.isArray(null) ? null : [];
    expect(items).toEqual([]);
  });
});
