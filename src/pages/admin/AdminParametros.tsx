import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useUserRole } from '@/hooks/useUserRole';
import { Settings, Calendar, Target, Car, Save, Loader2, Lock, Clock, TrendingUp, Eye } from 'lucide-react';

interface HorarioFuncionamento {
  seg_sex: { inicio: string; fim: string };
  sab: { inicio: string; fim: string };
}

interface Meta {
  nome: string;
  valor: string;
  tipo: 'financeira' | 'crescimento' | 'nps' | 'produto' | 'operacional';
  ativo: boolean;
}

interface SystemConfig {
  periodo_vigente: { mes: number; ano: number };
  horario_funcionamento: HorarioFuncionamento;
  dias_trabalho: {
    seg: boolean;
    ter: boolean;
    qua: boolean;
    qui: boolean;
    sex: boolean;
    sab: boolean;
    dom: boolean;
    feriados: string[];
  };
  metas: Meta[];
  exibir_metas_sidebar: boolean;
  patio_capacidade: { maxima: number };
}

const meses = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

const diasSemana = [
  { key: 'seg', label: 'Segunda' },
  { key: 'ter', label: 'Terça' },
  { key: 'qua', label: 'Quarta' },
  { key: 'qui', label: 'Quinta' },
  { key: 'sex', label: 'Sexta' },
  { key: 'sab', label: 'Sábado' },
  { key: 'dom', label: 'Domingo' },
];

const tiposMeta = [
  { value: 'financeira', label: 'Meta Financeira', icon: '💰' },
  { value: 'crescimento', label: 'Meta de Crescimento', icon: '📈' },
  { value: 'nps', label: 'NPS / Satisfação', icon: '⭐' },
  { value: 'produto', label: 'Produto Vendido', icon: '🛒' },
  { value: 'operacional', label: 'Meta Operacional', icon: '⚙️' },
];

const defaultMetas: Meta[] = [
  { nome: 'Faturamento Mensal', valor: '', tipo: 'financeira', ativo: true },
  { nome: 'Crescimento de Clientes', valor: '', tipo: 'crescimento', ativo: false },
  { nome: 'NPS (Satisfação)', valor: '', tipo: 'nps', ativo: false },
  { nome: 'Produtos Vendidos', valor: '', tipo: 'produto', ativo: false },
  { nome: 'OSs Entregues', valor: '', tipo: 'operacional', ativo: false },
];

export default function AdminParametros() {
  const { role, isLoading: roleLoading } = useUserRole();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [config, setConfig] = useState<SystemConfig>({
    periodo_vigente: { mes: new Date().getMonth() + 1, ano: new Date().getFullYear() },
    horario_funcionamento: {
      seg_sex: { inicio: '08:15', fim: '17:30' },
      sab: { inicio: '08:00', fim: '12:00' },
    },
    dias_trabalho: { seg: true, ter: true, qua: true, qui: true, sex: true, sab: true, dom: false, feriados: [] },
    metas: defaultMetas,
    exibir_metas_sidebar: false,
    patio_capacidade: { maxima: 20 },
  });

  const canEdit = role === 'gestao' || role === 'dev';

  // Fetch configs
  useEffect(() => {
    const fetchConfigs = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('system_config')
          .select('key, value');

        if (error) throw error;

        const configMap: Record<string, unknown> = {};
        data?.forEach(row => {
          configMap[row.key] = row.value;
        });

        setConfig(prev => ({
          periodo_vigente: (configMap.periodo_vigente as SystemConfig['periodo_vigente']) || prev.periodo_vigente,
          horario_funcionamento: (configMap.horario_funcionamento as SystemConfig['horario_funcionamento']) || prev.horario_funcionamento,
          dias_trabalho: (configMap.dias_trabalho as SystemConfig['dias_trabalho']) || prev.dias_trabalho,
          metas: (configMap.metas as SystemConfig['metas']) || prev.metas,
          exibir_metas_sidebar: (configMap.exibir_metas_sidebar as boolean) ?? prev.exibir_metas_sidebar,
          patio_capacidade: (configMap.patio_capacidade as SystemConfig['patio_capacidade']) || prev.patio_capacidade,
        }));
      } catch (error) {
        console.error('Error fetching config:', error);
        toast.error('Erro ao carregar configurações');
      } finally {
        setLoading(false);
      }
    };

    fetchConfigs();
  }, []);

  // Save config
  const saveConfig = async (key: string, value: unknown) => {
    try {
      const { data: existing } = await supabase
        .from('system_config')
        .select('id')
        .eq('key', key)
        .maybeSingle();

      if (existing) {
        const { error } = await supabase
          .from('system_config')
          .update({ value: JSON.parse(JSON.stringify(value)), updated_at: new Date().toISOString() })
          .eq('key', key);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('system_config')
          .insert([{ key, value: JSON.parse(JSON.stringify(value)) }]);
        if (error) throw error;
      }
    } catch (error) {
      console.error('Error saving config:', error);
      throw error;
    }
  };

  const handleSaveAll = async () => {
    if (!canEdit) {
      toast.error('Você não tem permissão para editar');
      return;
    }

    setSaving(true);
    try {
      await Promise.all([
        saveConfig('periodo_vigente', config.periodo_vigente),
        saveConfig('horario_funcionamento', config.horario_funcionamento),
        saveConfig('dias_trabalho', config.dias_trabalho),
        saveConfig('metas', config.metas),
        saveConfig('exibir_metas_sidebar', config.exibir_metas_sidebar),
        saveConfig('patio_capacidade', config.patio_capacidade),
      ]);
      toast.success('Configurações salvas com sucesso!');
    } catch (error) {
      toast.error('Erro ao salvar configurações');
    } finally {
      setSaving(false);
    }
  };

  // Calculate working days in current period
  const calcularDiasUteis = () => {
    const { mes, ano } = config.periodo_vigente;
    const diasNoMes = new Date(ano, mes, 0).getDate();
    let diasUteis = 0;

    for (let dia = 1; dia <= diasNoMes; dia++) {
      const data = new Date(ano, mes - 1, dia);
      const diaSemana = data.getDay();
      const diasMap: Record<number, keyof SystemConfig['dias_trabalho']> = {
        0: 'dom', 1: 'seg', 2: 'ter', 3: 'qua', 4: 'qui', 5: 'sex', 6: 'sab'
      };
      const diaKey = diasMap[diaSemana];
      if (config.dias_trabalho[diaKey] === true) {
        diasUteis++;
      }
    }

    // Subtrair feriados
    diasUteis -= config.dias_trabalho.feriados.length;

    return Math.max(0, diasUteis);
  };

  const updateMeta = (index: number, field: keyof Meta, value: string | boolean) => {
    setConfig(prev => {
      const newMetas = [...prev.metas];
      newMetas[index] = { ...newMetas[index], [field]: value };
      return { ...prev, metas: newMetas };
    });
  };

  if (loading || roleLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
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
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Settings className="h-6 w-6" />
              Parâmetros do Sistema
            </h1>
            <p className="text-muted-foreground">
              Configurações operacionais do período vigente
            </p>
          </div>
          {!canEdit && (
            <Badge variant="outline" className="gap-1">
              <Lock className="h-3 w-3" />
              Somente visualização
            </Badge>
          )}
        </div>

        {/* Período Vigente */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Período Vigente
            </CardTitle>
            <CardDescription>
              Define o mês e ano que será utilizado nos relatórios e métricas
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Mês</Label>
                <Select
                  value={config.periodo_vigente.mes.toString()}
                  onValueChange={(v) => setConfig(prev => ({
                    ...prev,
                    periodo_vigente: { ...prev.periodo_vigente, mes: parseInt(v) }
                  }))}
                  disabled={!canEdit}
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
                  value={config.periodo_vigente.ano.toString()}
                  onValueChange={(v) => setConfig(prev => ({
                    ...prev,
                    periodo_vigente: { ...prev.periodo_vigente, ano: parseInt(v) }
                  }))}
                  disabled={!canEdit}
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
            </div>
          </CardContent>
        </Card>

        {/* Horário de Funcionamento */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Horário de Funcionamento
            </CardTitle>
            <CardDescription>
              Configure os horários de abertura e fechamento da oficina
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div className="p-4 border rounded-lg space-y-3">
                <Label className="font-medium">Segunda a Sexta-feira</Label>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm text-muted-foreground">Abertura</Label>
                    <Input
                      type="time"
                      value={config.horario_funcionamento.seg_sex.inicio}
                      onChange={(e) => setConfig(prev => ({
                        ...prev,
                        horario_funcionamento: {
                          ...prev.horario_funcionamento,
                          seg_sex: { ...prev.horario_funcionamento.seg_sex, inicio: e.target.value }
                        }
                      }))}
                      disabled={!canEdit}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm text-muted-foreground">Fechamento</Label>
                    <Input
                      type="time"
                      value={config.horario_funcionamento.seg_sex.fim}
                      onChange={(e) => setConfig(prev => ({
                        ...prev,
                        horario_funcionamento: {
                          ...prev.horario_funcionamento,
                          seg_sex: { ...prev.horario_funcionamento.seg_sex, fim: e.target.value }
                        }
                      }))}
                      disabled={!canEdit}
                    />
                  </div>
                </div>
              </div>

              <div className="p-4 border rounded-lg space-y-3">
                <Label className="font-medium">Sábado</Label>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm text-muted-foreground">Abertura</Label>
                    <Input
                      type="time"
                      value={config.horario_funcionamento.sab.inicio}
                      onChange={(e) => setConfig(prev => ({
                        ...prev,
                        horario_funcionamento: {
                          ...prev.horario_funcionamento,
                          sab: { ...prev.horario_funcionamento.sab, inicio: e.target.value }
                        }
                      }))}
                      disabled={!canEdit}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm text-muted-foreground">Fechamento</Label>
                    <Input
                      type="time"
                      value={config.horario_funcionamento.sab.fim}
                      onChange={(e) => setConfig(prev => ({
                        ...prev,
                        horario_funcionamento: {
                          ...prev.horario_funcionamento,
                          sab: { ...prev.horario_funcionamento.sab, fim: e.target.value }
                        }
                      }))}
                      disabled={!canEdit}
                    />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Dias de Trabalho */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Dias de Trabalho
            </CardTitle>
            <CardDescription>
              Configure quais dias da semana a oficina funciona
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {diasSemana.map((dia) => (
                <div key={dia.key} className="flex items-center justify-between p-3 rounded-lg border">
                  <Label htmlFor={dia.key}>{dia.label}</Label>
                  <Switch
                    id={dia.key}
                    checked={config.dias_trabalho[dia.key as keyof typeof config.dias_trabalho] as boolean}
                    onCheckedChange={(checked) => setConfig(prev => ({
                      ...prev,
                      dias_trabalho: { ...prev.dias_trabalho, [dia.key]: checked }
                    }))}
                    disabled={!canEdit}
                  />
                </div>
              ))}
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Dias úteis calculados</p>
                <p className="text-sm text-muted-foreground">
                  Para {meses[config.periodo_vigente.mes - 1]} de {config.periodo_vigente.ano}
                </p>
              </div>
              <Badge variant="outline" className="text-lg px-3 py-1">
                {calcularDiasUteis()} dias
              </Badge>
            </div>

            <div className="space-y-2">
              <Label>Feriados no mês (reduz dias úteis)</Label>
              <Input
                placeholder="Ex: 01, 15, 25 (dias separados por vírgula)"
                value={config.dias_trabalho.feriados.join(', ')}
                onChange={(e) => {
                  const feriados = e.target.value
                    .split(',')
                    .map(d => d.trim())
                    .filter(d => d.length > 0);
                  setConfig(prev => ({
                    ...prev,
                    dias_trabalho: { ...prev.dias_trabalho, feriados }
                  }));
                }}
                disabled={!canEdit}
              />
            </div>
          </CardContent>
        </Card>

        {/* Metas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
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
                    Adiciona um atalho para visualização das metas no sidebar
                  </p>
                </div>
              </div>
              <Switch
                checked={config.exibir_metas_sidebar}
                onCheckedChange={(checked) => setConfig(prev => ({
                  ...prev,
                  exibir_metas_sidebar: checked
                }))}
                disabled={!canEdit}
              />
            </div>

            <Separator />

            {/* Lista de Metas */}
            <div className="space-y-4">
              {config.metas.map((meta, index) => (
                <div
                  key={index}
                  className={`p-4 border rounded-lg space-y-3 transition-opacity ${!meta.ativo ? 'opacity-50' : ''}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{tiposMeta.find(t => t.value === meta.tipo)?.icon}</span>
                      <Label className="font-medium">{meta.nome}</Label>
                    </div>
                    <Switch
                      checked={meta.ativo}
                      onCheckedChange={(checked) => updateMeta(index, 'ativo', checked)}
                      disabled={!canEdit}
                    />
                  </div>
                  
                  {meta.ativo && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-sm text-muted-foreground">Nome da Meta</Label>
                        <Input
                          value={meta.nome}
                          onChange={(e) => updateMeta(index, 'nome', e.target.value)}
                          placeholder="Ex: Faturamento Mensal"
                          disabled={!canEdit}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm text-muted-foreground">Valor/Objetivo</Label>
                        <Input
                          value={meta.valor}
                          onChange={(e) => updateMeta(index, 'valor', e.target.value)}
                          placeholder="Ex: R$ 100.000 ou 50 clientes ou 9.0"
                          disabled={!canEdit}
                        />
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <Label className="text-sm text-muted-foreground">Tipo de Meta</Label>
                        <Select
                          value={meta.tipo}
                          onValueChange={(v) => updateMeta(index, 'tipo', v)}
                          disabled={!canEdit}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {tiposMeta.map((tipo) => (
                              <SelectItem key={tipo.value} value={tipo.value}>
                                <span className="flex items-center gap-2">
                                  <span>{tipo.icon}</span>
                                  {tipo.label}
                                </span>
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

            {/* Resumo de Metas Ativas */}
            <div className="p-4 rounded-lg bg-muted/50">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                <p className="font-medium">Resumo de Metas Ativas</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {config.metas.filter(m => m.ativo).map((meta, idx) => (
                  <Badge key={idx} variant="secondary">
                    {tiposMeta.find(t => t.value === meta.tipo)?.icon} {meta.nome}
                    {meta.valor && `: ${meta.valor}`}
                  </Badge>
                ))}
                {config.metas.filter(m => m.ativo).length === 0 && (
                  <p className="text-sm text-muted-foreground">Nenhuma meta ativa</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Capacidade do Pátio */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Car className="h-5 w-5" />
              Capacidade do Pátio
            </CardTitle>
            <CardDescription>
              Número máximo de veículos que a oficina comporta simultaneamente
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label>Capacidade Máxima</Label>
              <Input
                type="number"
                value={config.patio_capacidade.maxima}
                onChange={(e) => setConfig(prev => ({
                  ...prev,
                  patio_capacidade: { maxima: parseInt(e.target.value) || 0 }
                }))}
                disabled={!canEdit}
              />
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        {canEdit && (
          <div className="flex justify-end">
            <Button onClick={handleSaveAll} disabled={saving} size="lg">
              {saving ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Salvar Configurações
            </Button>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
