import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  ArrowLeft, 
  Instagram, 
  Palette, 
  Bell, 
  Moon, 
  Sun,
  Smartphone,
  ExternalLink,
  LogOut
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

type ThemeMode = "light" | "dark" | "system";

export default function Configuracoes() {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const [theme, setTheme] = useState<ThemeMode>("dark");
  const [notifications, setNotifications] = useState(true);
  const [instagramHandle, setInstagramHandle] = useState("");
  const [instagramLinked, setInstagramLinked] = useState(false);

  useEffect(() => {
    // Load saved preferences
    const savedTheme = localStorage.getItem("theme") as ThemeMode;
    if (savedTheme) {
      setTheme(savedTheme);
      applyTheme(savedTheme);
    }

    const savedNotifications = localStorage.getItem("notifications");
    if (savedNotifications !== null) {
      setNotifications(savedNotifications === "true");
    }

    const savedInstagram = localStorage.getItem("instagramHandle");
    if (savedInstagram) {
      setInstagramHandle(savedInstagram);
      setInstagramLinked(true);
    }
  }, []);

  const applyTheme = (mode: ThemeMode) => {
    const root = document.documentElement;
    
    if (mode === "system") {
      const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      root.classList.toggle("dark", systemDark);
    } else {
      root.classList.toggle("dark", mode === "dark");
    }
  };

  const handleThemeChange = (newTheme: ThemeMode) => {
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    applyTheme(newTheme);
    toast.success("Tema atualizado!");
  };

  const handleNotificationsChange = (enabled: boolean) => {
    setNotifications(enabled);
    localStorage.setItem("notifications", String(enabled));
    toast.success(enabled ? "Notificações ativadas" : "Notificações desativadas");
  };

  const handleLinkInstagram = () => {
    if (instagramHandle) {
      localStorage.setItem("instagramHandle", instagramHandle);
      setInstagramLinked(true);
      toast.success("Instagram vinculado com sucesso!");
    }
  };

  const handleUnlinkInstagram = () => {
    localStorage.removeItem("instagramHandle");
    setInstagramHandle("");
    setInstagramLinked(false);
    toast.success("Instagram desvinculado");
  };

  const handleLogout = async () => {
    await signOut();
    navigate("/login");
    toast.success("Você saiu da sua conta");
  };

  return (
    <div className="min-h-screen bg-background pb-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-600 to-red-700 p-4 pt-6">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-white hover:bg-white/20"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-6 w-6" />
          </Button>
          <h1 className="text-xl font-semibold text-white">Configurações</h1>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Appearance */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Palette className="h-5 w-5 text-red-500" />
              Aparência
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="theme">Tema</Label>
              <Select value={theme} onValueChange={(v) => handleThemeChange(v as ThemeMode)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">
                    <div className="flex items-center gap-2">
                      <Sun className="h-4 w-4" />
                      Claro
                    </div>
                  </SelectItem>
                  <SelectItem value="dark">
                    <div className="flex items-center gap-2">
                      <Moon className="h-4 w-4" />
                      Escuro
                    </div>
                  </SelectItem>
                  <SelectItem value="system">
                    <div className="flex items-center gap-2">
                      <Smartphone className="h-4 w-4" />
                      Sistema
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Bell className="h-5 w-5 text-red-500" />
              Notificações
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="notifications">Receber notificações</Label>
                <p className="text-sm text-muted-foreground">Lembretes de serviços e promoções</p>
              </div>
              <Switch
                id="notifications"
                checked={notifications}
                onCheckedChange={handleNotificationsChange}
              />
            </div>
          </CardContent>
        </Card>

        {/* Instagram */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Instagram className="h-5 w-5 text-pink-500" />
              Instagram
            </CardTitle>
            <CardDescription>
              Vincule seu Instagram para ganhar pontos extras
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {instagramLinked ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm">@{instagramHandle}</span>
                  <ExternalLink className="h-4 w-4 text-muted-foreground" />
                </div>
                <Button variant="outline" size="sm" onClick={handleUnlinkInstagram}>
                  Desvincular
                </Button>
              </div>
            ) : (
              <div className="flex gap-2">
                <Input
                  placeholder="@seu_instagram"
                  value={instagramHandle}
                  onChange={(e) => setInstagramHandle(e.target.value.replace("@", ""))}
                />
                <Button onClick={handleLinkInstagram}>Vincular</Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Separator />

        {/* Logout */}
        <Card>
          <CardContent className="pt-6">
            <Button
              variant="outline"
              className="w-full border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sair da Conta
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
