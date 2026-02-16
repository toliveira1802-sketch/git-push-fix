import { useLocation } from "wouter";
import { useNavigate } from "@/hooks/useNavigate";
import { Wrench, DollarSign, TrendingUp, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

const tabs = [
  { label: "Operacional", path: "/admin/operacional", icon: Wrench },
  { label: "Financeiro", path: "/admin/financeiro", icon: DollarSign },
  { label: "Produtividade", path: "/admin/produtividade", icon: TrendingUp },
  { label: "Agenda Mec.", path: "/admin/agenda-mecanicos", icon: Calendar },
];

export function AdminSubNav() {
  const [pathname] = useLocation();
  const navigate = useNavigate();

  return (
    <div className="grid grid-cols-4 border-b border-border bg-card shrink-0">
      {tabs.map((tab) => {
        const isActive = pathname === tab.path;
        return (
          <button
            key={tab.path}
            onClick={() => navigate(tab.path)}
            className={cn(
              "flex items-center justify-center gap-2 text-sm py-2.5 transition-colors border-b-2",
              isActive
                ? "text-primary border-primary font-medium bg-primary/5"
                : "text-muted-foreground border-transparent hover:text-foreground hover:bg-accent/50"
            )}
          >
            <tab.icon className="w-4 h-4" />
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}
