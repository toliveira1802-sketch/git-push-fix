import { useNavigate, useLocation } from "react-router-dom";
import { Home, Calendar, History, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navItems = [
  { path: "/", icon: Home, label: "Home" },
  { path: "/agenda", icon: Calendar, label: "Agenda" },
  { path: "/historico", icon: History, label: "Histórico" },
  { path: "/performance", icon: TrendingUp, label: "Performance" },
];

export function BottomNavigation() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-[#111] border-t border-gray-800 px-4 py-3">
      <div className="max-w-2xl mx-auto grid grid-cols-4 gap-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Button
              key={item.path}
              variant="ghost"
              className={cn(
                "flex flex-col items-center gap-1 h-auto py-2",
                isActive ? "text-red-500" : "text-gray-400"
              )}
              onClick={() => navigate(item.path)}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-xs">{item.label}</span>
            </Button>
          );
        })}
      </div>
    </nav>
  );
}
