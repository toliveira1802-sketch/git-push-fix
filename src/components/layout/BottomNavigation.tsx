import { useLocation } from "wouter";
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
  const [location, navigate] = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-background border-t border-border px-4 py-3">
      <div className="max-w-2xl mx-auto grid grid-cols-4 gap-2">
        {navItems.map((item) => {
          const isActive = location === item.path;
          return (
            <Button
              key={item.path}
              variant="ghost"
              className={cn(
                "flex flex-col items-center gap-1 h-auto py-2",
                isActive ? "text-primary" : "text-muted-foreground"
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
