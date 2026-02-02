import { useNavigate } from "@/hooks/useNavigate";
import { Check, Plus, Home, Gift, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";

interface LocationState {
  promoTitle?: string;
  vehicleModel?: string;
  date?: string;
}

const AgendamentoSucesso = () => {
  const navigate = useNavigate();
  // Note: wouter doesn't support location.state - state would need to be passed via query params
  const state: LocationState | null = null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex flex-col items-center justify-center p-6">
      {/* Success Icon */}
      <div className="relative mb-8">
        <div className="w-24 h-24 rounded-full bg-emerald-500/20 flex items-center justify-center animate-in zoom-in duration-300">
          <div className="w-16 h-16 rounded-full bg-emerald-500 flex items-center justify-center">
            <Check className="w-10 h-10 text-white" strokeWidth={3} />
          </div>
        </div>
        <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full bg-red-600 flex items-center justify-center animate-bounce">
          <Gift className="w-5 h-5 text-white" />
        </div>
      </div>

      {/* Message */}
      <h1 className="text-2xl font-bold text-foreground text-center mb-2">
        Agendamento Confirmado!
      </h1>
      <p className="text-muted-foreground text-center mb-2">
        Sua solicitação foi enviada com sucesso.
      </p>
      
      {state?.promoTitle && (
        <div className="flex items-center gap-2 bg-amber-500/10 text-amber-500 px-4 py-2 rounded-full text-sm font-medium mb-6">
          <Gift className="w-4 h-4" />
          <span>Promoção: {state.promoTitle}</span>
        </div>
      )}

      {state?.vehicleModel && state?.date && (
        <div className="bg-card/50 backdrop-blur-sm border border-border rounded-xl p-4 mb-8 w-full max-w-sm">
          <div className="flex items-center gap-3 text-sm">
            <Calendar className="w-5 h-5 text-red-500" />
            <div>
              <p className="text-muted-foreground">Veículo</p>
              <p className="text-foreground font-medium">{state.vehicleModel}</p>
            </div>
          </div>
          <div className="h-px bg-border my-3" />
          <div className="flex items-center gap-3 text-sm">
            <Calendar className="w-5 h-5 text-emerald-500" />
            <div>
              <p className="text-muted-foreground">Data</p>
              <p className="text-foreground font-medium">{state.date}</p>
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="w-full max-w-sm space-y-3">
        <Button 
          onClick={() => navigate("/novo-agendamento")}
          className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold py-6 text-lg rounded-xl"
        >
          <Plus className="w-5 h-5 mr-2" />
          Agendar Outros Serviços
        </Button>
        
        <Button 
          onClick={() => navigate("/")}
          variant="outline"
          className="w-full py-6 text-lg rounded-xl border-muted-foreground/30"
        >
          <Home className="w-5 h-5 mr-2" />
          Voltar ao Início
        </Button>
      </div>

      {/* Hint */}
      <p className="text-xs text-muted-foreground text-center mt-8 max-w-xs">
        A oficina receberá sua solicitação e entrará em contato para confirmar.
      </p>
    </div>
  );
};

export default AgendamentoSucesso;
