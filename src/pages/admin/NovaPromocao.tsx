import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  ArrowLeft, 
  Megaphone, 
  Car, 
  User, 
  Send, 
  Bell,
  MessageCircle,
  Instagram,
  Clock,
  CheckCircle,
  Smartphone
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface SelectedVehicle {
  client: {
    id: string;
    name: string;
    phone: string;
    email: string;
  };
  vehicle: {
    id: string;
    brand: string;
    model: string;
    year: number;
    plate: string;
  };
}

type SendChannel = 'app' | 'whatsapp' | 'instagram' | 'reminder';

interface ChannelOption {
  id: SendChannel;
  label: string;
  icon: React.ElementType;
  description: string;
}

const channelOptions: ChannelOption[] = [
  { id: 'app', label: 'App (Avisos)', icon: Smartphone, description: 'Enviar para a aba de Avisos do cliente no app' },
  { id: 'whatsapp', label: 'WhatsApp', icon: MessageCircle, description: 'Enviar mensagem via WhatsApp' },
  { id: 'instagram', label: 'Instagram', icon: Instagram, description: 'Enviar via Direct do Instagram' },
  { id: 'reminder', label: 'Lembrete', icon: Clock, description: 'Salvar como lembrete para contato futuro' },
];

export default function NovaPromocao() {
  const navigate = useNavigate();
  const location = useLocation();
  const selectedVehicles = (location.state?.selectedVehicles || []) as SelectedVehicle[];

  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [discount, setDiscount] = useState("");
  const [validUntil, setValidUntil] = useState("");
  const [selectedChannels, setSelectedChannels] = useState<Set<SendChannel>>(new Set(['app']));
  const [sending, setSending] = useState(false);

  const toggleChannel = (channel: SendChannel) => {
    setSelectedChannels(prev => {
      const newSet = new Set(prev);
      if (newSet.has(channel)) {
        newSet.delete(channel);
      } else {
        newSet.add(channel);
      }
      return newSet;
    });
  };

  const handleSend = async () => {
    if (!title.trim() || !message.trim()) {
      toast.error("Preencha o título e a mensagem");
      return;
    }

    if (selectedChannels.size === 0) {
      toast.error("Selecione pelo menos um canal de envio");
      return;
    }

    setSending(true);

    // Simulate sending
    await new Promise(resolve => setTimeout(resolve, 1500));

    const channelNames = Array.from(selectedChannels).map(c => 
      channelOptions.find(opt => opt.id === c)?.label
    ).join(', ');

    toast.success(`Promoção enviada via: ${channelNames}`);

    // If app channel is selected, this would create alerts in the client's Avisos page
    if (selectedChannels.has('app')) {
      toast.info("Avisos criados para os clientes selecionados");
    }

    setSending(false);
    navigate('/admin/veiculos');
  };

  // Pre-fill message template
  const applyTemplate = (type: 'oil' | 'revision' | 'discount') => {
    const templates = {
      oil: {
        title: "Promoção Troca de Óleo",
        message: "Olá! Identificamos que seu veículo está próximo da troca de óleo. Aproveite nossa promoção especial com desconto exclusivo! Entre em contato para agendar."
      },
      revision: {
        title: "Revisão Completa",
        message: "Seu veículo merece o melhor cuidado! Estamos com condições especiais para revisão completa. Garanta a segurança e o bom funcionamento do seu carro."
      },
      discount: {
        title: "Desconto Especial para Você",
        message: "Preparamos uma oferta exclusiva para você! Válido por tempo limitado. Não perca essa oportunidade de cuidar do seu veículo com o melhor custo-benefício."
      }
    };

    const template = templates[type];
    setTitle(template.title);
    setMessage(template.message);
  };

  return (
    <AdminLayout>
      <div className="p-6 space-y-6 max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Nova Promoção</h1>
            <p className="text-muted-foreground">
              Enviar promoção para {selectedVehicles.length} veículo(s) selecionado(s)
            </p>
          </div>
        </div>

        {/* Selected Vehicles Summary */}
        <Card className="border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Car className="w-4 h-4" />
              Veículos Selecionados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {selectedVehicles.map((item, idx) => (
                <Badge key={idx} variant="secondary" className="gap-1">
                  <User className="w-3 h-3" />
                  {item.client.name} - {item.vehicle.brand} {item.vehicle.model}
                </Badge>
              ))}
              {selectedVehicles.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  Nenhum veículo selecionado. Volte e selecione veículos para promoção.
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quick Templates */}
        <Card className="border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Templates Rápidos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={() => applyTemplate('oil')}>
                🛢️ Troca de Óleo
              </Button>
              <Button variant="outline" size="sm" onClick={() => applyTemplate('revision')}>
                🔧 Revisão
              </Button>
              <Button variant="outline" size="sm" onClick={() => applyTemplate('discount')}>
                💰 Desconto
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Promotion Form */}
        <Card className="border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Megaphone className="w-5 h-5" />
              Conteúdo da Promoção
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Título</Label>
              <Input
                id="title"
                placeholder="Ex: Promoção Especial de Verão"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">Mensagem</Label>
              <Textarea
                id="message"
                placeholder="Escreva a mensagem da promoção..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="discount">Desconto (%)</Label>
                <Input
                  id="discount"
                  type="number"
                  placeholder="Ex: 15"
                  value={discount}
                  onChange={(e) => setDiscount(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="validUntil">Válido até</Label>
                <Input
                  id="validUntil"
                  type="date"
                  value={validUntil}
                  onChange={(e) => setValidUntil(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Send Channels */}
        <Card className="border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Send className="w-5 h-5" />
              Canais de Envio
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {channelOptions.map(channel => {
                const Icon = channel.icon;
                const isSelected = selectedChannels.has(channel.id);
                
                return (
                  <div
                    key={channel.id}
                    className={cn(
                      "p-4 rounded-lg border cursor-pointer transition-all",
                      isSelected 
                        ? "border-primary bg-primary/5" 
                        : "border-border hover:border-muted-foreground"
                    )}
                    onClick={() => toggleChannel(channel.id)}
                  >
                    <div className="flex items-start gap-3">
                      <Checkbox checked={isSelected} />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Icon className={cn(
                            "w-4 h-4",
                            isSelected ? "text-primary" : "text-muted-foreground"
                          )} />
                          <span className="font-medium text-foreground">{channel.label}</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {channel.description}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {selectedChannels.has('app') && (
              <div className="mt-4 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                  <Bell className="w-4 h-4" />
                  <span className="text-sm font-medium">
                    A promoção aparecerá na aba "Avisos" do app do cliente
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex gap-3 justify-end">
          <Button variant="outline" onClick={() => navigate(-1)}>
            Cancelar
          </Button>
          <Button 
            onClick={handleSend} 
            disabled={sending || selectedVehicles.length === 0}
            className="gap-2"
          >
            {sending ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Enviar Promoção
              </>
            )}
          </Button>
        </div>
      </div>
    </AdminLayout>
  );
}
