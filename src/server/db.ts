import { eq, and } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, colaboradores, empresas, mecanicos, recursos, niveisAcesso, clientes, veiculos, ordensServico, InsertOrdemServico } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// =====================================================
// DOCTOR AUTO - QUERIES
// =====================================================

// Colaboradores
export async function getColaboradorByEmail(email: string) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(colaboradores).where(eq(colaboradores.email, email)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getColaboradorById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(colaboradores).where(eq(colaboradores.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getAllColaboradores() {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(colaboradores);
}

export async function getColaboradoresByEmpresa(empresaId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(colaboradores).where(eq(colaboradores.empresaId, empresaId));
}

export async function updateColaboradorSenha(id: number, novaSenha: string) {
  const db = await getDb();
  if (!db) return false;

  await db.update(colaboradores)
    .set({ senha: novaSenha, primeiroAcesso: false })
    .where(eq(colaboradores.id, id));
  
  return true;
}

// Empresas
export async function getAllEmpresas() {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(empresas);
}

export async function getEmpresaById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(empresas).where(eq(empresas.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// Mecânicos
export async function getAllMecanicos() {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(mecanicos);
}

export async function getMecanicosByEmpresa(empresaId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(mecanicos).where(eq(mecanicos.empresaId, empresaId));
}

// Recursos
export async function getAllRecursos() {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(recursos);
}

export async function getRecursosByEmpresa(empresaId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(recursos).where(eq(recursos.empresaId, empresaId));
}

// Níveis de Acesso
export async function getAllNiveisAcesso() {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(niveisAcesso);
}

export async function getNivelAcessoById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(niveisAcesso).where(eq(niveisAcesso.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// Clientes
export async function getAllClientes() {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(clientes);
}

export async function getClienteById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(clientes).where(eq(clientes.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getClienteByEmail(email: string) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(clientes).where(eq(clientes.email, email)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// Veículos
export async function getAllVeiculos() {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(veiculos);
}

export async function getVeiculosByClienteId(clienteId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(veiculos).where(eq(veiculos.clienteId, clienteId));
}

export async function getVeiculoByPlaca(placa: string) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(veiculos).where(eq(veiculos.placa, placa)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// Ordens de Serviço
export async function getAllOrdensServico() {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(ordensServico);
}

export async function getOrdemServicoById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(ordensServico).where(eq(ordensServico.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getOrdensServicoByStatus(status: string) {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(ordensServico).where(eq(ordensServico.status, status));
}

export async function createOrdemServico(os: InsertOrdemServico) {
  const db = await getDb();
  if (!db) return null;

  // Gerar número da OS (formato: OS-YYYYMMDD-XXX)
  const hoje = new Date();
  const dataStr = hoje.toISOString().slice(0, 10).replace(/-/g, '');
  const countResult = await db.select().from(ordensServico);
  const numeroOs = `OS-${dataStr}-${String(countResult.length + 1).padStart(3, '0')}`;

  const result = await db.insert(ordensServico).values({
    ...os,
    numeroOs,
    status: 'diagnostico',
    dataEntrada: new Date(),
  });

  return { id: result[0].insertId, numeroOs };
}

export async function updateOrdemServicoStatus(id: number, status: string) {
  const db = await getDb();
  if (!db) return false;

  await db.update(ordensServico)
    .set({ status })
    .where(eq(ordensServico.id, id));
  
  return true;
}

// Ordens de Serviço - Funções completas
export async function getOrdemServicoCompleta(id: number) {
  const db = await getDb();
  if (!db) return null;

  // Buscar OS
  const osResult = await db.select().from(ordensServico).where(eq(ordensServico.id, id)).limit(1);
  if (osResult.length === 0) return null;
  const os = osResult[0];

  // Buscar cliente
  let cliente = null;
  if (os.clienteId) {
    const clienteResult = await db.select().from(clientes).where(eq(clientes.id, os.clienteId)).limit(1);
    cliente = clienteResult.length > 0 ? clienteResult[0] : null;
  }

  // Buscar veículo
  let veiculo = null;
  if (os.veiculoId) {
    const veiculoResult = await db.select().from(veiculos).where(eq(veiculos.id, os.veiculoId)).limit(1);
    veiculo = veiculoResult.length > 0 ? veiculoResult[0] : null;
  }

  // Buscar itens
  const itens = await db.select().from(ordensServicoItens).where(eq(ordensServicoItens.ordemServicoId, id));

  // Buscar mecânico
  let mecanico = null;
  if (os.mecanicoId) {
    const mecanicoResult = await db.select().from(mecanicos).where(eq(mecanicos.id, os.mecanicoId)).limit(1);
    mecanico = mecanicoResult.length > 0 ? mecanicoResult[0] : null;
  }

  return {
    os,
    cliente,
    veiculo,
    itens,
    mecanico,
  };
}

export async function updateOrdemServico(id: number, data: Partial<InsertOrdemServico>) {
  const db = await getDb();
  if (!db) return false;

  await db.update(ordensServico)
    .set(data)
    .where(eq(ordensServico.id, id));
  
  return true;
}

// Itens da OS
import { ordensServicoItens, InsertOrdemServicoItem } from "../drizzle/schema";

export async function getItensOrdemServico(ordemServicoId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(ordensServicoItens).where(eq(ordensServicoItens.ordemServicoId, ordemServicoId));
}

export async function createItemOrdemServico(item: InsertOrdemServicoItem) {
  const db = await getDb();
  if (!db) return null;

  const result = await db.insert(ordensServicoItens).values(item);
  return { id: result[0].insertId };
}

export async function updateItemOrdemServico(id: number, data: Partial<InsertOrdemServicoItem>) {
  const db = await getDb();
  if (!db) return false;

  await db.update(ordensServicoItens)
    .set(data)
    .where(eq(ordensServicoItens.id, id));
  
  return true;
}

export async function deleteItemOrdemServico(id: number) {
  const db = await getDb();
  if (!db) return false;

  await db.delete(ordensServicoItens).where(eq(ordensServicoItens.id, id));
  return true;
}

// CRM - Fidelidade
import { crm } from "../drizzle/schema";

export async function getCrmByClienteId(clienteId: number) {
  const db = await getDb();
  if (!db) return null;

  const result = await db.select().from(crm).where(eq(crm.clienteId, clienteId)).limit(1);
  return result.length > 0 ? result[0] : null;
}


// Criar Cliente
import { InsertCliente, InsertVeiculo } from "../drizzle/schema";

export async function createCliente(cliente: InsertCliente) {
  const db = await getDb();
  if (!db) return null;

  const result = await db.insert(clientes).values(cliente);
  return { id: result[0].insertId };
}

// Criar Veículo
export async function createVeiculo(veiculo: InsertVeiculo) {
  const db = await getDb();
  if (!db) return null;

  const result = await db.insert(veiculos).values(veiculo);
  return { id: result[0].insertId };
}

// Buscar veículo por placa
export async function getVeiculoByPlacaExact(placa: string) {
  const db = await getDb();
  if (!db) return null;

  const result = await db.select().from(veiculos).where(eq(veiculos.placa, placa)).limit(1);
  return result.length > 0 ? result[0] : null;
}
