import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar, Plus, Clock, Wrench, Gift, ChevronRight, CalendarClock, XCircle, PartyPopper, MapPin } from "lucide-react";
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

interface Promotion {
  id: string;
  title: string;
  description: string | null;
  discount_label: string;
  discount_percent: number;
  valid_to: string;
}

interface PrimeEvent {
  id: string;
  title: string;
  description: string | null;
  event_type: "workshop" | "meetup" | "carwash" | "training" | "other";
  event_date: string;
  event_time: string | null;
  location: string | null;
}

const eventTypeConfig: Record<string, { label: string; color: string; icon: string }> = {
  workshop: { label: "Workshop", color: "bg-blue-500/20 text-blue-500", icon: "🔧" },
  meetup: { label: "Encontro", color: "bg-purple-500/20 text-purple-500", icon: "🤝" },
  carwash: { label: "Car Wash", color: "bg-cyan-500/20 text-cyan-500", icon: "🚿" },
  training: { label: "Treinamento", color: "bg-amber-500/20 text-amber-500", icon: "📚" },
  other: { label: "Evento", color: "bg-muted text-muted-foreground", icon: "🎉" },
};

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

// Mock data
const mockAppointments: Appointment[] = [
  {
    id: "1",
    date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    time: "14:00",
    service: "Troca de Óleo",
    status: "confirmado",
    vehicleModel: "Honda Civic",
    vehiclePlate: "ABC-1234",
  },
  {
    id: "2",
    date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    time: null,
    service: "Revisão Completa",
    status: "pendente",
    vehicleModel: "Toyota Corolla",
    vehiclePlate: "XYZ-5678",
    isFullDay: true,
  },
];

const mockPromotions: Promotion[] = [
  {
    id: "1",
    title: "Troca de Óleo com 20% OFF",
    description: "Válido para todos os veículos",
    discount_label: "20% OFF",
    discount_percent: 20,
    valid_to: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

const mockEvents: PrimeEvent[] = [
  {
    id: "1",
    title: "Workshop de Manutenção Preventiva",
    description: "Aprenda a cuidar do seu veículo",
    event_type: "workshop",
    event_date: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString(),
    event_time: "10:00",
    location: "Doctor Auto Prime - Sede",
  },
];

const Agenda = () => {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState<Appointment[]>(mockAppointments);
  const [promotions] = useState<Promotion[]>(mockPromotions);
  const [events] = useState<PrimeEvent[]>(mockEvents);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [cancelReason, setCancelReason] = useState("");
  const [isCancelling, setIsCancelling] = useState(false);

  const handlePromoClick = (promo: Promotion) => {
    toast.success("Oferta selecionada!", {
      description: "Redirecionando para agendamento...",
    });
    navigate("/novo-agendamento", { 
      state: { 
        promotion: {
          id: promo.id,
          title: promo.title,
          description: promo.description,
          discount: promo.discount_label,
        } 
      } 
    });
  };

  const handleEventClick = (event: PrimeEvent) => {
    toast.success("Interesse registrado!", {
      description: `Você será avisado sobre "${event.title}"`,
    });
  };

  const handleCancelAppointment = async () => {
    if (!selectedAppointment) return;
    
    setIsCancelling(true);
    
    // Mock cancel
    setTimeout(() => {
      setAppointments(prev => prev.filter(apt => apt.id !== selectedAppointment.id));
      toast.success("Agendamento cancelado");
      setIsCancelling(false);
      setCancelDialogOpen(false);
      setSelectedAppointment(null);
      setCancelReason("");
    }, 500);
  };

  const openCancelDialog = (apt: Appointment, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedAppointment(apt);
    setCancelDialogOpen(true);
  };

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
            <AccordionTrigger className="bg-[#111] rounded-xl px-4 py-3 hover:no-underline">
              <div className="flex items-center gap-3">
                <CalendarClock className="w-5 h-5 text-red-500" />
                <span className="font-semibold">Meus Agendamentos</span>
                <span className="text-sm text-gray-400">({appointments.length})</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-2 space-y-3">
              {appointments.map((apt) => (
                <div
                  key={apt.id}
                  className="bg-[#111] rounded-xl p-4 border border-gray-800"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold">{apt.service}</h3>
                      <p className="text-sm text-gray-400">{apt.vehicleModel} • {apt.vehiclePlate}</p>
                    </div>
                    <span className={cn("text-xs px-2 py-1 rounded-full", statusColors[apt.status])}>
                      {statusLabels[apt.status]}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-400 mb-3">
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

                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-500 hover:text-red-400 hover:bg-red-500/10"
                    onClick={(e) => openCancelDialog(apt, e)}
                  >
                    <XCircle className="w-4 h-4 mr-1" />
                    Cancelar
                  </Button>
                </div>
              ))}

              {appointments.length === 0 && (
                <div className="text-center py-8 text-gray-400">
                  <Calendar className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>Nenhum agendamento</p>
                </div>
              )}
            </AccordionContent>
          </AccordionItem>

          {/* Promotions Section */}
          <AccordionItem value="promotions" className="border-0">
            <AccordionTrigger className="bg-[#111] rounded-xl px-4 py-3 hover:no-underline">
              <div className="flex items-center gap-3">
                <Gift className="w-5 h-5 text-amber-500" />
                <span className="font-semibold">Promoções para Você</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-2 space-y-3">
              {promotions.map((promo) => (
                <button
                  key={promo.id}
                  onClick={() => handlePromoClick(promo)}
                  className="w-full bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/30 rounded-xl p-4 text-left hover:border-amber-500/50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-amber-500">{promo.title}</h3>
                      <p className="text-sm text-gray-400 mt-1">{promo.description}</p>
                    </div>
                    <span className="bg-amber-500 text-black text-xs font-bold px-2 py-1 rounded">
                      {promo.discount_label}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 mt-3 text-sm text-amber-500">
                    <span>Agendar agora</span>
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </button>
              ))}
            </AccordionContent>
          </AccordionItem>

          {/* Events Section */}
          <AccordionItem value="events" className="border-0">
            <AccordionTrigger className="bg-[#111] rounded-xl px-4 py-3 hover:no-underline">
              <div className="flex items-center gap-3">
                <PartyPopper className="w-5 h-5 text-purple-500" />
                <span className="font-semibold">Eventos Prime</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-2 space-y-3">
              {events.map((event) => {
                const config = eventTypeConfig[event.event_type];
                return (
                  <button
                    key={event.id}
                    onClick={() => handleEventClick(event)}
                    className="w-full bg-[#111] border border-gray-800 rounded-xl p-4 text-left hover:border-purple-500/30 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">{config.icon}</span>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold">{event.title}</h3>
                          <span className={cn("text-xs px-2 py-0.5 rounded-full", config.color)}>
                            {config.label}
                          </span>
                        </div>
                        <p className="text-sm text-gray-400">{event.description}</p>
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-400">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            <span>{format(new Date(event.event_date), "dd/MM", { locale: ptBR })}</span>
                          </div>
                          {event.location && (
                            <div className="flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              <span className="truncate">{event.location}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </main>

      {/* Cancel Dialog */}
      <AlertDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <AlertDialogContent className="bg-[#111] border-gray-800">
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
            className="bg-[#0a0a0a] border-gray-700"
          />
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-transparent border-gray-700">
              Voltar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancelAppointment}
              disabled={isCancelling}
              className="bg-red-600 hover:bg-red-700"
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
