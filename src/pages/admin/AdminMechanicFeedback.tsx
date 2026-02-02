import { useState, useEffect } from "react";
import { 
  Star, 
  Clock, 
  CheckCircle, 
  Loader2, 
  Save,
  User,
  Calendar
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";

interface Mechanic {
  id: string;
  name: string;
  specialty: string | null;
}

interface FeedbackForm {
  mechanicId: string;
  performanceScore: number;
  punctualityScore: number;
  qualityScore: number;
  notes: string;
}

const ScoreSelector = ({ 
  value, 
  onChange, 
  label, 
  icon: Icon 
}: { 
  value: number; 
  onChange: (v: number) => void; 
  label: string;
  icon: React.ElementType;
}) => {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Icon className="w-4 h-4" />
        <span>{label}</span>
      </div>
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map((score) => (
          <button
            key={score}
            type="button"
            onClick={() => onChange(score)}
            className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${
              score <= value
                ? "bg-primary text-primary-foreground"
                : "bg-muted/50 text-muted-foreground hover:bg-muted"
            }`}
          >
            <Star className={`w-5 h-5 ${score <= value ? "fill-current" : ""}`} />
          </button>
        ))}
      </div>
    </div>
  );
};

const AdminMechanicFeedback = () => {
  const [mechanics, setMechanics] = useState<Mechanic[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedMechanic, setSelectedMechanic] = useState<string | null>(null);
  const [todayFeedbacks, setTodayFeedbacks] = useState<Record<string, boolean>>({});
  const [form, setForm] = useState<FeedbackForm>({
    mechanicId: "",
    performanceScore: 0,
    punctualityScore: 0,
    qualityScore: 0,
    notes: "",
  });

  const today = format(new Date(), "yyyy-MM-dd");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch mechanics
      const { data: mechanicsData, error: mechanicsError } = await supabase
        .from("mecanicos")
        .select("id, name, specialty")
        .eq("is_active", true)
        .order("name");

      if (mechanicsError) throw mechanicsError;

      // Fetch today's feedbacks to know which mechanics already have feedback
      const { data: feedbacksData, error: feedbacksError } = await supabase
        .from("mechanic_daily_feedback")
        .select("mechanic_id")
        .eq("feedback_date", today);

      if (feedbacksError) throw feedbacksError;

      const feedbackMap: Record<string, boolean> = {};
      feedbacksData?.forEach((f) => {
        feedbackMap[f.mechanic_id] = true;
      });

      setMechanics(mechanicsData || []);
      setTodayFeedbacks(feedbackMap);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Erro ao carregar dados");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectMechanic = (mechanicId: string) => {
    setSelectedMechanic(mechanicId);
    setForm({
      mechanicId,
      performanceScore: 0,
      punctualityScore: 0,
      qualityScore: 0,
      notes: "",
    });
  };

  const handleSave = async () => {
    if (!form.mechanicId) {
      toast.error("Selecione um mecânico");
      return;
    }

    if (form.performanceScore === 0 || form.punctualityScore === 0 || form.qualityScore === 0) {
      toast.error("Preencha todos os scores");
      return;
    }

    setSaving(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      const mechanicName = mechanics.find(m => m.id === form.mechanicId)?.name || 'Mecânico';
      
      // Salvar feedback
      const { error } = await supabase
        .from("mechanic_daily_feedback")
        .insert({
          mechanic_id: form.mechanicId,
          feedback_date: today,
          given_by: userData.user?.id,
          performance_score: form.performanceScore,
          punctuality_score: form.punctualityScore,
          quality_score: form.qualityScore,
          notes: form.notes || null,
        });

      if (error) throw error;

      // Calcular média geral
      const mediaGeral = ((form.performanceScore + form.punctualityScore + form.qualityScore) / 3).toFixed(1);
      
      // Criar alerta para gestão RH se score baixo (média < 3)
      const avgScore = (form.performanceScore + form.punctualityScore + form.qualityScore) / 3;
      
      // Sempre criar registro no histórico de alertas para gestão acompanhar
      await supabase
        .from("gestao_alerts")
        .insert({
          tipo: avgScore < 3 ? 'feedback_critico' : 'feedback_mecanico',
          titulo: avgScore < 3 
            ? `⚠️ Feedback crítico: ${mechanicName}` 
            : `Feedback registrado: ${mechanicName}`,
          descricao: `Avaliação de ${format(new Date(), "dd/MM/yyyy", { locale: ptBR })}: Performance ${form.performanceScore}/5, Pontualidade ${form.punctualityScore}/5, Qualidade ${form.qualityScore}/5. Média: ${mediaGeral}`,
          metadata: {
            mechanic_id: form.mechanicId,
            mechanic_name: mechanicName,
            performance_score: form.performanceScore,
            punctuality_score: form.punctualityScore,
            quality_score: form.qualityScore,
            average_score: avgScore,
            notes: form.notes,
            feedback_date: today,
          },
        });

      toast.success("Feedback registrado com sucesso!");
      
      // Update today's feedbacks
      setTodayFeedbacks((prev) => ({
        ...prev,
        [form.mechanicId]: true,
      }));

      // Reset form
      setSelectedMechanic(null);
      setForm({
        mechanicId: "",
        performanceScore: 0,
        punctualityScore: 0,
        qualityScore: 0,
        notes: "",
      });
    } catch (error) {
      console.error("Error saving feedback:", error);
      toast.error("Erro ao salvar feedback");
    } finally {
      setSaving(false);
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
      <div className="p-4 md:p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Feedback Mecânicos</h1>
            <p className="text-muted-foreground flex items-center gap-2 mt-1">
              <Calendar className="w-4 h-4" />
              {format(new Date(), "EEEE, d 'de' MMMM", { locale: ptBR })}
            </p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Mechanics List */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Selecione o Mecânico</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {mechanics.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">
                  Nenhum mecânico cadastrado
                </p>
              ) : (
                mechanics.map((mechanic) => (
                  <button
                    key={mechanic.id}
                    onClick={() => handleSelectMechanic(mechanic.id)}
                    disabled={todayFeedbacks[mechanic.id]}
                    className={`w-full p-4 rounded-xl flex items-center gap-4 transition-all ${
                      selectedMechanic === mechanic.id
                        ? "bg-primary text-primary-foreground"
                        : todayFeedbacks[mechanic.id]
                        ? "bg-muted/30 text-muted-foreground cursor-not-allowed"
                        : "bg-muted/50 hover:bg-muted text-foreground"
                    }`}
                  >
                    <div className="w-10 h-10 rounded-full bg-background/20 flex items-center justify-center">
                      <User className="w-5 h-5" />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-medium">{mechanic.name}</p>
                      {mechanic.specialty && (
                        <p className="text-sm opacity-70">{mechanic.specialty}</p>
                      )}
                    </div>
                    {todayFeedbacks[mechanic.id] && (
                      <CheckCircle className="w-5 h-5 text-emerald-500" />
                    )}
                  </button>
                ))
              )}
            </CardContent>
          </Card>

          {/* Feedback Form */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Avaliação do Dia</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {!selectedMechanic ? (
                <p className="text-muted-foreground text-center py-8">
                  Selecione um mecânico para avaliar
                </p>
              ) : (
                <>
                  <ScoreSelector
                    value={form.performanceScore}
                    onChange={(v) => setForm((prev) => ({ ...prev, performanceScore: v }))}
                    label="Performance"
                    icon={Star}
                  />

                  <ScoreSelector
                    value={form.punctualityScore}
                    onChange={(v) => setForm((prev) => ({ ...prev, punctualityScore: v }))}
                    label="Pontualidade"
                    icon={Clock}
                  />

                  <ScoreSelector
                    value={form.qualityScore}
                    onChange={(v) => setForm((prev) => ({ ...prev, qualityScore: v }))}
                    label="Qualidade"
                    icon={CheckCircle}
                  />

                  <div className="space-y-2">
                    <label className="text-sm text-muted-foreground">
                      Observações (opcional)
                    </label>
                    <Textarea
                      value={form.notes}
                      onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))}
                      placeholder="Observações sobre o dia..."
                      className="min-h-[100px] bg-muted/50 border-none"
                    />
                  </div>

                  <Button
                    onClick={handleSave}
                    disabled={saving}
                    className="w-full"
                    size="lg"
                  >
                    {saving ? (
                      <Loader2 className="w-5 h-5 animate-spin mr-2" />
                    ) : (
                      <Save className="w-5 h-5 mr-2" />
                    )}
                    Salvar Feedback
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Resumo do Dia</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                  <CheckCircle className="w-4 h-4 text-emerald-500" />
                  <span>Feedbacks registrados</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 transition-all"
                    style={{
                      width: `${(Object.keys(todayFeedbacks).length / Math.max(mechanics.length, 1)) * 100}%`,
                    }}
                  />
                </div>
              </div>
              <div className="text-2xl font-bold text-foreground">
                {Object.keys(todayFeedbacks).length}/{mechanics.length}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminMechanicFeedback;
