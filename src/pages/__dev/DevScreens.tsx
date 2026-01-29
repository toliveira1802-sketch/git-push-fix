import { Link } from "react-router-dom";

export default function DevScreens() {
  const screens = [
    // Cliente
    { path: "/", label: "🏠 Home / Index" },
    { path: "/login", label: "🔐 Login" },
    { path: "/register", label: "📝 Registro" },
    { path: "/perfil", label: "👤 Perfil" },
    { path: "/historico", label: "📋 Histórico" },
    { path: "/veiculos", label: "🚗 Veículos" },
    { path: "/agenda", label: "📅 Agenda" },
    { path: "/visao-geral", label: "📊 Visão Geral" },

    // OS Cliente
    { path: "/os/123", label: "📄 OS Cliente • Nova" },
    { path: "/os/123?state=review", label: "📄 OS Cliente • Em revisão" },
    { path: "/os/123?state=approved", label: "📄 OS Cliente • Aprovada" },

    // Admin
    { path: "/admin", label: "🏢 Admin • Dashboard" },
    { path: "/admin/os-ultimate", label: "⚡ Admin • OS Ultimate" },
    { path: "/admin/ordens-servico", label: "📋 Admin • Ordens de Serviço" },
    { path: "/admin/clientes", label: "👥 Admin • Clientes" },
    { path: "/admin/veiculos", label: "🚗 Admin • Veículos" },
    { path: "/admin/agendamentos", label: "📅 Admin • Agendamentos" },
    { path: "/admin/cadastros", label: "📁 Admin • Cadastros" },

    // Gestão
    { path: "/gestao", label: "📈 Gestão • Dashboard" },
    { path: "/gestao/rh", label: "👔 Gestão • RH" },
    { path: "/gestao/operacoes", label: "⚙️ Gestão • Operações" },
    { path: "/gestao/financeiro", label: "💰 Gestão • Financeiro" },
  ];

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">📐 Screen Gallery (DEV)</h1>

      <ul className="space-y-2">
        {screens.map((s) => (
          <li key={s.path}>
            <Link
              to={s.path}
              className="text-blue-600 hover:underline"
            >
              {s.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
