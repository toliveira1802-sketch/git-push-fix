import { useNavigate } from "@/hooks/useNavigate";
import { Car, Bell, User, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  title?: string;
  showNotifications?: boolean;
  showHomeButton?: boolean;
}

export function Header({ title = "Doctor Auto Prime", showNotifications = true, showHomeButton = true }: HeaderProps) {
  const navigate = useNavigate();

  return (
    <header className="bg-card border-b border-border px-4 py-3 flex items-center justify-between">
      <div className="flex items-center gap-3">
        {showHomeButton && (
          <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
            <Home className="w-5 h-5" />
          </Button>
        )}
        <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/80 rounded-lg flex items-center justify-center">
          <Car className="w-6 h-6 text-primary-foreground" />
        </div>
        <h1 className="text-lg font-bold">{title}</h1>
      </div>

      <div className="flex items-center gap-2">
        {showNotifications && (
          <Button variant="ghost" size="icon" onClick={() => navigate("/avisos")}>
            <Bell className="w-5 h-5" />
          </Button>
        )}
        <Button variant="ghost" size="icon" onClick={() => navigate("/perfil")}>
          <User className="w-5 h-5" />
        </Button>
      </div>
    </header>
  );
}
