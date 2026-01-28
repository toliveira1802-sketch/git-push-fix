import { Link } from "react-router-dom";

export default function DevScreens() {
  const screens = [
    { path: "/", label: "Home / Index" },
    { path: "/login", label: "Login" },
    { path: "/perfil", label: "Perfil" },

    { path: "/os/123?state=review", label: "OS Cliente • Em revisão" },
    { path: "/os/123?state=approved", label: "OS Cliente • Aprovada (travada)" },

    { path: "/admin/ordens-servico", label: "Admin • Ordens de Serviço" },
    { path: "/admin", label: "Admin • Dashboard" },
    { path: "/gestao", label: "Gestão • Dashboard" },
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
