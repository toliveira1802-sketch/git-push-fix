import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Settings, 
  Car, 
  Clock, 
  Bell, 
  Save, 
  Loader2,
  Target,
  Calendar,
  DollarSign,
  TrendingUp,
  Star,
  ShoppingCart,
  Wrench,
  Eye,
  Lightbulb,
  ArrowRight,
} from "lucide-react";
import { useNavigate } from "@/hooks/useNavigate";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Meta {
  nome: string;
  valor: string;
  tipo: 'financeira' | 'crescimento' | 'nps' | 'produto' | 'operacional';
  ativo: boolean;
}

interface HorarioFuncionamento {
  seg_sex: { inicio: string; fim: string };
  sab: { inicio: string; fim: string };
}

interface SystemConfig {
  capacidadeMaxima: number;
  horarioFuncionamento: HorarioFuncionamento;
  notificacoesAtivas: boolean;
  periodoVigente: { mes: number; ano: number };
  diasUteis: number;
  metaFaturamento: number;
  metaMecanico: number;
  metas: Meta[];
  exibirMetasSidebar: boolean;
}

const meses = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

const tiposMeta = [
  { value: 'financeira', label: 'Meta Financeira', icon: DollarSign },
  { value: 'crescimento', label: 'Meta de Crescimento', icon: TrendingUp },
  { value: 'nps', label: 'NPS / Satisfação', icon: Star },
  { value: 'produto', label: 'Produto Vendido', icon: ShoppingCart },
  { value: 'operacional', label: 'Meta Operacional', icon: Wrench },
];

const defaultMetas: Meta[] = [
  { nome: 'Faturamento Mensal', valor: '', tipo: 'financeira', ativo: true },
  { nome: 'Crescimento de Clientes', valor: '', tipo: 'crescimento', ativo: false },
  { nome: 'NPS (Satisfação)', valor: '', tipo: 'nps', ativo: false },
  { nome: 'Produtos Vendidos', valor: '', tipo: 'produto', ativo: false },
  { nome: 'OSs Entregues', valor: '', tipo: 'operacional', ativo: false },
];

export default function AdminConfiguracoes() {
  const navigate = useNavigate();
  const [config, setConfig] = useState<SystemConfig>({
    capacidadeMaxima: 20,
    horarioFuncionamento: {
      seg_sex: { inicio: '08:15', fim: '17:30' },
      sab: { inicio: '08:00', fim: '12:00' },
    },
    notificacoesAtivas: true,
    periodoVigente: { mes: new Date().getMonth() + 1, ano: new Date().getFullYear() },
    diasUteis: 22,
    metaFaturamento: 300000,
    metaMecanico: 60000,
    metas: defaultMetas,
    exibirMetasSidebar: false,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
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
          horarioFuncionamento: configMap.horario_funcionamento || {
            seg_sex: { inicio: '08:15', fim: '17:30' },
            sab: { inicio: '08:00', fim: '12:00' },
          },
          notificacoesAtivas: configMap.notificacoes?.ativas ?? true,
          periodoVigente: configMap.periodo_vigente || { mes: new Date().getMonth() + 1, ano: new Date().getFullYear() },
          diasUteis: configMap.meta_mensal?.dias_uteis || 22,
          metaFaturamento: configMap.meta_mensal?.valor || 300000,
          metaMecanico: configMap.meta_mensal?.meta_mecanico || 60000,
          metas: configMap.metas || defaultMetas,
          exibirMetasSidebar: configMap.exibir_metas_sidebar ?? false,
        });
      }
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
        { key: "patio_capacidade", value: { maxima: config.capacidadeMaxima } },
        { key: "horario_funcionamento", value: config.horarioFuncionamento },
        { key: "notificacoes", value: { ativas: config.notificacoesAtivas } },
        { key: "periodo_vigente", value: config.periodoVigente },
        { key: "meta_mensal", value: { valor: config.metaFaturamento, dias_uteis: config.diasUteis, meta_mecanico: config.metaMecanico } },
        { key: "metas", value: config.metas },
        { key: "exibir_metas_sidebar", value: config.exibirMetasSidebar },
      ];

      for (const update of updates) {
        // Check if exists
        const { data: existing } = await supabase
          .from("system_config")
          .select("id")
          .eq("key", update.key)
          .maybeSingle();

        if (existing) {
          await supabase
            .from("system_config")
            .update({ value: JSON.parse(JSON.stringify(update.value)), updated_at: new Date().toISOString() })
            .eq("key", update.key);
        } else {
          await supabase
            .from("system_config")
            .insert({ key: update.key, value: JSON.parse(JSON.stringify(update.value)) });
        }
      }

      toast.success("Configurações salvas!");
    } catch (error) {
      console.error("Error saving config:", error);
      toast.error("Erro ao salvar configurações");
    } finally {
      setSaving(false);
    }
  };

  const updateMeta = (index: number, field: keyof Meta, value: string | boolean) => {
    setConfig(prev => {
      const newMetas = [...prev.metas];
      newMetas[index] = { ...newMetas[index], [field]: value };
      return { ...prev, metas: newMetas };
    });
  };

  const getMetaIcon = (tipo: string) => {
    const meta = tiposMeta.find(t => t.value === tipo);
    if (meta) {
      const Icon = meta.icon;
      return <Icon className="w-4 h-4" />;
    }
    return <Target className="w-4 h-4" />;
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
      <div className="p-6 space-y-6 max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Settings className="w-6 h-6" />
              Configurações
            </h1>
            <p className="text-muted-foreground">
              Configurações gerais e metas do sistema
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

        {/* Período Vigente */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Período Vigente
            </CardTitle>
            <CardDescription>
              Define o mês e ano para cálculo das metas e relatórios
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Mês</Label>
                <Select
                  value={config.periodoVigente.mes.toString()}
                  onValueChange={(v) => setConfig(prev => ({
                    ...prev,
                    periodoVigente: { ...prev.periodoVigente, mes: parseInt(v) }
                  }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {meses.map((mes, idx) => (
                      <SelectItem key={idx} value={(idx + 1).toString()}>
                        {mes}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Ano</Label>
                <Select
                  value={config.periodoVigente.ano.toString()}
                  onValueChange={(v) => setConfig(prev => ({
                    ...prev,
                    periodoVigente: { ...prev.periodoVigente, ano: parseInt(v) }
                  }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[2024, 2025, 2026, 2027].map((ano) => (
                      <SelectItem key={ano} value={ano.toString()}>
                        {ano}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Dias Úteis</Label>
                <Input
                  type="number"
                  value={config.diasUteis}
                  onChange={(e) => setConfig(prev => ({
                    ...prev,
                    diasUteis: parseInt(e.target.value) || 22
                  }))}
                />
              </div>
            </div>

            {/* Metas principais */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div className="p-4 border rounded-lg space-y-2">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-primary" />
                  <Label className="font-medium">Meta de Faturamento</Label>
                </div>
                <Input
                  type="number"
                  value={config.metaFaturamento}
                  onChange={(e) => setConfig(prev => ({
                    ...prev,
                    metaFaturamento: parseFloat(e.target.value) || 0
                  }))}
                  placeholder="R$ 300.000"
                />
                <p className="text-xs text-muted-foreground">
                  Meta mensal de faturamento (usado nos dashboards)
                </p>
              </div>

              <div className="p-4 border rounded-lg space-y-2">
                <div className="flex items-center gap-2">
                  <Wrench className="w-4 h-4 text-orange-500" />
                  <Label className="font-medium">Meta por Mecânico</Label>
                </div>
                <Input
                  type="number"
                  value={config.metaMecanico}
                  onChange={(e) => setConfig(prev => ({
                    ...prev,
                    metaMecanico: parseFloat(e.target.value) || 0
                  }))}
                  placeholder="R$ 60.000"
                />
                <p className="text-xs text-muted-foreground">
                  Meta individual de produtividade por mecânico
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Metas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              Metas do Período
            </CardTitle>
            <CardDescription>
              Configure as metas financeiras, de crescimento, NPS e operacionais
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Exibir no sidebar */}
            <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/30">
              <div className="flex items-center gap-3">
                <Eye className="h-5 w-5 text-muted-foreground" />
                <div>
                  <Label className="font-medium">Exibir Metas no Menu Lateral</Label>
                  <p className="text-sm text-muted-foreground">
                    Adiciona atalho para o dashboard de metas no sidebar
                  </p>
                </div>
              </div>
              <Switch
                checked={config.exibirMetasSidebar}
                onCheckedChange={(checked) => setConfig(prev => ({
                  ...prev,
                  exibirMetasSidebar: checked
                }))}
              />
            </div>

            <Separator />

            {/* Lista de Metas */}
            <div className="space-y-3">
              {config.metas.map((meta, index) => (
                <div
                  key={index}
                  className={`p-4 border rounded-lg transition-opacity ${!meta.ativo ? 'opacity-50' : ''}`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                        {getMetaIcon(meta.tipo)}
                      </div>
                      <span className="font-medium">{meta.nome || 'Nova Meta'}</span>
                    </div>
                    <Switch
                      checked={meta.ativo}
                      onCheckedChange={(checked) => updateMeta(index, 'ativo', checked)}
                    />
                  </div>
                  
                  {meta.ativo && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">Nome</Label>
                        <Input
                          value={meta.nome}
                          onChange={(e) => updateMeta(index, 'nome', e.target.value)}
                          placeholder="Nome da meta"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">Valor/Objetivo</Label>
                        <Input
                          value={meta.valor}
                          onChange={(e) => updateMeta(index, 'valor', e.target.value)}
                          placeholder="R$ 100.000 ou 50"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">Tipo</Label>
                        <Select
                          value={meta.tipo}
                          onValueChange={(v) => updateMeta(index, 'tipo', v)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {tiposMeta.map((tipo) => (
                              <SelectItem key={tipo.value} value={tipo.value}>
                                {tipo.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Resumo */}
            <div className="p-4 rounded-lg bg-muted/50">
              <p className="text-sm font-medium mb-2">Metas Ativas:</p>
              <div className="flex flex-wrap gap-2">
                {config.metas.filter(m => m.ativo).map((meta, idx) => (
                  <Badge key={idx} variant="secondary" className="gap-1">
                    {getMetaIcon(meta.tipo)}
                    {meta.nome}
                    {meta.valor && `: ${meta.valor}`}
                  </Badge>
                ))}
                {config.metas.filter(m => m.ativo).length === 0 && (
                  <span className="text-sm text-muted-foreground">Nenhuma meta ativa</span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Horário de Funcionamento */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Horário de Funcionamento
            </CardTitle>
            <CardDescription>
              Configure os horários de abertura e fechamento
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border rounded-lg space-y-3">
                <Label className="font-medium">Segunda a Sexta</Label>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Abertura</Label>
                    <Input
                      type="time"
                      value={config.horarioFuncionamento.seg_sex.inicio}
                      onChange={(e) => setConfig(prev => ({
                        ...prev,
                        horarioFuncionamento: {
                          ...prev.horarioFuncionamento,
                          seg_sex: { ...prev.horarioFuncionamento.seg_sex, inicio: e.target.value }
                        }
                      }))}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Fechamento</Label>
                    <Input
                      type="time"
                      value={config.horarioFuncionamento.seg_sex.fim}
                      onChange={(e) => setConfig(prev => ({
                        ...prev,
                        horarioFuncionamento: {
                          ...prev.horarioFuncionamento,
                          seg_sex: { ...prev.horarioFuncionamento.seg_sex, fim: e.target.value }
                        }
                      }))}
                    />
                  </div>
                </div>
              </div>

              <div className="p-4 border rounded-lg space-y-3">
                <Label className="font-medium">Sábado</Label>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Abertura</Label>
                    <Input
                      type="time"
                      value={config.horarioFuncionamento.sab.inicio}
                      onChange={(e) => setConfig(prev => ({
                        ...prev,
                        horarioFuncionamento: {
                          ...prev.horarioFuncionamento,
                          sab: { ...prev.horarioFuncionamento.sab, inicio: e.target.value }
                        }
                      }))}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Fechamento</Label>
                    <Input
                      type="time"
                      value={config.horarioFuncionamento.sab.fim}
                      onChange={(e) => setConfig(prev => ({
                        ...prev,
                        horarioFuncionamento: {
                          ...prev.horarioFuncionamento,
                          sab: { ...prev.horarioFuncionamento.sab, fim: e.target.value }
                        }
                      }))}
                    />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Outras Configurações */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Outras Configurações
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <Car className="w-5 h-5 text-muted-foreground" />
                <div>
                  <Label className="font-medium">Capacidade do Pátio</Label>
                  <p className="text-sm text-muted-foreground">
                    Número máximo de veículos
                  </p>
                </div>
              </div>
              <Input
                type="number"
                className="w-24"
                value={config.capacidadeMaxima}
                onChange={(e) => setConfig(prev => ({
                  ...prev,
                  capacidadeMaxima: parseInt(e.target.value) || 0
                }))}
              />
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <Bell className="w-5 h-5 text-muted-foreground" />
                <div>
                  <Label className="font-medium">Notificações Ativas</Label>
                  <p className="text-sm text-muted-foreground">
                    Receber alertas do sistema
                  </p>
                </div>
              </div>
              <Switch
                checked={config.notificacoesAtivas}
                onCheckedChange={(checked) => setConfig(prev => ({
                  ...prev,
                  notificacoesAtivas: checked
                }))}
              />
            </div>

            <Separator />

            <div 
              className="flex items-center justify-between p-4 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => navigate("/admin/melhorias")}
            >
              <div className="flex items-center gap-3">
                <Lightbulb className="w-5 h-5 text-cyan-500" />
                <div>
                  <Label className="font-medium cursor-pointer">Sugestões e Melhorias</Label>
                  <p className="text-sm text-muted-foreground">
                    Ideias e sugestões para o sistema
                  </p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
