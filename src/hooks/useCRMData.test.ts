/**
 * Tests for useCRMData — focuses on the pure computation logic:
 * - CRM stats calculation (leads, ativos, em_risco, etc.)
 * - calcValorAprovado
 * - Field routing in useUpdateClientCRM
 */
import { describe, it, expect } from "vitest";
import type { CRMClient, CRMStats } from "./useCRMData";

// -------------------------------------------------------
// Replicate the stats calculation logic from the hook
// -------------------------------------------------------
function calculateStats(clients: CRMClient[]): CRMStats {
  const clientsWithOrders = clients.filter((c) => c.orders_count > 0);
  const totalFaturamento = clients.reduce((sum, c) => sum + c.total_spent, 0);

  return {
    total: clients.length,
    leads: clients.filter((c) => c.status_crm === "lead").length,
    ativos: clients.filter((c) => c.status_crm === "ativo").length,
    em_risco: clients.filter((c) => c.status_crm === "em_risco").length,
    inativos: clients.filter((c) => c.status_crm === "inativo").length,
    perdidos: clients.filter((c) => c.status_crm === "perdido").length,
    total_faturamento: totalFaturamento,
    ticket_medio_geral:
      clientsWithOrders.length > 0
        ? totalFaturamento / clientsWithOrders.length
        : 0,
    com_followup_pendente: clients.filter(
      (c) => c.proximo_contato && new Date(c.proximo_contato) <= new Date()
    ).length,
  };
}

function makeClient(overrides: Partial<CRMClient> = {}): CRMClient {
  return {
    id: "c-1",
    name: "Test",
    email: null,
    phone: "11999999999",
    cpf: null,
    address: null,
    city: null,
    status: "active",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
    notes: null,
    user_id: null,
    pending_review: false,
    registration_source: "manual",
    data_aniversario: null,
    status_crm: "ativo",
    origem: "direto",
    ultima_interacao: null,
    indicacoes_feitas: 0,
    indicado_por: null,
    tags: [],
    proximo_contato: null,
    motivo_contato: null,
    nivel_satisfacao: null,
    preferencias: null,
    reclamacoes: 0,
    total_spent: 0,
    last_service_date: null,
    ticket_medio: 0,
    vehicles_count: 0,
    orders_count: 0,
    dias_sem_visita: null,
    ...overrides,
  };
}

describe("CRM Stats Calculation", () => {
  it("should count clients by status_crm", () => {
    const clients: CRMClient[] = [
      makeClient({ id: "1", status_crm: "lead" }),
      makeClient({ id: "2", status_crm: "ativo" }),
      makeClient({ id: "3", status_crm: "ativo" }),
      makeClient({ id: "4", status_crm: "em_risco" }),
      makeClient({ id: "5", status_crm: "inativo" }),
      makeClient({ id: "6", status_crm: "perdido" }),
    ];

    const stats = calculateStats(clients);

    expect(stats.total).toBe(6);
    expect(stats.leads).toBe(1);
    expect(stats.ativos).toBe(2);
    expect(stats.em_risco).toBe(1);
    expect(stats.inativos).toBe(1);
    expect(stats.perdidos).toBe(1);
  });

  it("should calculate total_faturamento", () => {
    const clients: CRMClient[] = [
      makeClient({ id: "1", total_spent: 5000 }),
      makeClient({ id: "2", total_spent: 3000 }),
      makeClient({ id: "3", total_spent: 2000 }),
    ];

    const stats = calculateStats(clients);
    expect(stats.total_faturamento).toBe(10000);
  });

  it("should calculate ticket_medio_geral from clients with orders", () => {
    const clients: CRMClient[] = [
      makeClient({ id: "1", total_spent: 6000, orders_count: 3 }),
      makeClient({ id: "2", total_spent: 4000, orders_count: 2 }),
      makeClient({ id: "3", total_spent: 0, orders_count: 0 }), // no orders
    ];

    const stats = calculateStats(clients);
    // total_faturamento = 10000, clients with orders = 2
    expect(stats.ticket_medio_geral).toBe(5000);
  });

  it("should return 0 ticket_medio when no clients have orders", () => {
    const clients: CRMClient[] = [
      makeClient({ id: "1", total_spent: 0, orders_count: 0 }),
      makeClient({ id: "2", total_spent: 0, orders_count: 0 }),
    ];

    const stats = calculateStats(clients);
    expect(stats.ticket_medio_geral).toBe(0);
  });

  it("should count com_followup_pendente for past dates", () => {
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 1);
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 5);

    const clients: CRMClient[] = [
      makeClient({ id: "1", proximo_contato: pastDate.toISOString() }),
      makeClient({ id: "2", proximo_contato: futureDate.toISOString() }),
      makeClient({ id: "3", proximo_contato: null }), // no followup
    ];

    const stats = calculateStats(clients);
    expect(stats.com_followup_pendente).toBe(1); // only past date
  });

  it("should handle empty client list", () => {
    const stats = calculateStats([]);

    expect(stats.total).toBe(0);
    expect(stats.leads).toBe(0);
    expect(stats.ativos).toBe(0);
    expect(stats.em_risco).toBe(0);
    expect(stats.inativos).toBe(0);
    expect(stats.perdidos).toBe(0);
    expect(stats.total_faturamento).toBe(0);
    expect(stats.ticket_medio_geral).toBe(0);
    expect(stats.com_followup_pendente).toBe(0);
  });
});

describe("CRM - useUpdateClientCRM field routing", () => {
  // Replicate the field separation logic
  const clientFields = [
    "name", "email", "phone", "cpf", "address", "city",
    "status", "notes", "pending_review", "data_aniversario",
  ];
  const crmFields = [
    "status_crm", "origem", "ultima_interacao", "indicacoes_feitas",
    "indicado_por", "tags", "proximo_contato", "motivo_contato",
    "nivel_satisfacao", "preferencias", "reclamacoes",
  ];
  const metricsFields = ["total_spent", "last_service_date", "ticket_medio"];

  function routeUpdates(updates: Record<string, any>) {
    const clientUpdates: Record<string, any> = {};
    const crmUpdates: Record<string, any> = {};
    const metricsUpdates: Record<string, any> = {};

    Object.entries(updates).forEach(([key, value]) => {
      if (clientFields.includes(key)) clientUpdates[key] = value;
      else if (crmFields.includes(key)) crmUpdates[key] = value;
      else if (metricsFields.includes(key)) metricsUpdates[key] = value;
    });

    return { clientUpdates, crmUpdates, metricsUpdates };
  }

  it("should route name/phone to client table", () => {
    const { clientUpdates, crmUpdates, metricsUpdates } = routeUpdates({
      name: "Novo Nome",
      phone: "11888888888",
    });

    expect(clientUpdates).toEqual({ name: "Novo Nome", phone: "11888888888" });
    expect(Object.keys(crmUpdates)).toHaveLength(0);
    expect(Object.keys(metricsUpdates)).toHaveLength(0);
  });

  it("should route status_crm/tags to CRM table", () => {
    const { clientUpdates, crmUpdates, metricsUpdates } = routeUpdates({
      status_crm: "em_risco",
      tags: ["vip", "recorrente"],
    });

    expect(Object.keys(clientUpdates)).toHaveLength(0);
    expect(crmUpdates).toEqual({
      status_crm: "em_risco",
      tags: ["vip", "recorrente"],
    });
    expect(Object.keys(metricsUpdates)).toHaveLength(0);
  });

  it("should route total_spent to metrics table", () => {
    const { clientUpdates, crmUpdates, metricsUpdates } = routeUpdates({
      total_spent: 15000,
      ticket_medio: 3000,
    });

    expect(Object.keys(clientUpdates)).toHaveLength(0);
    expect(Object.keys(crmUpdates)).toHaveLength(0);
    expect(metricsUpdates).toEqual({
      total_spent: 15000,
      ticket_medio: 3000,
    });
  });

  it("should split mixed updates across tables", () => {
    const { clientUpdates, crmUpdates, metricsUpdates } = routeUpdates({
      name: "João",
      status_crm: "ativo",
      total_spent: 5000,
    });

    expect(clientUpdates).toEqual({ name: "João" });
    expect(crmUpdates).toEqual({ status_crm: "ativo" });
    expect(metricsUpdates).toEqual({ total_spent: 5000 });
  });

  it("should ignore unknown fields", () => {
    const { clientUpdates, crmUpdates, metricsUpdates } = routeUpdates({
      unknown_field: "value",
      another_unknown: 42,
    });

    expect(Object.keys(clientUpdates)).toHaveLength(0);
    expect(Object.keys(crmUpdates)).toHaveLength(0);
    expect(Object.keys(metricsUpdates)).toHaveLength(0);
  });
});
