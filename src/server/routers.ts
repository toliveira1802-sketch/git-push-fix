import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import {
  getAllColaboradores,
  getColaboradorByEmail,
  getColaboradoresByEmpresa,
  getColaboradorById,
  updateColaboradorSenha,
  getAllEmpresas,
  getEmpresaById,
  getAllMecanicos,
  getMecanicosByEmpresa,
  getAllRecursos,
  getRecursosByEmpresa,
  getAllNiveisAcesso,
  getAllClientes,
  getClienteById,
  getVeiculosByClienteId,
  getAllVeiculos,
  getAllOrdensServico,
  getOrdemServicoById,
  getOrdensServicoByStatus,
  createOrdemServico,
  updateOrdemServicoStatus,
  getOrdemServicoCompleta,
  updateOrdemServico,
  getItensOrdemServico,
  createItemOrdemServico,
  updateItemOrdemServico,
  deleteItemOrdemServico,
  getCrmByClienteId,
  createCliente,
  createVeiculo,
  getVeiculoByPlacaExact,
} from "./db";

export const appRouter = router({
  system: systemRouter,
  
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // Empresas
  empresas: router({
    list: publicProcedure.query(async () => {
      return await getAllEmpresas();
    }),
    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await getEmpresaById(input.id);
      }),
  }),

  // Colaboradores
  colaboradores: router({
    list: publicProcedure.query(async () => {
      return await getAllColaboradores();
    }),
    getByEmail: publicProcedure
      .input(z.object({ email: z.string().email() }))
      .query(async ({ input }) => {
        return await getColaboradorByEmail(input.email);
      }),
    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await getColaboradorById(input.id);
      }),
    getByEmpresa: publicProcedure
      .input(z.object({ empresaId: z.number() }))
      .query(async ({ input }) => {
        return await getColaboradoresByEmpresa(input.empresaId);
      }),
    trocarSenha: publicProcedure
      .input(z.object({
        id: z.number(),
        senhaAtual: z.string(),
        novaSenha: z.string().min(6, "A nova senha deve ter pelo menos 6 caracteres"),
      }))
      .mutation(async ({ input }) => {
        const colaborador = await getColaboradorById(input.id);
        if (!colaborador) {
          return { success: false, error: "Colaborador não encontrado" };
        }
        if (colaborador.senha !== input.senhaAtual) {
          return { success: false, error: "Senha atual incorreta" };
        }
        if (input.senhaAtual === input.novaSenha) {
          return { success: false, error: "A nova senha deve ser diferente da atual" };
        }
        const updated = await updateColaboradorSenha(input.id, input.novaSenha);
        if (!updated) {
          return { success: false, error: "Erro ao atualizar senha" };
        }
        return { success: true };
      }),
  }),

  // Mecânicos
  mecanicos: router({
    list: publicProcedure.query(async () => {
      return await getAllMecanicos();
    }),
    getByEmpresa: publicProcedure
      .input(z.object({ empresaId: z.number() }))
      .query(async ({ input }) => {
        return await getMecanicosByEmpresa(input.empresaId);
      }),
  }),

  // Recursos
  recursos: router({
    list: publicProcedure.query(async () => {
      return await getAllRecursos();
    }),
    getByEmpresa: publicProcedure
      .input(z.object({ empresaId: z.number() }))
      .query(async ({ input }) => {
        return await getRecursosByEmpresa(input.empresaId);
      }),
  }),

  // Níveis de Acesso
  niveisAcesso: router({
    list: publicProcedure.query(async () => {
      return await getAllNiveisAcesso();
    }),
  }),

  // Clientes
  clientes: router({
    list: publicProcedure.query(async () => {
      return await getAllClientes();
    }),
    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await getClienteById(input.id);
      }),
    create: publicProcedure
      .input(z.object({
        nomeCompleto: z.string(),
        telefone: z.string().optional(),
        cpf: z.string().optional(),
        email: z.string().optional(),
        empresaId: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        const result = await createCliente(input);
        if (!result) {
          return { success: false, error: "Erro ao criar cliente" };
        }
        return { success: true, id: result.id };
      }),
  }),

  // Veículos
  veiculos: router({
    list: publicProcedure.query(async () => {
      return await getAllVeiculos();
    }),
    getByCliente: publicProcedure
      .input(z.object({ clienteId: z.number() }))
      .query(async ({ input }) => {
        return await getVeiculosByClienteId(input.clienteId);
      }),
    getByPlaca: publicProcedure
      .input(z.object({ placa: z.string() }))
      .query(async ({ input }) => {
        return await getVeiculoByPlacaExact(input.placa);
      }),
    create: publicProcedure
      .input(z.object({
        clienteId: z.number(),
        placa: z.string(),
        modelo: z.string().optional(),
        marca: z.string().optional(),
        ano: z.number().optional(),
        kmAtual: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        const result = await createVeiculo(input);
        if (!result) {
          return { success: false, error: "Erro ao criar veículo" };
        }
        return { success: true, id: result.id };
      }),
  }),

  // CRM / Fidelidade
  crm: router({
    getByCliente: publicProcedure
      .input(z.object({ clienteId: z.number() }))
      .query(async ({ input }) => {
        return await getCrmByClienteId(input.clienteId);
      }),
  }),

  // Ordens de Serviço
  ordensServico: router({
    list: publicProcedure.query(async () => {
      return await getAllOrdensServico();
    }),
    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await getOrdemServicoById(input.id);
      }),
    getCompleta: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await getOrdemServicoCompleta(input.id);
      }),
    getByStatus: publicProcedure
      .input(z.object({ status: z.string() }))
      .query(async ({ input }) => {
        return await getOrdensServicoByStatus(input.status);
      }),
    create: publicProcedure
      .input(z.object({
        clienteId: z.number().optional(),
        veiculoId: z.number().optional(),
        placa: z.string().optional(),
        km: z.number().optional(),
        colaboradorId: z.number().optional(),
        motivoVisita: z.string().optional(),
        descricaoProblema: z.string().optional(),
        observacoes: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const result = await createOrdemServico(input);
        if (!result) {
          return { success: false, error: "Erro ao criar OS" };
        }
        return { success: true, id: result.id, numeroOs: result.numeroOs };
      }),
    update: publicProcedure
      .input(z.object({
        id: z.number(),
        status: z.string().optional(),
        descricaoProblema: z.string().optional(),
        diagnostico: z.string().optional(),
        observacoes: z.string().optional(),
        motivoRecusa: z.string().optional(),
        dataOrcamento: z.date().optional(),
        dataAprovacao: z.date().optional(),
        dataConclusao: z.date().optional(),
        dataSaida: z.date().optional(),
        valorAprovado: z.string().optional(),
        totalOrcamento: z.string().optional(),
        valorTotalOs: z.string().optional(),
        googleDriveLink: z.string().optional(),
        mecanicoId: z.number().optional(),
        recursoId: z.number().optional(),
        emTerceiros: z.boolean().optional(),
        recurso: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        const updated = await updateOrdemServico(id, data);
        return { success: updated };
      }),
    updateStatus: publicProcedure
      .input(z.object({
        id: z.number(),
        status: z.string(),
      }))
      .mutation(async ({ input }) => {
        const updated = await updateOrdemServicoStatus(input.id, input.status);
        return { success: updated };
      }),
  }),

  // Itens da OS
  osItens: router({
    list: publicProcedure
      .input(z.object({ ordemServicoId: z.number() }))
      .query(async ({ input }) => {
        return await getItensOrdemServico(input.ordemServicoId);
      }),
    create: publicProcedure
      .input(z.object({
        ordemServicoId: z.number(),
        tipo: z.string().optional(),
        descricao: z.string().optional(),
        quantidade: z.number().optional(),
        valorCusto: z.string().optional(),
        margemAplicada: z.string().optional(),
        valorUnitario: z.string().optional(),
        valorTotal: z.string().optional(),
        prioridade: z.string().optional(),
        status: z.string().optional(),
        mecanicoId: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        const result = await createItemOrdemServico(input);
        if (!result) {
          return { success: false, error: "Erro ao criar item" };
        }
        return { success: true, id: result.id };
      }),
    update: publicProcedure
      .input(z.object({
        id: z.number(),
        tipo: z.string().optional(),
        descricao: z.string().optional(),
        quantidade: z.number().optional(),
        valorCusto: z.string().optional(),
        margemAplicada: z.string().optional(),
        valorUnitario: z.string().optional(),
        valorTotal: z.string().optional(),
        prioridade: z.string().optional(),
        status: z.string().optional(),
        motivoRecusa: z.string().optional(),
        aprovado: z.boolean().optional(),
        executado: z.boolean().optional(),
        mecanicoId: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        const updated = await updateItemOrdemServico(id, data);
        return { success: updated };
      }),
    delete: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        const deleted = await deleteItemOrdemServico(input.id);
        return { success: deleted };
      }),
    updateStatus: publicProcedure
      .input(z.object({
        id: z.number(),
        status: z.string(),
        motivoRecusa: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, status, motivoRecusa } = input;
        const data: any = { status, aprovado: status === 'aprovado' };
        if (motivoRecusa) data.motivoRecusa = motivoRecusa;
        const updated = await updateItemOrdemServico(id, data);
        return { success: updated };
      }),
  }),
});

export type AppRouter = typeof appRouter;
