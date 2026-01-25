import { useNavigate } from "react-router-dom";
import { Car, Bell, User } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  title?: string;
  showNotifications?: boolean;
}

export function Header({ title = "Doctor Auto Prime", showNotifications = true }: HeaderProps) {
  const navigate = useNavigate();

  return (
    <header className="bg-[#111] border-b border-gray-800 px-4 py-3 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-red-600 to-red-700 rounded-lg flex items-center justify-center">
          <Car className="w-6 h-6 text-white" />
        </div>
        <h1 className="text-lg font-bold text-white">{title}</h1>
      </div>

      <div className="flex items-center gap-2">
        {showNotifications && (
          <Button variant="ghost" size="icon" onClick={() => navigate("/avisos")}>
            <Bell className="w-5 h-5 text-white" />
          </Button>
        )}
        <Button variant="ghost" size="icon" onClick={() => navigate("/perfil")}>
          <User className="w-5 h-5 text-white" />
        </Button>
      </div>
    </header>
  );
}
