import { useState } from "react";
import { useNavigate } from "@/hooks/useNavigate";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { 
  ArrowLeft, 
  ArrowRight, 
  Check, 
  Wrench, 
  Calendar, 
  Clock,
  Car,
  Droplets,
  Settings,
  Zap,
  Plus,
  Stethoscope,
  Gift,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useClientData } from "@/hooks/useClientData";

interface UserVehicle {
  id: string;
  model: string;
  plate: string;
  brand: string | null;
}

// Service types
const serviceTypes = [
  { id: "revisao", name: "Revisão", icon: Settings, description: "Manutenção preventiva completa", fullDay: false },
  { id: "diagnostico", name: "Diagnóstico", icon: Stethoscope, description: "Requer 1 dia com o veículo", fullDay: true },
];

// Services by type
const services = {
  revisao: [
    { id: "troca-oleo", name: "Troca de Óleo", icon: Droplets, duration: 30, price: 150 },
    { id: "filtros", name: "Troca de Filtros", icon: Settings, duration: 20, price: 80 },
    { id: "freios", name: "Revisão de Freios", icon: Car, duration: 60, price: 200 },
    { id: "suspensao", name: "Revisão de Suspensão", icon: Wrench, duration: 90, price: 0 },
    { id: "alinhamento", name: "Alinhamento e Balanceamento", icon: Car, duration: 45, price: 120 },
  ],
  diagnostico: [
    { id: "eletrica", name: "Diagnóstico Elétrico", icon: Zap, duration: 480, price: 150 },
    { id: "motor", name: "Diagnóstico de Motor", icon: Settings, duration: 480, price: 0 },
  ],
};

// Time slots
const timeSlots = [
  "08:00", "08:30", "09:00", "09:30", "10:00", "10:30",
  "11:00", "11:30", "14:00", "14:30", "15:00", "15:30",
  "16:00", "16:30", "17:00", "17:30"
];

const NovoAgendamento = () => {
  const navigate = useNavigate();
  // Note: wouter doesn't support location.state like react-router-dom
  // Promotion state would need to be passed via query params or context
  const promotion = null;
  const { vehicles, loading: vehiclesLoading } = useClientData();

  const [step, setStep] = useState(1);
  const [selectedVehicle, setSelectedVehicle] = useState<UserVehicle | null>(null);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  // Map database vehicles to component format
  const userVehicles: UserVehicle[] = vehicles.map(v => ({
    id: v.id,
    model: v.model,
    plate: v.plate,
    brand: v.brand,
  }));

  const currentServices = selectedType ? services[selectedType as keyof typeof services] : [];
  const isFullDay = serviceTypes.find(t => t.id === selectedType)?.fullDay || false;

  const handleServiceToggle = (serviceId: string) => {
    setSelectedServices(prev => 
      prev.includes(serviceId) 
        ? prev.filter(s => s !== serviceId)
        : [...prev, serviceId]
    );
  };

  const calculateTotal = () => {
    return currentServices
      .filter(s => selectedServices.includes(s.id))
      .reduce((sum, s) => sum + s.price, 0);
  };

  const handleNext = () => {
    if (step === 1 && !selectedVehicle) {
      toast.error("Selecione um veículo");
      return;
    }
    if (step === 2 && !selectedType) {
      toast.error("Selecione o tipo de atendimento");
      return;
    }
    if (step === 3 && selectedServices.length === 0) {
      toast.error("Selecione pelo menos um serviço");
      return;
    }
    if (step === 4 && !selectedDate) {
      toast.error("Selecione uma data");
      return;
    }
    if (step === 5 && !isFullDay && !selectedTime) {
      toast.error("Selecione um horário");
      return;
    }

    if (step === 5 || (step === 4 && isFullDay)) {
      // Submit - store state in sessionStorage since wouter doesn't support state
      sessionStorage.setItem('agendamentoData', JSON.stringify({
        vehicleModel: `${selectedVehicle?.brand} ${selectedVehicle?.model}`,
        date: format(selectedDate!, "dd/MM/yyyy", { locale: ptBR }),
        promoTitle: promotion?.title,
      }));
      toast.success("Agendamento realizado!");
      navigate("/agendamento-sucesso");
      return;
    }

    setStep(prev => prev + 1);
  };

  const handleBack = () => {
    if (step === 1) {
      window.history.back();
    } else {
      setStep(prev => prev - 1);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-bold">Selecione o Veículo</h2>
            {vehiclesLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-red-500" />
              </div>
            ) : (
              <div className="space-y-3">
                {userVehicles.length === 0 ? (
                  <p className="text-gray-400 text-center py-4">
                    Nenhum veículo cadastrado
                  </p>
                ) : (
                  userVehicles.map(vehicle => (
                    <button
                      key={vehicle.id}
                      onClick={() => setSelectedVehicle(vehicle)}
                      className={cn(
                        "w-full p-4 rounded-xl border-2 text-left transition-all",
                        selectedVehicle?.id === vehicle.id
                          ? "border-red-500 bg-red-500/10"
                          : "border-gray-700 hover:border-gray-600"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <Car className="w-8 h-8 text-red-500" />
                        <div>
                          <p className="font-semibold">{vehicle.brand} {vehicle.model}</p>
                          <p className="text-sm text-gray-400">{vehicle.plate}</p>
                        </div>
                        {selectedVehicle?.id === vehicle.id && (
                          <Check className="w-5 h-5 ml-auto text-red-500" />
                        )}
                      </div>
                    </button>
                  ))
                )}
                
                <button
                  onClick={() => navigate("/veiculos")}
                  className="w-full p-4 rounded-xl border-2 border-dashed border-gray-700 hover:border-gray-600 text-left"
                >
                  <div className="flex items-center gap-3 text-gray-400">
                    <Plus className="w-8 h-8" />
                    <span>Adicionar novo veículo</span>
                  </div>
                </button>
              </div>
            )}
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-bold">Tipo de Atendimento</h2>
            <div className="space-y-3">
              {serviceTypes.map(type => {
                const Icon = type.icon;
                return (
                  <button
                    key={type.id}
                    onClick={() => {
                      setSelectedType(type.id);
                      setSelectedServices([]);
                    }}
                    className={cn(
                      "w-full p-4 rounded-xl border-2 text-left transition-all",
                      selectedType === type.id
                        ? "border-red-500 bg-red-500/10"
                        : "border-gray-700 hover:border-gray-600"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-8 h-8 text-red-500" />
                      <div>
                        <p className="font-semibold">{type.name}</p>
                        <p className="text-sm text-gray-400">{type.description}</p>
                      </div>
                      {selectedType === type.id && (
                        <Check className="w-5 h-5 ml-auto text-red-500" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-bold">Selecione os Serviços</h2>
            <div className="space-y-3">
              {currentServices.map(service => {
                const Icon = service.icon;
                const isSelected = selectedServices.includes(service.id);
                return (
                  <button
                    key={service.id}
                    onClick={() => handleServiceToggle(service.id)}
                    className={cn(
                      "w-full p-4 rounded-xl border-2 text-left transition-all",
                      isSelected
                        ? "border-red-500 bg-red-500/10"
                        : "border-gray-700 hover:border-gray-600"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <Checkbox checked={isSelected} />
                      <Icon className="w-6 h-6 text-red-500" />
                      <div className="flex-1">
                        <p className="font-semibold">{service.name}</p>
                        <p className="text-sm text-gray-400">
                          {service.price > 0 ? `R$ ${service.price}` : "Sob consulta"}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
            
            {selectedServices.length > 0 && (
              <div className="bg-gray-800 rounded-xl p-4 mt-6">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Total estimado:</span>
                  <span className="text-xl font-bold text-red-500">
                    {calculateTotal() > 0 ? `R$ ${calculateTotal()}` : "Sob consulta"}
                  </span>
                </div>
              </div>
            )}
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-bold">Escolha a Data</h2>
            <div className="flex justify-center">
              <CalendarComponent
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                locale={ptBR}
                disabled={(date) => date < new Date() || date.getDay() === 0}
                className="rounded-xl border border-gray-700 bg-[#111]"
              />
            </div>
            {selectedDate && (
              <p className="text-center text-gray-400">
                Data selecionada: <span className="text-white font-medium">
                  {format(selectedDate, "dd 'de' MMMM", { locale: ptBR })}
                </span>
              </p>
            )}
          </div>
        );

      case 5:
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-bold">Escolha o Horário</h2>
            <div className="grid grid-cols-4 gap-2">
              {timeSlots.map(time => (
                <button
                  key={time}
                  onClick={() => setSelectedTime(time)}
                  className={cn(
                    "py-3 rounded-lg border-2 text-sm font-medium transition-all",
                    selectedTime === time
                      ? "border-red-500 bg-red-500/10 text-red-500"
                      : "border-gray-700 hover:border-gray-600"
                  )}
                >
                  {time}
                </button>
              ))}
            </div>
          </div>
        );
    }
  };

  const totalSteps = isFullDay ? 4 : 5;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col">
      {/* Header */}
      <header className="bg-[#111] border-b border-gray-800 px-4 py-3 flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={handleBack}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1">
          <h1 className="font-semibold">Novo Agendamento</h1>
          <p className="text-sm text-gray-400">Passo {step} de {totalSteps}</p>
        </div>
      </header>

      {/* Progress */}
      <div className="px-4 py-3 bg-[#111]">
        <div className="flex gap-1">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div
              key={i}
              className={cn(
                "h-1 flex-1 rounded-full transition-colors",
                i < step ? "bg-red-500" : "bg-gray-700"
              )}
            />
          ))}
        </div>
      </div>

      {/* Promotion Banner */}
      {promotion && (
        <div className="mx-4 mt-4 p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-center gap-3">
          <Gift className="w-5 h-5 text-amber-500" />
          <div className="flex-1">
            <p className="text-sm font-medium text-amber-500">{promotion.title}</p>
            <p className="text-xs text-amber-500/70">{promotion.discount}</p>
          </div>
        </div>
      )}

      {/* Content */}
      <main className="flex-1 p-4 overflow-y-auto">
        {renderStep()}
      </main>

      {/* Footer */}
      <div className="p-4 bg-[#111] border-t border-gray-800">
        <Button
          onClick={handleNext}
          className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white py-6 text-lg"
        >
          {step === totalSteps ? "Confirmar Agendamento" : "Continuar"}
          <ArrowRight className="w-5 h-5 ml-2" />
        </Button>
      </div>
    </div>
  );
};

export default NovoAgendamento;
