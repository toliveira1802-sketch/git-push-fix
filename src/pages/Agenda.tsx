import { useState, useEffect } from "react";
import { useNavigate } from "@/hooks/useNavigate";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar, Plus, Clock, Gift, ChevronRight, CalendarClock, XCircle, PartyPopper, MapPin, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/layout/Header";
import { BottomNavigation } from "@/components/layout/BottomNavigation";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface Appointment {
  id: string;
  date: Date;
  time: string | null;
  service: string;
  status: "confirmado" | "pendente" | "concluido";
  vehicleModel?: string;
  vehiclePlate?: string;
  isFullDay?: boolean;
}

const statusColors = {
  confirmado: "bg-emerald-500/20 text-emerald-500",
  pendente: "bg-amber-500/20 text-amber-500",
  concluido: "bg-muted text-muted-foreground",
};

const statusLabels = {
  confirmado: "Confirmado",
  pendente: "Pendente",
  concluido: "Concluído",
};

const Agenda = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [cancelReason, setCancelReason] = useState("");
  const [isCancelling, setIsCancelling] = useState(false);

  useEffect(() => {
    const fetchAppointments = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      // Get client by user_id
      const { data: client } = await supabase
        .from('clientes')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (!client) {
        setLoading(false);
        return;
      }

      // Get appointments for this client
      const { data: appointmentsData } = await supabase
        .from('agendamentos')
        .select(`
          id,
          scheduled_date,
          scheduled_time,
          service_type,
          status,
          vehicle_id,
          veiculos (brand, model, plate)
        `)
        .eq('client_id', client.id)
        .gte('scheduled_date', new Date().toISOString().split('T')[0])
        .order('scheduled_date', { ascending: true });

      if (appointmentsData) {
        const mapped: Appointment[] = appointmentsData.map((apt: any) => ({
          id: apt.id,
          date: new Date(apt.scheduled_date),
          time: apt.scheduled_time,
          service: apt.service_type,
          status: apt.status === 'confirmado' ? 'confirmado' : apt.status === 'concluido' ? 'concluido' : 'pendente',
          vehicleModel: apt.veiculos ? `${apt.veiculos.brand} ${apt.veiculos.model}` : undefined,
          vehiclePlate: apt.veiculos?.plate,
        }));
        setAppointments(mapped);
      }
      setLoading(false);
    };

    fetchAppointments();
  }, [user]);

  const handleCancelAppointment = async () => {
    if (!selectedAppointment) return;
    
    setIsCancelling(true);
    
    const { error } = await supabase
      .from('agendamentos')
      .update({ 
        status: 'cancelado',
        cancel_reason: cancelReason || null,
        cancelled_at: new Date().toISOString()
      })
      .eq('id', selectedAppointment.id);

    if (error) {
      toast.error("Erro ao cancelar agendamento");
    } else {
      setAppointments(prev => prev.filter(apt => apt.id !== selectedAppointment.id));
      toast.success("Agendamento cancelado");
    }
    
    setIsCancelling(false);
    setCancelDialogOpen(false);
    setSelectedAppointment(null);
    setCancelReason("");
  };

  const openCancelDialog = (apt: Appointment, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedAppointment(apt);
    setCancelDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground pb-24">
        <Header title="Agenda" showHomeButton={true} />
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
        <BottomNavigation />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground pb-24">
      <Header title="Agenda" showHomeButton={true} />

      <main className="p-4 space-y-6">
        {/* New Appointment Button */}
        <Button
          onClick={() => navigate("/novo-agendamento")}
          className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 py-6 text-lg"
        >
          <Plus className="w-5 h-5 mr-2" />
          Novo Agendamento
        </Button>

        {/* Appointments Section */}
        <Accordion type="single" collapsible defaultValue="appointments" className="space-y-4">
          <AccordionItem value="appointments" className="border-0">
            <AccordionTrigger className="bg-card rounded-xl px-4 py-3 hover:no-underline border">
              <div className="flex items-center gap-3">
                <CalendarClock className="w-5 h-5 text-primary" />
                <span className="font-semibold">Meus Agendamentos</span>
                <span className="text-sm text-muted-foreground">({appointments.length})</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-2 space-y-3">
              {appointments.map((apt) => (
                <div
                  key={apt.id}
                  className="bg-card rounded-xl p-4 border"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold">{apt.service}</h3>
                      <p className="text-sm text-muted-foreground">{apt.vehicleModel} • {apt.vehiclePlate}</p>
                    </div>
                    <span className={cn("text-xs px-2 py-1 rounded-full", statusColors[apt.status])}>
                      {statusLabels[apt.status]}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>{format(apt.date, "dd/MM/yyyy", { locale: ptBR })}</span>
                    </div>
                    {apt.time && (
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{apt.time}</span>
                      </div>
                    )}
                    {apt.isFullDay && (
                      <span className="text-amber-500">Dia todo</span>
                    )}
                  </div>

                  {apt.status !== 'concluido' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={(e) => openCancelDialog(apt, e)}
                    >
                      <XCircle className="w-4 h-4 mr-1" />
                      Cancelar
                    </Button>
                  )}
                </div>
              ))}

              {appointments.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Calendar className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>Nenhum agendamento</p>
                </div>
              )}
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </main>

      {/* Cancel Dialog */}
      <AlertDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancelar Agendamento?</AlertDialogTitle>
            <AlertDialogDescription>
              Você pode informar o motivo do cancelamento (opcional).
            </AlertDialogDescription>
          </AlertDialogHeader>
          <Textarea
            placeholder="Motivo do cancelamento..."
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
          />
          <AlertDialogFooter>
            <AlertDialogCancel>
              Voltar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancelAppointment}
              disabled={isCancelling}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isCancelling ? "Cancelando..." : "Confirmar Cancelamento"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <BottomNavigation />
    </div>
  );
};

export default Agenda;
