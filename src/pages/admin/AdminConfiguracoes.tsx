import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { 
  Settings, 
  Car, 
  Clock, 
  Bell, 
  Save, 
  Loader2,
  Users,
  Wrench
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface SystemConfig {
  capacidadeMaxima: number;
  horaAbertura: string;
  horaFechamento: string;
  notificacoesAtivas: boolean;
}

export default function AdminConfiguracoes() {
  const [config, setConfig] = useState<SystemConfig>({
    capacidadeMaxima: 20,
    horaAbertura: "08:00",
    horaFechamento: "18:00",
    notificacoesAtivas: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showAddMechanic, setShowAddMechanic] = useState(false);
  const [newMechanic, setNewMechanic] = useState({ name: "", specialty: "", phone: "" });
  const [mechanics, setMechanics] = useState<any[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch config
      const { data: configData } = await supabase
        .from("system_config")
        .select("key, value");

      if (configData) {
        const configMap: Record<string, any> = {};
        configData.forEach((c) => {
          configMap[c.key] = c.value;
        });

        setConfig({
          capacidadeMaxima: configMap.patio_capacidade?.maxima || 20,
          horaAbertura: configMap.horario?.abertura || "08:00",
          horaFechamento: configMap.horario?.fechamento || "18:00",
          notificacoesAtivas: configMap.notificacoes?.ativas ?? true,
        });
      }

      // Fetch mechanics
      const { data: mechanicsData } = await supabase
        .from("mechanics")
        .select("*")
        .order("name");

      setMechanics(mechanicsData || []);
    } catch (error) {
      console.error("Error fetching config:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const updates = [
        {
          key: "patio_capacidade",
          value: { maxima: config.capacidadeMaxima },
        },
        {
          key: "horario",
          value: { abertura: config.horaAbertura, fechamento: config.horaFechamento },
        },
        {
          key: "notificacoes",
          value: { ativas: config.notificacoesAtivas },
        },
      ];

      for (const update of updates) {
        await supabase
          .from("system_config")
          .upsert({ key: update.key, value: update.value });
      }

      toast.success("Configurações salvas!");
    } catch (error) {
      console.error("Error saving config:", error);
      toast.error("Erro ao salvar configurações");
    } finally {
      setSaving(false);
    }
  };

  const handleAddMechanic = async () => {
    if (!newMechanic.name.trim()) {
      toast.error("Nome é obrigatório");
      return;
    }

    try {
      const { error } = await supabase.from("mechanics").insert({
        name: newMechanic.name,
        specialty: newMechanic.specialty || null,
        phone: newMechanic.phone || null,
      });

      if (error) throw error;

      toast.success("Mecânico adicionado!");
      setNewMechanic({ name: "", specialty: "", phone: "" });
      setShowAddMechanic(false);
      fetchData();
    } catch (error) {
      console.error("Error adding mechanic:", error);
      toast.error("Erro ao adicionar mecânico");
    }
  };

  const handleToggleMechanic = async (id: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from("mechanics")
        .update({ is_active: isActive })
        .eq("id", id);

      if (error) throw error;
      fetchData();
    } catch (error) {
      console.error("Error updating mechanic:", error);
      toast.error("Erro ao atualizar mecânico");
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Configurações</h1>
            <p className="text-muted-foreground">
              Configurações gerais do sistema
            </p>
          </div>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            Salvar
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Configurações Gerais */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Configurações Gerais
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Car className="w-4 h-4" />
                  Capacidade Máxima do Pátio
                </Label>
                <Input
                  type="number"
                  value={config.capacidadeMaxima}
                  onChange={(e) =>
                    setConfig((prev) => ({
                      ...prev,
                      capacidadeMaxima: parseInt(e.target.value) || 0,
                    }))
                  }
                />
                <p className="text-xs text-muted-foreground">
                  Número máximo de veículos no pátio
                </p>
              </div>

              <Separator />

              <div className="space-y-4">
                <Label className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Horário de Funcionamento
                </Label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs text-muted-foreground">Abertura</Label>
                    <Input
                      type="time"
                      value={config.horaAbertura}
                      onChange={(e) =>
                        setConfig((prev) => ({
                          ...prev,
                          horaAbertura: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Fechamento</Label>
                    <Input
                      type="time"
                      value={config.horaFechamento}
                      onChange={(e) =>
                        setConfig((prev) => ({
                          ...prev,
                          horaFechamento: e.target.value,
                        }))
                      }
                    />
                  </div>
                </div>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-2">
                  <Bell className="w-4 h-4" />
                  Notificações Ativas
                </Label>
                <Switch
                  checked={config.notificacoesAtivas}
                  onCheckedChange={(checked) =>
                    setConfig((prev) => ({
                      ...prev,
                      notificacoesAtivas: checked,
                    }))
                  }
                />
              </div>
            </CardContent>
          </Card>

          {/* Mecânicos */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Mecânicos
                </CardTitle>
                <Dialog open={showAddMechanic} onOpenChange={setShowAddMechanic}>
                  <DialogTrigger asChild>
                    <Button size="sm">Adicionar</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Novo Mecânico</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 mt-4">
                      <div>
                        <Label>Nome *</Label>
                        <Input
                          value={newMechanic.name}
                          onChange={(e) =>
                            setNewMechanic((prev) => ({ ...prev, name: e.target.value }))
                          }
                          placeholder="Nome completo"
                        />
                      </div>
                      <div>
                        <Label>Especialidade</Label>
                        <Input
                          value={newMechanic.specialty}
                          onChange={(e) =>
                            setNewMechanic((prev) => ({ ...prev, specialty: e.target.value }))
                          }
                          placeholder="Ex: Motor, Elétrica, Suspensão"
                        />
                      </div>
                      <div>
                        <Label>Telefone</Label>
                        <Input
                          value={newMechanic.phone}
                          onChange={(e) =>
                            setNewMechanic((prev) => ({ ...prev, phone: e.target.value }))
                          }
                          placeholder="(11) 99999-9999"
                        />
                      </div>
                      <Button className="w-full" onClick={handleAddMechanic}>
                        Adicionar Mecânico
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {mechanics.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  Nenhum mecânico cadastrado
                </p>
              ) : (
                mechanics.map((mechanic) => (
                  <div
                    key={mechanic.id}
                    className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Wrench className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{mechanic.name}</p>
                        {mechanic.specialty && (
                          <p className="text-xs text-muted-foreground">
                            {mechanic.specialty}
                          </p>
                        )}
                      </div>
                    </div>
                    <Switch
                      checked={mechanic.is_active}
                      onCheckedChange={(checked) =>
                        handleToggleMechanic(mechanic.id, checked)
                      }
                    />
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
