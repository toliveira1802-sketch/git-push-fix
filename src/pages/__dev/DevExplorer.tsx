import React, { useState, useEffect, useCallback, lazy, Suspense, Component, ReactNode } from "react";

class PageErrorBoundary extends Component<{ children: ReactNode; name: string }, { hasError: boolean; error: string }> {
  constructor(props: any) { super(props); this.state = { hasError: false, error: "" }; }
  static getDerivedStateFromError(error: Error) { return { hasError: true, error: error.message }; }
  render() {
    if (this.state.hasError) return (
      <div className="flex items-center justify-center h-full min-h-[300px] bg-red-950/20 rounded-lg border border-red-900/30 p-6 text-center">
        <div><div className="text-3xl mb-3">⚠️</div><p className="text-red-400 font-semibold text-sm">{this.props.name}</p><p className="text-red-400/60 text-xs mt-1">{this.state.error}</p></div>
      </div>
    );
    return this.props.children;
  }
}

const PC: Record<string, React.LazyExoticComponent<any>> = {
  "Index.tsx": lazy(() => import("@/pages/Index")),
  "Home.tsx": lazy(() => import("@/pages/Home")),
  "Login.tsx": lazy(() => import("@/pages/Login")),
  "Register.tsx": lazy(() => import("@/pages/Register")),
  "Profile.tsx": lazy(() => import("@/pages/Profile")),
  "Agenda.tsx": lazy(() => import("@/pages/Agenda")),
  "NovoAgendamento.tsx": lazy(() => import("@/pages/NovoAgendamento")),
  "AgendamentoSucesso.tsx": lazy(() => import("@/pages/AgendamentoSucesso")),
  "Historico.tsx": lazy(() => import("@/pages/Historico")),
  "Veiculos.tsx": lazy(() => import("@/pages/Veiculos")),
  "MinhaGaragem.tsx": lazy(() => import("@/pages/MinhaGaragem")),
  "Configuracoes.tsx": lazy(() => import("@/pages/Configuracoes")),
  "Performance.tsx": lazy(() => import("@/pages/Performance")),
  "Avisos.tsx": lazy(() => import("@/pages/Avisos")),
  "VisaoGeral.tsx": lazy(() => import("@/pages/VisaoGeral")),
  "DashboardCockpit.tsx": lazy(() => import("@/pages/DashboardCockpit")),
  "TrocarSenha.tsx": lazy(() => import("@/pages/TrocarSenha")),
  "OSClienteAcompanhamento.tsx": lazy(() => import("@/pages/OSClienteAcompanhamento")),
  "OSClienteOrcamento.tsx": lazy(() => import("@/pages/OSClienteOrcamento")),
  "ComponentShowcase.tsx": lazy(() => import("@/pages/ComponentShowcase")),
  "NotFound.tsx": lazy(() => import("@/pages/NotFound")),
  "admin/Dashboard.tsx": lazy(() => import("@/pages/admin/Dashboard")),
  "admin/AdminDashboard.tsx": lazy(() => import("@/pages/admin/AdminDashboard")),
  "admin/AdminDashboardOverview.tsx": lazy(() => import("@/pages/admin/AdminDashboardOverview")),
  "admin/AdminDashboardOrcamentos.tsx": lazy(() => import("@/pages/admin/AdminDashboardOrcamentos")),
  "admin/AdminDashboardIAs.tsx": lazy(() => import("@/pages/admin/AdminDashboardIAs")),
  "admin/AdminLogin.tsx": lazy(() => import("@/pages/admin/AdminLogin")),
  "admin/AdminOrdensServico.tsx": lazy(() => import("@/pages/admin/AdminOrdensServico")),
  "admin/OrdensServico.tsx": lazy(() => import("@/pages/admin/OrdensServico")),
  "admin/AdminNovaOS.tsx": lazy(() => import("@/pages/admin/AdminNovaOS")),
  "admin/NovaOS.tsx": lazy(() => import("@/pages/admin/NovaOS")),
  "admin/AdminOSDetalhes.tsx": lazy(() => import("@/pages/admin/AdminOSDetalhes")),
  "admin/OSUltimate.tsx": lazy(() => import("@/pages/admin/OSUltimate")),
  "admin/AdminPatio.tsx": lazy(() => import("@/pages/admin/AdminPatio")),
  "admin/AdminPatioDetalhes.tsx": lazy(() => import("@/pages/admin/AdminPatioDetalhes")),
  "admin/MonitoramentoPatio.tsx": lazy(() => import("@/pages/admin/MonitoramentoPatio")),
  "admin/AdminPendencias.tsx": lazy(() => import("@/pages/admin/AdminPendencias")),
  "admin/Pendencias.tsx": lazy(() => import("@/pages/admin/Pendencias")),
  "admin/AdminClientes.tsx": lazy(() => import("@/pages/admin/AdminClientes")),
  "admin/AdminClientesPage.tsx": lazy(() => import("@/pages/admin/AdminClientesPage")),
  "admin/Clientes.tsx": lazy(() => import("@/pages/admin/Clientes")),
  "admin/AdminVeiculos.tsx": lazy(() => import("@/pages/admin/AdminVeiculos")),
  "admin/AdminServicos.tsx": lazy(() => import("@/pages/admin/AdminServicos")),
  "admin/AdminAgendamentos.tsx": lazy(() => import("@/pages/admin/AdminAgendamentos")),
  "admin/AdminAgendaMecanicos.tsx": lazy(() => import("@/pages/admin/AdminAgendaMecanicos")),
  "admin/AdminMechanicFeedback.tsx": lazy(() => import("@/pages/admin/AdminMechanicFeedback")),
  "admin/AdminMechanicAnalytics.tsx": lazy(() => import("@/pages/admin/AdminMechanicAnalytics")),
  "admin/AdminFinanceiro.tsx": lazy(() => import("@/pages/admin/AdminFinanceiro")),
  "admin/AdminProdutividade.tsx": lazy(() => import("@/pages/admin/AdminProdutividade")),
  "admin/AdminMetas.tsx": lazy(() => import("@/pages/admin/AdminMetas")),
  "admin/AdminRelatorios.tsx": lazy(() => import("@/pages/admin/AdminRelatorios")),
  "admin/AdminChecklist.tsx": lazy(() => import("@/pages/admin/AdminChecklist")),
  "admin/AdminOperacional.tsx": lazy(() => import("@/pages/admin/AdminOperacional")),
  "admin/AdminDocumentacao.tsx": lazy(() => import("@/pages/admin/AdminDocumentacao")),
  "admin/AdminConfiguracoes.tsx": lazy(() => import("@/pages/admin/AdminConfiguracoes")),
  "admin/AdminParametros.tsx": lazy(() => import("@/pages/admin/AdminParametros")),
  "admin/AdminMelhorias.tsx": lazy(() => import("@/pages/admin/AdminMelhorias")),
  "admin/AdminMonitoramentoKommo.tsx": lazy(() => import("@/pages/admin/AdminMonitoramentoKommo")),
  "admin/AdminPainelTV.tsx": lazy(() => import("@/pages/admin/AdminPainelTV")),
  "admin/Cadastros.tsx": lazy(() => import("@/pages/admin/Cadastros")),
  "admin/ImportarDados.tsx": lazy(() => import("@/pages/admin/ImportarDados")),
  "admin/ImportarVeiculosAntigos.tsx": lazy(() => import("@/pages/admin/ImportarVeiculosAntigos")),
  "gestao/GestaoDashboards.tsx": lazy(() => import("@/pages/gestao/GestaoDashboards")),
  "gestao/GestaoRH.tsx": lazy(() => import("@/pages/gestao/GestaoRH")),
  "gestao/GestaoOperacoes.tsx": lazy(() => import("@/pages/gestao/GestaoOperacoes")),
  "gestao/GestaoFinanceiro.tsx": lazy(() => import("@/pages/gestao/GestaoFinanceiro")),
  "gestao/GestaoTecnologia.tsx": lazy(() => import("@/pages/gestao/GestaoTecnologia")),
  "gestao/GestaoComercial.tsx": lazy(() => import("@/pages/gestao/GestaoComercial")),
  "gestao/GestaoMelhorias.tsx": lazy(() => import("@/pages/gestao/GestaoMelhorias")),
  "gestao/GestaoVeiculosOrfaos.tsx": lazy(() => import("@/pages/gestao/GestaoVeiculosOrfaos")),
  "gestao/AdminMonitoramentoKommo-v2.tsx": lazy(() => import("@/pages/gestao/AdminMonitoramentoKommo-v2")),
  "cliente/LoginCliente.tsx": lazy(() => import("@/pages/cliente/LoginCliente")),
  "cliente/OrcamentoCliente.tsx": lazy(() => import("@/pages/cliente/OrcamentoCliente")),
  "os/OSUltimateClient.tsx": lazy(() => import("@/pages/os/OSUltimateClient")),
  "app/Garagem.tsx": lazy(() => import("@/pages/app/Garagem")),
  "auth/Login.tsx": lazy(() => import("@/pages/auth/Login")),
};

interface PF { file: string; label: string; cKey: string; }
interface DI { icon: string; color: string; files: PF[]; }

const T: Record<string, DI> = {
  "pages (raiz)": { icon: "🏠", color: "#3b82f6", files: [
    { file: "Index.tsx", label: "Index / Landing", cKey: "Index.tsx" },
    { file: "Home.tsx", label: "Home", cKey: "Home.tsx" },
    { file: "Login.tsx", label: "Login", cKey: "Login.tsx" },
    { file: "Register.tsx", label: "Register", cKey: "Register.tsx" },
    { file: "Profile.tsx", label: "Perfil", cKey: "Profile.tsx" },
    { file: "Agenda.tsx", label: "Agenda", cKey: "Agenda.tsx" },
    { file: "NovoAgendamento.tsx", label: "Novo Agendamento", cKey: "NovoAgendamento.tsx" },
    { file: "AgendamentoSucesso.tsx", label: "Agendamento Sucesso", cKey: "AgendamentoSucesso.tsx" },
    { file: "Historico.tsx", label: "Histórico", cKey: "Historico.tsx" },
    { file: "Veiculos.tsx", label: "Veículos", cKey: "Veiculos.tsx" },
    { file: "MinhaGaragem.tsx", label: "Minha Garagem", cKey: "MinhaGaragem.tsx" },
    { file: "Configuracoes.tsx", label: "Configurações", cKey: "Configuracoes.tsx" },
    { file: "Performance.tsx", label: "Performance", cKey: "Performance.tsx" },
    { file: "Avisos.tsx", label: "Avisos", cKey: "Avisos.tsx" },
    { file: "VisaoGeral.tsx", label: "Visão Geral", cKey: "VisaoGeral.tsx" },
    { file: "DashboardCockpit.tsx", label: "Dashboard Cockpit", cKey: "DashboardCockpit.tsx" },
    { file: "TrocarSenha.tsx", label: "Trocar Senha", cKey: "TrocarSenha.tsx" },
    { file: "OSClienteAcompanhamento.tsx", label: "OS Acompanhamento", cKey: "OSClienteAcompanhamento.tsx" },
    { file: "OSClienteOrcamento.tsx", label: "OS Orçamento", cKey: "OSClienteOrcamento.tsx" },
    { file: "ComponentShowcase.tsx", label: "Component Showcase", cKey: "ComponentShowcase.tsx" },
    { file: "NotFound.tsx", label: "404 Not Found", cKey: "NotFound.tsx" },
  ]},
  "pages/admin": { icon: "🏢", color: "#f59e0b", files: [
    { file: "Dashboard.tsx", label: "Dashboard", cKey: "admin/Dashboard.tsx" },
    { file: "AdminDashboard.tsx", label: "Admin Dashboard (alt)", cKey: "admin/AdminDashboard.tsx" },
    { file: "AdminDashboardOverview.tsx", label: "Dashboard Overview", cKey: "admin/AdminDashboardOverview.tsx" },
    { file: "AdminDashboardOrcamentos.tsx", label: "Dash Orçamentos", cKey: "admin/AdminDashboardOrcamentos.tsx" },
    { file: "AdminDashboardIAs.tsx", label: "Dashboard IAs", cKey: "admin/AdminDashboardIAs.tsx" },
    { file: "AdminLogin.tsx", label: "Admin Login", cKey: "admin/AdminLogin.tsx" },
    { file: "AdminOrdensServico.tsx", label: "Ordens de Serviço", cKey: "admin/AdminOrdensServico.tsx" },
    { file: "OrdensServico.tsx", label: "OS (alt)", cKey: "admin/OrdensServico.tsx" },
    { file: "AdminNovaOS.tsx", label: "Nova OS", cKey: "admin/AdminNovaOS.tsx" },
    { file: "NovaOS.tsx", label: "Nova OS (alt)", cKey: "admin/NovaOS.tsx" },
    { file: "AdminOSDetalhes.tsx", label: "OS Detalhes", cKey: "admin/AdminOSDetalhes.tsx" },
    { file: "OSUltimate.tsx", label: "OS Ultimate", cKey: "admin/OSUltimate.tsx" },
    { file: "AdminPatio.tsx", label: "Pátio / Kanban", cKey: "admin/AdminPatio.tsx" },
    { file: "AdminPatioDetalhes.tsx", label: "Pátio Detalhes", cKey: "admin/AdminPatioDetalhes.tsx" },
    { file: "MonitoramentoPatio.tsx", label: "Monitor. Pátio", cKey: "admin/MonitoramentoPatio.tsx" },
    { file: "AdminPendencias.tsx", label: "Pendências", cKey: "admin/AdminPendencias.tsx" },
    { file: "Pendencias.tsx", label: "Pendências (alt)", cKey: "admin/Pendencias.tsx" },
    { file: "AdminClientes.tsx", label: "Clientes", cKey: "admin/AdminClientes.tsx" },
    { file: "AdminClientesPage.tsx", label: "Clientes Page", cKey: "admin/AdminClientesPage.tsx" },
    { file: "Clientes.tsx", label: "Clientes (alt)", cKey: "admin/Clientes.tsx" },
    { file: "AdminVeiculos.tsx", label: "Veículos", cKey: "admin/AdminVeiculos.tsx" },
    { file: "AdminServicos.tsx", label: "Serviços", cKey: "admin/AdminServicos.tsx" },
    { file: "AdminAgendamentos.tsx", label: "Agendamentos", cKey: "admin/AdminAgendamentos.tsx" },
    { file: "AdminAgendaMecanicos.tsx", label: "Agenda Mecânicos", cKey: "admin/AdminAgendaMecanicos.tsx" },
    { file: "AdminMechanicFeedback.tsx", label: "Feedback Mecânicos", cKey: "admin/AdminMechanicFeedback.tsx" },
    { file: "AdminMechanicAnalytics.tsx", label: "Analytics Mecânicos", cKey: "admin/AdminMechanicAnalytics.tsx" },
    { file: "AdminFinanceiro.tsx", label: "Financeiro", cKey: "admin/AdminFinanceiro.tsx" },
    { file: "AdminProdutividade.tsx", label: "Produtividade", cKey: "admin/AdminProdutividade.tsx" },
    { file: "AdminMetas.tsx", label: "Metas", cKey: "admin/AdminMetas.tsx" },
    { file: "AdminRelatorios.tsx", label: "Relatórios", cKey: "admin/AdminRelatorios.tsx" },
    { file: "AdminChecklist.tsx", label: "Checklist", cKey: "admin/AdminChecklist.tsx" },
    { file: "AdminOperacional.tsx", label: "Operacional", cKey: "admin/AdminOperacional.tsx" },
    { file: "AdminDocumentacao.tsx", label: "Documentação", cKey: "admin/AdminDocumentacao.tsx" },
    { file: "AdminConfiguracoes.tsx", label: "Configurações", cKey: "admin/AdminConfiguracoes.tsx" },
    { file: "AdminParametros.tsx", label: "Parâmetros", cKey: "admin/AdminParametros.tsx" },
    { file: "AdminMelhorias.tsx", label: "Melhorias", cKey: "admin/AdminMelhorias.tsx" },
    { file: "AdminMonitoramentoKommo.tsx", label: "Monitor. Kommo", cKey: "admin/AdminMonitoramentoKommo.tsx" },
    { file: "AdminPainelTV.tsx", label: "Painel TV", cKey: "admin/AdminPainelTV.tsx" },
    { file: "Cadastros.tsx", label: "Hub Cadastros", cKey: "admin/Cadastros.tsx" },
    { file: "ImportarDados.tsx", label: "Importar Dados", cKey: "admin/ImportarDados.tsx" },
    { file: "ImportarVeiculosAntigos.tsx", label: "Importar Veículos", cKey: "admin/ImportarVeiculosAntigos.tsx" },
  ]},
  "pages/gestao": { icon: "📈", color: "#10b981", files: [
    { file: "GestaoDashboards.tsx", label: "Hub Dashboards", cKey: "gestao/GestaoDashboards.tsx" },
    { file: "GestaoRH.tsx", label: "RH", cKey: "gestao/GestaoRH.tsx" },
    { file: "GestaoOperacoes.tsx", label: "Operações", cKey: "gestao/GestaoOperacoes.tsx" },
    { file: "GestaoFinanceiro.tsx", label: "Financeiro", cKey: "gestao/GestaoFinanceiro.tsx" },
    { file: "GestaoTecnologia.tsx", label: "Tecnologia", cKey: "gestao/GestaoTecnologia.tsx" },
    { file: "GestaoComercial.tsx", label: "Comercial", cKey: "gestao/GestaoComercial.tsx" },
    { file: "GestaoMelhorias.tsx", label: "Melhorias", cKey: "gestao/GestaoMelhorias.tsx" },
    { file: "GestaoVeiculosOrfaos.tsx", label: "Veículos Órfãos", cKey: "gestao/GestaoVeiculosOrfaos.tsx" },
    { file: "AdminMonitoramentoKommo-v2.tsx", label: "Kommo v2", cKey: "gestao/AdminMonitoramentoKommo-v2.tsx" },
  ]},
  "pages/cliente": { icon: "👤", color: "#8b5cf6", files: [
    { file: "LoginCliente.tsx", label: "Login Cliente", cKey: "cliente/LoginCliente.tsx" },
    { file: "OrcamentoCliente.tsx", label: "Orçamento Cliente", cKey: "cliente/OrcamentoCliente.tsx" },
  ]},
  "pages/os": { icon: "📋", color: "#ec4899", files: [
    { file: "OSUltimateClient.tsx", label: "OS Ultimate Client", cKey: "os/OSUltimateClient.tsx" },
  ]},
  "pages/app": { icon: "📱", color: "#06b6d4", files: [
    { file: "Garagem.tsx", label: "Garagem Virtual", cKey: "app/Garagem.tsx" },
  ]},
  "pages/auth": { icon: "🔐", color: "#ef4444", files: [
    { file: "Login.tsx", label: "Login Auth", cKey: "auth/Login.tsx" },
  ]},
};

interface Ann { route: string; rules: string; notes: string; status: "pending"|"wip"|"done"; }
const SK = "doctorcar-dev-ann-v3";

function initAnn(): Record<string, Ann> {
  const r: Record<string, Ann> = {};
  Object.entries(T).forEach(([d, i]) => i.files.forEach(f => { r[`${d}/${f.file}`] = { route: "", rules: "", notes: "", status: "pending" }; }));
  return r;
}

function dl(blob: Blob, name: string) { const u = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = u; a.download = name; document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(u); }

function expJSON(ann: Record<string, Ann>) {
  const d: any = {};
  Object.entries(T).forEach(([dir, info]) => { d[dir] = info.files.map(f => ({ file: f.file, label: f.label, ...(ann[`${dir}/${f.file}`]||{}) })); });
  dl(new Blob([JSON.stringify(d, null, 2)]), "doctorcar-rotas.json");
}

function expCSV(ann: Record<string, Ann>) {
  let c = "Dir,Arquivo,Label,Rota,Regras,Notas,Status\n";
  Object.entries(T).forEach(([dir, info]) => info.files.forEach(f => {
    const a = ann[`${dir}/${f.file}`]||{} as Ann;
    c += `"${dir}","${f.file}","${f.label}","${a.route||""}","${(a.rules||"").replace(/"/g,'""')}","${(a.notes||"").replace(/"/g,'""')}","${a.status||"pending"}"\n`;
  }));
  dl(new Blob([c], { type: "text/csv" }), "doctorcar-rotas.csv");
}

function expHTML(ann: Record<string, Ann>, print = false) {
  const tot = Object.values(T).reduce((s, d) => s + d.files.length, 0);
  const noted = Object.values(ann).filter(a => a.route||a.rules||a.notes).length;
  const done = Object.values(ann).filter(a => a.status==="done").length;
  let h = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>DoctorAuto Rotas</title><style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:'Segoe UI',sans-serif;background:#0f172a;color:#e2e8f0;padding:40px}h1{font-size:26px;color:#f59e0b;margin-bottom:6px}.s{color:#94a3b8;margin-bottom:28px;font-size:13px}.f{margin-bottom:24px;page-break-inside:avoid}.ft{font-size:17px;padding:10px 14px;background:#1e293b;border-radius:8px;margin-bottom:10px;border-left:4px solid var(--c)}.pc{background:#1e293b;border-radius:8px;padding:12px;margin:0 0 8px 16px}.pn{font-weight:600;color:#f8fafc;font-size:14px}.pf{font-size:11px;color:#64748b;font-family:monospace}.fl{font-size:10px;text-transform:uppercase;letter-spacing:1px;color:#64748b;margin-top:6px}.fv{font-size:12px;color:#cbd5e1;background:#0f172a;padding:6px 10px;border-radius:6px;white-space:pre-wrap;margin-top:2px}.b{display:inline-block;padding:2px 8px;border-radius:99px;font-size:10px;font-weight:600}.bd{background:#065f46;color:#6ee7b7}.bw{background:#92400e;color:#fcd34d}.bp{background:#334155;color:#94a3b8}.st{display:flex;gap:20px;margin-bottom:28px}.si{background:#1e293b;padding:14px 20px;border-radius:8px}.sn{font-size:24px;font-weight:700;color:#f59e0b}.sl{font-size:11px;color:#94a3b8}@media print{body{background:#fff;color:#1e293b}.pc,.ft,.si{background:#f1f5f9}.fv{background:#e2e8f0;color:#334155}h1{color:#d97706}}</style></head><body>`;
  h += `<h1>🔧 DoctorAuto — Mapa de Rotas</h1><p class="s">Gerado ${new Date().toLocaleString("pt-BR")} · ${tot} pgs · ${noted} anotadas · ${done} finalizadas</p>`;
  h += `<div class="st"><div class="si"><div class="sn">${tot}</div><div class="sl">Total</div></div><div class="si"><div class="sn">${noted}</div><div class="sl">Anotadas</div></div><div class="si"><div class="sn">${done}</div><div class="sl">Finalizadas</div></div></div>`;
  Object.entries(T).forEach(([dir, info]) => {
    h += `<div class="f" style="--c:${info.color}"><div class="ft">${info.icon} ${dir} (${info.files.length})</div>`;
    info.files.forEach(f => {
      const a = ann[`${dir}/${f.file}`]||{} as Ann;
      const bc = a.status==="done"?"bd":a.status==="wip"?"bw":"bp";
      const bt = a.status==="done"?"Finalizado":a.status==="wip"?"Em progresso":"Pendente";
      h += `<div class="pc"><div style="display:flex;justify-content:space-between;align-items:center"><div><span class="pn">${f.label}</span> <span class="pf">${f.file}</span></div><span class="b ${bc}">${bt}</span></div>`;
      if(a.route) h += `<div class="fl">Rota</div><div class="fv" style="font-family:monospace;color:#60a5fa">${a.route}</div>`;
      if(a.rules) h += `<div class="fl">Regras</div><div class="fv">${a.rules}</div>`;
      if(a.notes) h += `<div class="fl">Anotações</div><div class="fv">${a.notes}</div>`;
      h += `</div>`;
    });
    h += `</div>`;
  });
  h += `</body></html>`;
  if(print) { const w = window.open("","_blank"); if(w){w.document.write(h);w.document.close();setTimeout(()=>w.print(),500);} }
  else dl(new Blob([h],{type:"text/html"}),"doctorcar-rotas.html");
}

// ══ MAIN ══
export default function DevExplorer() {
  const [view, setView] = useState<"dash"|"folder"|"page">("dash");
  const [dir, setDir] = useState<string|null>(null);
  const [pg, setPg] = useState<PF|null>(null);
  const [scale, setScale] = useState(0.5);
  const [showAnn, setShowAnn] = useState(true);
  const [showExp, setShowExp] = useState(false);
  const [search, setSearch] = useState("");
  const [ann, setAnn] = useState<Record<string, Ann>>(() => {
    try { const s = localStorage.getItem(SK); if(s) return {...initAnn(),...JSON.parse(s)}; } catch{} return initAnn();
  });
  useEffect(() => { try{localStorage.setItem(SK,JSON.stringify(ann));}catch{} }, [ann]);
  const upd = useCallback((k: string, f: keyof Ann, v: string) => setAnn(p => ({...p,[k]:{...p[k],[f]:v}})), []);
  const tot = Object.values(T).reduce((s,d)=>s+d.files.length,0);
  const noted = Object.values(ann).filter(a=>a.route||a.rules||a.notes).length;
  const done = Object.values(ann).filter(a=>a.status==="done").length;
  const goHome = () => {setView("dash");setDir(null);setPg(null);};
  const goDir = (d:string) => {setDir(d);setView("folder");setPg(null);};
  const goPg = (d:string,f:PF) => {setDir(d);setPg(f);setView("page");};
  const goBack = () => {setView("folder");setPg(null);};

  const filtered = search ? Object.entries(T).flatMap(([d,i])=>i.files.filter(f=>f.label.toLowerCase().includes(search.toLowerCase())||f.file.toLowerCase().includes(search.toLowerCase())).map(f=>({d,f,i}))) : null;

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* TOP BAR */}
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-border px-4 py-2.5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div onClick={goHome} className="cursor-pointer flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-base font-bold text-black">D</div>
            <div><div className="font-bold text-sm leading-tight">DoctorAuto</div><div className="text-[9px] text-muted-foreground font-mono tracking-widest">DEV EXPLORER</div></div>
          </div>
          {view!=="dash" && <div className="flex items-center gap-1 ml-2 text-[11px] text-muted-foreground">
            <span>/</span><span onClick={goHome} className="cursor-pointer hover:text-foreground">home</span>
            {dir && <><span>/</span><span onClick={goBack} className={`cursor-pointer ${!pg?"text-amber-500":"hover:text-foreground"}`}>{dir}</span></>}
            {pg && <><span>/</span><span className="text-amber-500">{pg.label}</span></>}
          </div>}
        </div>
        <div className="flex items-center gap-2">
          <div className="relative"><input type="text" placeholder="Buscar..." value={search} onChange={e=>setSearch(e.target.value)} className="bg-muted border border-border rounded-lg px-3 py-1 pl-7 text-xs w-44 focus:outline-none focus:ring-1 focus:ring-amber-500"/><span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px]">🔍</span></div>
          <span className="bg-muted px-2 py-0.5 rounded-full text-amber-500 text-[10px] font-medium hidden md:inline">{tot} pgs</span>
          <span className="bg-emerald-900/40 px-2 py-0.5 rounded-full text-emerald-400 text-[10px] font-medium hidden md:inline">{done}✓</span>
          <button onClick={()=>setShowExp(true)} className="bg-gradient-to-r from-amber-500 to-amber-600 text-black px-3 py-1 rounded-lg text-xs font-bold hover:opacity-90">📥 Exportar</button>
        </div>
      </div>

      {/* SEARCH OVERLAY */}
      {search && filtered && <div className="fixed top-12 right-4 bg-card border border-border rounded-xl w-80 max-h-[60vh] overflow-auto z-[60] shadow-2xl">
        <div className="p-2 border-b border-border text-[10px] text-muted-foreground">{filtered.length} resultado(s)</div>
        {filtered.map((r,i) => <div key={i} onClick={()=>{goPg(r.d,r.f);setSearch("");}} className="px-3 py-2 cursor-pointer hover:bg-muted text-xs border-b border-border/30">
          <span>{r.i.icon} <b>{r.f.label}</b></span><div className="text-[10px] text-muted-foreground font-mono">{r.d}/{r.f.file}</div>
        </div>)}
      </div>}

      {/* EXPORT MODAL */}
      {showExp && <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center" onClick={()=>setShowExp(false)}>
        <div onClick={e=>e.stopPropagation()} className="bg-card border border-border rounded-2xl p-6 w-[420px]">
          <h3 className="text-base font-bold mb-4">📥 Exportar Rotas & Anotações</h3>
          <div className="grid gap-2">
            {[{l:"HTML",d:"Relatório visual",i:"🌐",fn:()=>expHTML(ann)},{l:"PDF via Print",d:"Imprimir/salvar",i:"🖨️",fn:()=>expHTML(ann,true)},{l:"JSON",d:"Dados estruturados",i:"📋",fn:()=>expJSON(ann)},{l:"CSV",d:"Excel/Sheets",i:"📊",fn:()=>expCSV(ann)}].map((o,i) =>
              <button key={i} onClick={()=>{o.fn();setShowExp(false);}} className="flex items-center gap-3 bg-muted border border-border rounded-xl px-4 py-3 text-left hover:border-amber-500 transition">
                <span className="text-xl">{o.i}</span><div><div className="font-semibold text-sm">{o.l}</div><div className="text-[11px] text-muted-foreground">{o.d}</div></div>
              </button>)}
          </div>
          <button onClick={()=>setShowExp(false)} className="mt-3 w-full py-1.5 bg-muted rounded-lg text-xs text-muted-foreground">Cancelar</button>
        </div>
      </div>}

      <div className="p-5 max-w-[1600px] mx-auto">

        {/* ══ DASHBOARD ══ */}
        {view==="dash" && <>
          <div className="mb-6"><h1 className="text-xl font-bold tracking-tight mb-1">Mapa de Telas <span className="text-amber-500">DoctorAuto</span></h1><p className="text-muted-foreground text-xs">Clique na pasta → veja preview real de cada componente → anote rotas e regras</p></div>
          <div className="bg-card border border-border rounded-xl p-4 mb-6">
            <div className="flex justify-between items-center mb-2 text-xs"><span className="text-muted-foreground">Progresso</span><span className="text-amber-500 font-bold">{Math.round((done/tot)*100)}%</span></div>
            <div className="h-1.5 bg-muted rounded-full overflow-hidden"><div className="h-full bg-gradient-to-r from-amber-500 to-emerald-500 rounded-full transition-all" style={{width:`${(done/tot)*100}%`}}/></div>
          </div>
          <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Object.entries(T).map(([d,info]) => {
              const dn = info.files.filter(f=>ann[`${d}/${f.file}`]?.status==="done").length;
              return <div key={d} onClick={()=>goDir(d)} className="bg-card border border-border rounded-xl overflow-hidden cursor-pointer hover:border-amber-500/50 hover:-translate-y-0.5 transition-all">
                <div className="h-1" style={{background:info.color}}/>
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2"><span className="text-2xl">{info.icon}</span><div><div className="font-bold text-sm">{d}</div><div className="text-[11px] text-muted-foreground">{info.files.length} páginas</div></div></div>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full" style={{background:info.color+"20",color:info.color}}>{dn}/{info.files.length}</span>
                  </div>
                  <div className="h-1 bg-muted rounded-full overflow-hidden"><div className="h-full rounded-full transition-all" style={{width:`${(dn/info.files.length)*100}%`,background:info.color}}/></div>
                </div>
              </div>;
            })}
          </div>
        </>}

        {/* ══ FOLDER ══ */}
        {view==="folder" && dir && T[dir] && <>
          <button onClick={goHome} className="text-[11px] text-muted-foreground hover:text-foreground mb-3">← Dashboard</button>
          <div className="flex items-center gap-3 mb-5"><span className="text-3xl">{T[dir].icon}</span><div><h2 className="text-lg font-bold">{dir}</h2><p className="text-xs text-muted-foreground">{T[dir].files.length} páginas — clique para preview + anotações</p></div></div>
          <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {T[dir].files.map(f => {
              const k = `${dir}/${f.file}`;
              const a = ann[k]||{} as Ann;
              return <div key={f.file} onClick={()=>goPg(dir,f)} className="bg-card border border-border rounded-xl overflow-hidden cursor-pointer hover:border-amber-500/40 transition">
                {/* MINI PREVIEW */}
                <div className="relative h-44 overflow-hidden bg-background">
                  <div className="absolute inset-0 pointer-events-none" style={{transform:"scale(0.28)",transformOrigin:"top left",width:"357%",height:"357%"}}>
                    <PageErrorBoundary name={f.label}><Suspense fallback={<LoadingSpinner/>}>{PC[f.cKey]?React.createElement(PC[f.cKey]):<div className="p-4 text-muted-foreground">N/A</div>}</Suspense></PageErrorBoundary>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent"/>
                  <div className="absolute bottom-0 left-0 right-0 p-2.5">
                    <div className="flex justify-between items-end">
                      <div><div className="font-semibold text-xs">{f.label}</div><div className="text-[9px] text-muted-foreground font-mono">{f.file}</div></div>
                      <StatusBadge s={a.status}/>
                    </div>
                  </div>
                </div>
                {(a.route||a.rules||a.notes) && <div className="px-2.5 py-1.5 border-t border-border text-[10px] text-muted-foreground flex gap-2">
                  {a.route && <span className="text-blue-400 font-mono truncate max-w-[150px]">{a.route}</span>}
                  {a.rules && <span>📋</span>}{a.notes && <span>📝</span>}
                </div>}
              </div>;
            })}
          </div>
        </>}

        {/* ══ PAGE DETAIL ══ */}
        {view==="page" && dir && pg && <>
          <div className="flex gap-2 mb-3 text-[11px]">
            <button onClick={goHome} className="text-muted-foreground hover:text-foreground">← Home</button>
            <span className="text-muted-foreground">·</span>
            <button onClick={goBack} className="text-muted-foreground hover:text-foreground">← {dir}</button>
          </div>

          {/* HEADER */}
          <div className="bg-card border border-border rounded-xl p-4 mb-3" style={{borderTopColor:T[dir].color,borderTopWidth:3}}>
            <div className="flex justify-between items-start mb-3">
              <div>
                <div className="flex items-center gap-2"><span className="text-xl">{T[dir].icon}</span><h2 className="text-lg font-bold">{pg.label}</h2></div>
                <div className="text-[11px] text-muted-foreground font-mono mt-1">src/{dir.replace("pages (raiz)","pages")}/{pg.file}</div>
              </div>
              <StatusBadge s={ann[`${dir}/${pg.file}`]?.status||"pending"} onClick={()=>{const o:Ann["status"][]= ["pending","wip","done"];const c=ann[`${dir}/${pg.file}`]?.status||"pending";upd(`${dir}/${pg.file}`,"status",o[(o.indexOf(c)+1)%3]);}}/>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex gap-2">
                {(()=>{const i=T[dir].files.findIndex(f=>f.file===pg.file);const p=i>0?T[dir].files[i-1]:null;const n=i<T[dir].files.length-1?T[dir].files[i+1]:null;return<>{p&&<button onClick={()=>setPg(p)} className="bg-muted border border-border rounded-lg px-2.5 py-1 text-[11px] hover:bg-accent">← {p.label}</button>}{n&&<button onClick={()=>setPg(n)} className="bg-muted border border-border rounded-lg px-2.5 py-1 text-[11px] hover:bg-accent">{n.label} →</button>}</>;})()}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-muted-foreground">Zoom:</span>
                {[0.25,0.5,0.75,1].map(s=><button key={s} onClick={()=>setScale(s)} className={`px-1.5 py-0.5 rounded text-[10px] ${scale===s?"bg-amber-500 text-black font-bold":"bg-muted"}`}>{Math.round(s*100)}%</button>)}
                <button onClick={()=>setShowAnn(!showAnn)} className={`px-2 py-0.5 rounded-lg text-[10px] font-medium ${showAnn?"bg-amber-500 text-black":"bg-muted text-muted-foreground"}`}>{showAnn?"📝 ON":"📝 OFF"}</button>
              </div>
            </div>
          </div>

          {/* CONTENT */}
          <div className={`grid gap-3 ${showAnn?"grid-cols-1 lg:grid-cols-[1fr_360px]":"grid-cols-1"}`}>
            {/* PREVIEW */}
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              <div className="px-3 py-1.5 border-b border-border flex items-center justify-between bg-muted/30">
                <span className="text-[10px] font-medium text-muted-foreground">Preview Real</span>
                <span className="text-[9px] text-muted-foreground font-mono">{pg.cKey}</span>
              </div>
              <div className="relative overflow-auto" style={{maxHeight:scale>=0.75?"none":"85vh"}}>
                <div style={{transform:`scale(${scale})`,transformOrigin:"top left",width:`${100/scale}%`}}>
                  <PageErrorBoundary name={pg.label}><Suspense fallback={<LoadingSpinner/>}>{PC[pg.cKey]?React.createElement(PC[pg.cKey]):<div className="p-8 text-muted-foreground text-center">N/A: {pg.cKey}</div>}</Suspense></PageErrorBoundary>
                </div>
              </div>
            </div>

            {/* ANNOTATIONS */}
            {showAnn && <div className="space-y-3">
              <div className="bg-card border border-border rounded-xl p-3">
                <label className="block text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">🔗 Rota</label>
                <input type="text" value={ann[`${dir}/${pg.file}`]?.route||""} onChange={e=>upd(`${dir}/${pg.file}`,"route",e.target.value)} placeholder="/admin/dashboard" className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm font-mono text-blue-400 focus:outline-none focus:ring-1 focus:ring-amber-500"/>
              </div>
              <div className="bg-card border border-border rounded-xl p-3">
                <label className="block text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">📋 Regras</label>
                <textarea value={ann[`${dir}/${pg.file}`]?.rules||""} onChange={e=>upd(`${dir}/${pg.file}`,"rules",e.target.value)} placeholder={"- Acesso: admin, gestão\n- Dados: OS ativas"} rows={5} className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-amber-500 resize-vertical"/>
              </div>
              <div className="bg-card border border-border rounded-xl p-3">
                <label className="block text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">📝 Anotações</label>
                <textarea value={ann[`${dir}/${pg.file}`]?.notes||""} onChange={e=>upd(`${dir}/${pg.file}`,"notes",e.target.value)} placeholder="Pendências, decisões..." rows={4} className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-amber-500 resize-vertical"/>
              </div>
              <div className="bg-card border border-border rounded-xl p-3">
                <label className="block text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">🎯 Status</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {([{v:"pending" as const,l:"Pendente",i:"○"},{v:"wip" as const,l:"WIP",i:"⏳"},{v:"done" as const,l:"Pronto",i:"✓"}]).map(s=>
                    <button key={s.v} onClick={()=>upd(`${dir}/${pg.file}`,"status",s.v)} className={`py-1.5 rounded-lg text-[11px] font-semibold border transition ${(ann[`${dir}/${pg.file}`]?.status||"pending")===s.v?s.v==="done"?"bg-emerald-900/50 border-emerald-700 text-emerald-400":s.v==="wip"?"bg-amber-900/50 border-amber-700 text-amber-400":"bg-slate-800 border-slate-600 text-slate-300":"bg-muted border-border text-muted-foreground hover:border-foreground/20"}`}>{s.i} {s.l}</button>)}
                </div>
              </div>
              <div className="bg-card border border-border rounded-xl p-3">
                <label className="block text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Nav rápida</label>
                <div className="flex flex-wrap gap-1">
                  {T[dir].files.map(f=>{const act=f.file===pg.file;const dn=ann[`${dir}/${f.file}`]?.status==="done";return<button key={f.file} onClick={()=>!act&&setPg(f)} className={`px-1.5 py-0.5 rounded text-[10px] border transition ${act?"border-amber-500 bg-amber-500/20 text-amber-400 font-semibold":dn?"border-emerald-800 bg-emerald-900/20 text-emerald-400":"border-border bg-muted text-muted-foreground hover:text-foreground"}`}>{dn&&!act?"✓ ":""}{f.label}</button>;})}
                </div>
              </div>
            </div>}
          </div>
        </>}
      </div>
    </div>
  );
}

function StatusBadge({s,onClick}:{s:string;onClick?:()=>void}) {
  const m:Record<string,{c:string;t:string}>={done:{c:"bg-emerald-900/50 text-emerald-400 border-emerald-800",t:"✓"},wip:{c:"bg-amber-900/50 text-amber-400 border-amber-800",t:"⏳"},pending:{c:"bg-slate-800 text-slate-400 border-slate-700",t:"○"}};
  const v=m[s]||m.pending;
  return <span onClick={onClick} className={`${v.c} px-1.5 py-0.5 rounded-full text-[9px] font-semibold border ${onClick?"cursor-pointer hover:opacity-80":""}`}>{v.t}</span>;
}

function LoadingSpinner() {
  return <div className="flex items-center justify-center h-full min-h-[200px]"><div className="w-6 h-6 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin"/></div>;
}
