export const osUltimateMock = {
  os: {
    meta: {
      version: "v1",
      osId: "OS-20260119-223346",
      createdAt: "2026-01-19T22:33:00-03:00",
      updatedAt: "2026-01-20T10:15:00-03:00",
      lockedAfterApproval: false,
    },
    status: {
      etapaProcesso: "orcamento" as const,
      postApprovalLocked: false,
    },
    cliente: {
      id: "cli_001",
      nome: "João Silva",
      telefone: "(11) 99999-9999",
      email: "joao@email.com",
      nivel: "prata" as const,
      tags: ["retorno", "boa margem"],
    },
    veiculo: {
      id: "veh_001",
      modelo: "Honda Civic 2022",
      placa: "ABC-1234",
      kmAtual: 45000,
      ano: 2022,
      cor: "Preto",
      vin: null,
      motor: null,
    },
    entrada: {
      descricaoProblema: "Barulho ao frear e luz do ABS acesa.",
      canalOrigem: null,
      promocaoSelecionadaId: null,
    },
    links: {
      fotosVideos: "https://drive.google.com/drive/folders/exemplo",
      linkClientePublico: null,
      linkAdmin: "/admin/os-ultimate",
    },
    checklist: {
      tabAtiva: "obrigatorio",
      itens: [
        { id: "1", nome: "Nível de Óleo", tipo: "obrigatorio", verificado: true, observacao: "" },
        { id: "2", nome: "Nível de Água", tipo: "obrigatorio", verificado: true, observacao: "" },
        { id: "3", nome: "Freios", tipo: "obrigatorio", verificado: false, observacao: "Desgaste acentuado" },
      ],
    },
    diagnostico: {
      parecerInicial: "",
      ia: {
        enabled: true,
        resumo: "Freios com desgaste crítico - trocar pastilhas.",
        updatedAt: "2026-01-20T10:15:00-03:00",
        promptHints: ["@ia", "freios", "abs"],
      },
    },
    orcamento: {
      tierDoMes: "standard" as const,
      itens: [
        {
          id: "1",
          nome: "Pastilha de Freio",
          tipo: "peca",
          quantidade: 1,
          precos: { custo: 250, venda: 380, desconto: 0, margemMinimaPct: 20 },
          valorTotalVenda: 380,
          status: "pendente" as const,
          prioridade: "urgente" as const,
          tier: "premium" as const,
          farolCliente: "vermelho",
          motivoRecusa: "",
          lembreteRetorno: null,
        },
      ],
    },
    totals: {
      moeda: "BRL",
      orcado: 380,
      aprovado: 0,
      pendente: 380,
      recusado: 0,
      final: 0,
    },
    datas: {
      entrada: "19/01/2026 22:33",
      orcamento: "20/01/2026 10:15",
      aprovacao: undefined,
      execucao: undefined,
      entrega: undefined,
    },
    feedback: {
      enabled: true,
      consultor: {
        avaliacaoLead: 0,
        relato: "",
        motivoNaoFechamento: "",
      },
    },
  },
};

export type OSUltimateMock = typeof osUltimateMock;
