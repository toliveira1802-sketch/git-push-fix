import { useState, useEffect } from "react";
import { 
  Star, 
  Clock, 
  CheckCircle, 
  Loader2, 
  Save,
  User,
  Calendar,
  ChevronUp,
  ChevronDown,
  ArrowLeft,
  RefreshCw,
  MessageSquare,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "@/hooks/useNavigate";

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
                : "bg-secondary text-muted-foreground hover:bg-muted"
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
  const navigate = useNavigate();
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
  const [expandedSections, setExpandedSections] = useState({
    mecanicos: true,
    avaliacao: true,
    resumo: true,
  });

  const today = format(new Date(), "yyyy-MM-dd");

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: mechanicsData, error: mechanicsError } = await supabase
        .from("mecanicos")
        .select("id, name, specialty")
        .eq("is_active", true)
        .order("name");

      if (mechanicsError) throw mechanicsError;

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

      const mediaGeral = ((form.performanceScore + form.punctualityScore + form.qualityScore) / 3).toFixed(1);
      const avgScore = (form.performanceScore + form.punctualityScore + form.qualityScore) / 3;
      
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
      
      setTodayFeedbacks((prev) => ({
        ...prev,
        [form.mechanicId]: true,
      }));

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

  const feedbackCount = Object.keys(todayFeedbacks).length;
  const totalMechanics = mechanics.length;
  const progressPercent = totalMechanics > 0 ? (feedbackCount / totalMechanics) * 100 : 0;

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="sticky top-0 z-50 bg-card border-b border-border">
          <div className="container py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button onClick={() => navigate('/admin')} className="p-2 hover:bg-secondary rounded-lg transition-colors">
                  <ArrowLeft className="w-5 h-5 text-muted-foreground" />
                </button>
                <div>
                  <h1 className="text-lg font-semibold text-foreground flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-primary" />
                    Feedback Mecânicos
                  </h1>
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {format(new Date(), "EEEE, d 'de' MMMM", { locale: ptBR })}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="gap-1">
                  <CheckCircle className="h-3 w-3 text-emerald-500" />
                  {feedbackCount}/{totalMechanics}
                </Badge>
                <Button variant="outline" size="sm" onClick={fetchData}>
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </header>

        <div className="container py-4 space-y-4">
          {/* Resumo do Dia */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="card-lovable"
          >
            <div
              className="flex items-center justify-between cursor-pointer"
              onClick={() => toggleSection('resumo')}
            >
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-muted-foreground" />
                <h2 className="font-semibold">Resumo do Dia</h2>
              </div>
              {expandedSections.resumo ? (
                <ChevronUp className="w-5 h-5 text-muted-foreground" />
              ) : (
                <ChevronDown className="w-5 h-5 text-muted-foreground" />
              )}
            </div>

            <AnimatePresence>
              {expandedSections.resumo && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="mt-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground">Progresso</span>
                      <span className="text-lg font-bold">{feedbackCount}/{totalMechanics}</span>
                    </div>
                    <div className="h-3 bg-secondary rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progressPercent}%` }}
                        transition={{ duration: 0.5 }}
                        className="h-full bg-emerald-500"
                      />
                    </div>
                    {feedbackCount === totalMechanics && totalMechanics > 0 && (
                      <p className="text-sm text-emerald-500 mt-2 flex items-center gap-1">
                        <CheckCircle className="w-4 h-4" />
                        Todos os feedbacks do dia foram registrados!
                      </p>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          <div className="grid gap-4 lg:grid-cols-2">
            {/* Lista de Mecânicos */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="card-lovable"
            >
              <div
                className="flex items-center justify-between cursor-pointer"
                onClick={() => toggleSection('mecanicos')}
              >
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-muted-foreground" />
                  <h2 className="font-semibold">Selecione o Mecânico</h2>
                  <Badge variant="outline">{mechanics.length}</Badge>
                </div>
                {expandedSections.mecanicos ? (
                  <ChevronUp className="w-5 h-5 text-muted-foreground" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-muted-foreground" />
                )}
              </div>

              <AnimatePresence>
                {expandedSections.mecanicos && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-4 space-y-2 max-h-[400px] overflow-y-auto">
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
                                ? "bg-secondary/30 text-muted-foreground cursor-not-allowed"
                                : "bg-secondary/50 hover:bg-secondary text-foreground"
                            }`}
                          >
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                              selectedMechanic === mechanic.id ? "bg-background/20" : "bg-background/50"
                            }`}>
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
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Formulário de Avaliação */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="card-lovable"
            >
              <div
                className="flex items-center justify-between cursor-pointer"
                onClick={() => toggleSection('avaliacao')}
              >
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-muted-foreground" />
                  <h2 className="font-semibold">Avaliação do Dia</h2>
                </div>
                {expandedSections.avaliacao ? (
                  <ChevronUp className="w-5 h-5 text-muted-foreground" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-muted-foreground" />
                )}
              </div>

              <AnimatePresence>
                {expandedSections.avaliacao && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-4 space-y-6">
                      {!selectedMechanic ? (
                        <div className="text-center py-12">
                          <User className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                          <p className="text-muted-foreground">
                            Selecione um mecânico para avaliar
                          </p>
                        </div>
                      ) : (
                        <>
                          <div className="bg-secondary/50 rounded-xl p-4 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                              <User className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                              <p className="font-medium">
                                {mechanics.find(m => m.id === selectedMechanic)?.name}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {mechanics.find(m => m.id === selectedMechanic)?.specialty || "Mecânico"}
                              </p>
                            </div>
                          </div>

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
                              className="min-h-[80px] bg-secondary/50 border-none"
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
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminMechanicFeedback;