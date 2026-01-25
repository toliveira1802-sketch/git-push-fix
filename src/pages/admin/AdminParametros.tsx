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
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useUserRole } from '@/hooks/useUserRole';
import { Settings, Calendar, Target, Car, Save, Loader2, Lock } from 'lucide-react';

interface SystemConfig {
  periodo_vigente: { mes: number; ano: number };
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
  meta_mensal: { valor: number; dias_uteis: number };
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

export default function AdminParametros() {
  const { role, isLoading: roleLoading } = useUserRole();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [config, setConfig] = useState<SystemConfig>({
    periodo_vigente: { mes: new Date().getMonth() + 1, ano: new Date().getFullYear() },
    dias_trabalho: { seg: true, ter: true, qua: true, qui: true, sex: true, sab: true, dom: false, feriados: [] },
    meta_mensal: { valor: 100000, dias_uteis: 22 },
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
          dias_trabalho: (configMap.dias_trabalho as SystemConfig['dias_trabalho']) || prev.dias_trabalho,
          meta_mensal: (configMap.meta_mensal as SystemConfig['meta_mensal']) || prev.meta_mensal,
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
      // First check if it exists
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
        saveConfig('dias_trabalho', config.dias_trabalho),
        saveConfig('meta_mensal', config.meta_mensal),
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

  const handleUpdateDiasUteis = () => {
    const diasUteis = calcularDiasUteis();
    setConfig(prev => ({
      ...prev,
      meta_mensal: { ...prev.meta_mensal, dias_uteis: diasUteis }
    }));
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
              <div className="flex items-center gap-3">
                <Badge variant="outline" className="text-lg px-3 py-1">
                  {calcularDiasUteis()} dias
                </Badge>
                {canEdit && (
                  <Button variant="outline" size="sm" onClick={handleUpdateDiasUteis}>
                    Aplicar
                  </Button>
                )}
              </div>
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

        {/* Meta Mensal */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Meta Mensal
            </CardTitle>
            <CardDescription>
              Configure a meta de faturamento e dias úteis do mês
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Meta de Faturamento (R$)</Label>
                <Input
                  type="number"
                  value={config.meta_mensal.valor}
                  onChange={(e) => setConfig(prev => ({
                    ...prev,
                    meta_mensal: { ...prev.meta_mensal, valor: parseFloat(e.target.value) || 0 }
                  }))}
                  disabled={!canEdit}
                />
              </div>
              <div className="space-y-2">
                <Label>Dias Úteis</Label>
                <Input
                  type="number"
                  value={config.meta_mensal.dias_uteis}
                  onChange={(e) => setConfig(prev => ({
                    ...prev,
                    meta_mensal: { ...prev.meta_mensal, dias_uteis: parseInt(e.target.value) || 0 }
                  }))}
                  disabled={!canEdit}
                />
              </div>
            </div>

            <div className="p-4 rounded-lg bg-muted/50">
              <p className="text-sm text-muted-foreground">Meta diária calculada:</p>
              <p className="text-2xl font-bold text-primary">
                R$ {config.meta_mensal.dias_uteis > 0 
                  ? (config.meta_mensal.valor / config.meta_mensal.dias_uteis).toLocaleString('pt-BR', { minimumFractionDigits: 2 })
                  : '0,00'
                }
              </p>
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