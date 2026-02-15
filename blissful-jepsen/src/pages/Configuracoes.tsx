import { useState, useEffect } from "react";
import { useNavigate } from "@/hooks/useNavigate";
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
import { useTheme } from "@/contexts/ThemeContext";

export default function Configuracoes() {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [instagramHandle, setInstagramHandle] = useState("");
  const [instagramLinked, setInstagramLinked] = useState(false);

  useEffect(() => {
    const savedInstagram = localStorage.getItem("instagramHandle");
    if (savedInstagram) {
      setInstagramHandle(savedInstagram);
      setInstagramLinked(true);
    }
  }, []);

  const handleThemeChange = (newTheme: 'light' | 'dark') => {
    if ((newTheme === 'dark' && theme !== 'dark') || (newTheme === 'light' && theme !== 'light')) {
      toggleTheme?.();
      toast.success("Tema atualizado!");
    }
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
      <div className="bg-primary p-4 pt-6">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-primary-foreground hover:bg-primary-foreground/20"
            onClick={() => window.history.back()}
          >
            <ArrowLeft className="h-6 w-6" />
          </Button>
          <h1 className="text-xl font-semibold text-primary-foreground">Configurações</h1>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Appearance */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Palette className="h-5 w-5 text-primary" />
              Aparência
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="theme">Tema</Label>
              <Select value={theme} onValueChange={(v) => handleThemeChange(v as 'light' | 'dark')}>
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
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Notifications - Info only */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary" />
              Notificações
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3 p-3 bg-primary/10 rounded-lg">
              <Bell className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm font-medium">Notificações ativas</p>
                <p className="text-xs text-muted-foreground">Você receberá lembretes de serviços e promoções</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Instagram */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Instagram className="h-5 w-5 text-primary" />
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
