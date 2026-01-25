import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/hooks/useTheme";

interface ThemeToggleProps {
  collapsed?: boolean;
}

export function ThemeToggle({ collapsed = false }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size={collapsed ? "icon" : "default"}
      onClick={toggleTheme}
      className="w-full justify-start gap-3"
    >
      {theme === 'dark' ? (
        <>
          <Sun className="h-5 w-5 shrink-0" />
          {!collapsed && <span>Modo Claro</span>}
        </>
      ) : (
        <>
          <Moon className="h-5 w-5 shrink-0" />
          {!collapsed && <span>Modo Escuro</span>}
        </>
      )}
    </Button>
  );
}
