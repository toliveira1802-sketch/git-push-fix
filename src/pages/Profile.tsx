import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Gift, Settings, LogOut, ChevronRight, Award, Crown, Edit2, Camera, Loader2, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { EditProfileDialog } from "@/components/profile/EditProfileDialog";
import { LoyaltyCard } from "@/components/profile/LoyaltyCard";

interface Profile {
  id: string;
  full_name: string | null;
  phone: string | null;
  cpf: string | null;
  avatar_url: string | null;
  birthday: string | null;
  loyalty_points: number;
  loyalty_level: string;
}

const loyaltyConfig = {
  bronze: { label: "Bronze", color: "bg-amber-700", nextLevel: "silver", pointsNeeded: 500, icon: Award },
  silver: { label: "Prata", color: "bg-slate-400", nextLevel: "gold", pointsNeeded: 1500, icon: Award },
  gold: { label: "Ouro", color: "bg-yellow-500", nextLevel: "platinum", pointsNeeded: 3000, icon: Award },
  platinum: { label: "Platinum", color: "bg-gradient-to-r from-slate-600 to-slate-400", nextLevel: null, pointsNeeded: null, icon: Crown },
};

export default function Profile() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    // Mock profile data
    const savedProfile = localStorage.getItem('mock_profile');
    const mockProfile: Profile = {
      id: "1",
      full_name: savedProfile ? JSON.parse(savedProfile).full_name : user?.email?.split('@')[0] || "Usuário",
      phone: savedProfile ? JSON.parse(savedProfile).phone : "(11) 99999-9999",
      cpf: null,
      avatar_url: null,
      birthday: savedProfile ? JSON.parse(savedProfile).birthday : "1990-05-15",
      loyalty_points: 350,
      loyalty_level: "bronze",
    };
    setProfile(mockProfile);
    setLoading(false);
  };

  const handleLogout = async () => {
    await signOut();
    navigate("/login");
    toast.success("Você saiu da sua conta");
  };

  const currentLoyalty = loyaltyConfig[profile?.loyalty_level as keyof typeof loyaltyConfig] || loyaltyConfig.bronze;
  const progressToNext = currentLoyalty.pointsNeeded 
    ? Math.min(((profile?.loyalty_points || 0) / currentLoyalty.pointsNeeded) * 100, 100)
    : 100;

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Floating Back Button */}
      <Button
        variant="default"
        size="icon"
        className="fixed bottom-6 left-6 z-50 h-14 w-14 rounded-full shadow-lg bg-gradient-to-r from-red-600 to-red-700 hover:opacity-90"
        onClick={() => navigate(-1)}
      >
        <ArrowLeft className="h-6 w-6 text-white" />
      </Button>

      {/* Header */}
      <div className="relative">
        <div className="absolute inset-0 h-48 bg-gradient-to-r from-red-600 to-red-700 opacity-90" />
        <div className="relative z-10 p-4 pt-6">
          <div className="flex items-center justify-between mb-6">
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-white hover:bg-white/20"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="h-6 w-6" />
            </Button>
            <h1 className="text-xl font-semibold text-white">Meu Perfil</h1>
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-white hover:bg-white/20"
              onClick={() => setEditDialogOpen(true)}
            >
              <Edit2 className="h-5 w-5" />
            </Button>
          </div>

          {/* Profile Card */}
          <Card className="mx-2 shadow-xl border-0 overflow-visible">
            <CardContent className="pt-0 pb-6 relative">
              <div className="flex flex-col items-center -mt-12">
                <div className="relative">
                  <Avatar className="h-24 w-24 border-4 border-background shadow-lg">
                    <AvatarImage src={profile?.avatar_url || undefined} />
                    <AvatarFallback className="text-2xl bg-gradient-to-r from-red-600 to-red-700 text-white">
                      {profile?.full_name?.charAt(0)?.toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <button 
                    onClick={() => setEditDialogOpen(true)}
                    className="absolute bottom-0 right-0 bg-red-600 text-white rounded-full p-2 shadow-md hover:bg-red-700 transition-colors"
                  >
                    <Camera className="h-4 w-4" />
                  </button>
                </div>

                <h2 className="mt-4 text-xl font-bold text-foreground">
                  {profile?.full_name || "Usuário"}
                </h2>
                {profile?.phone && (
                  <p className="text-muted-foreground">{profile.phone}</p>
                )}

                {/* Loyalty Badge */}
                <Badge className={`mt-3 ${currentLoyalty.color} text-white px-4 py-1`}>
                  <currentLoyalty.icon className="h-4 w-4 mr-2" />
                  Cliente {currentLoyalty.label}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="px-4 mt-6 space-y-4">
        {/* Birthday Card */}
        {profile?.birthday && (
          <Card className="border-dashed border-red-500/30 bg-red-500/5">
            <CardContent className="flex items-center gap-4 py-4">
              <div className="h-12 w-12 rounded-full bg-red-500/10 flex items-center justify-center">
                <Gift className="h-6 w-6 text-red-500" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-foreground">Aniversário</p>
                <p className="text-sm text-muted-foreground">15 de maio</p>
              </div>
              <Badge variant="secondary" className="bg-red-500/10 text-red-500">
                Em breve!
              </Badge>
            </CardContent>
          </Card>
        )}

        {/* Loyalty Card */}
        <LoyaltyCard 
          cashback={(profile?.loyalty_points || 0) * 0.15}
          level={profile?.loyalty_level || "bronze"}
          progress={progressToNext}
        />

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-3">
          <Card className="border-0 bg-gradient-to-br from-red-600/10 to-red-700/5">
            <CardContent className="p-4 flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-red-600/20 rounded-full flex items-center justify-center mb-2">
                <span className="text-2xl">📊</span>
              </div>
              <span className="text-xs text-muted-foreground">Estatísticas</span>
              <span className="text-lg font-bold text-foreground">12</span>
              <span className="text-[10px] text-muted-foreground">serviços</span>
            </CardContent>
          </Card>
          <Card className="border-0 bg-gradient-to-br from-yellow-600/10 to-yellow-700/5">
            <CardContent className="p-4 flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-yellow-600/20 rounded-full flex items-center justify-center mb-2">
                <span className="text-2xl">🏆</span>
              </div>
              <span className="text-xs text-muted-foreground">Conquistas</span>
              <span className="text-lg font-bold text-foreground">5</span>
              <span className="text-[10px] text-muted-foreground">badges</span>
            </CardContent>
          </Card>
          <Card className="border-0 bg-gradient-to-br from-green-600/10 to-green-700/5">
            <CardContent className="p-4 flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-green-600/20 rounded-full flex items-center justify-center mb-2">
                <span className="text-2xl">💰</span>
              </div>
              <span className="text-xs text-muted-foreground">Economia</span>
              <span className="text-lg font-bold text-foreground">R$480</span>
              <span className="text-[10px] text-muted-foreground">economizados</span>
            </CardContent>
          </Card>
        </div>

        <Separator className="my-6" />

        {/* Menu Options */}
        <div className="space-y-2">
          <MenuOption 
            icon={TrendingUp} 
            label="Visão Geral" 
            badge="Novo"
            onClick={() => navigate("/visao-geral")}
          />
          <MenuOption 
            icon={Settings} 
            label="Configurações" 
            onClick={() => navigate("/configuracoes")}
          />
          <MenuOption 
            icon={LogOut} 
            label="Sair" 
            variant="danger"
            onClick={handleLogout}
          />
        </div>
      </div>

      <EditProfileDialog 
        open={editDialogOpen} 
        onOpenChange={setEditDialogOpen}
        profile={profile}
        onSave={fetchProfile}
      />
    </div>
  );
}

interface MenuOptionProps {
  icon: React.ElementType;
  label: string;
  badge?: string;
  variant?: "default" | "danger";
  onClick: () => void;
}

function MenuOption({ icon: Icon, label, badge, variant = "default", onClick }: MenuOptionProps) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-4 p-4 rounded-xl transition-colors ${
        variant === "danger" 
          ? "text-destructive hover:bg-destructive/10" 
          : "hover:bg-muted"
      }`}
    >
      <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
        variant === "danger" ? "bg-destructive/10" : "bg-muted"
      }`}>
        <Icon className="h-5 w-5" />
      </div>
      <span className="flex-1 text-left font-medium">{label}</span>
      {badge && (
        <Badge className="bg-red-600 text-white">{badge}</Badge>
      )}
      <ChevronRight className="h-5 w-5 text-muted-foreground" />
    </button>
  );
}
