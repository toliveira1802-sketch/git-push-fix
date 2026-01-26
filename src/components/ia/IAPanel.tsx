import { useState } from "react";
import { 
  Bot, Play, Settings, TrendingUp, Zap, 
  Wrench, MessageSquare, Calculator, Send, Loader2,
  ExternalLink
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface IA {
  id: string;
  nome: string;
  emoji: string;
  funcao: string;
  tipo: 'diagnostico' | 'atendimento' | 'orcamento';
  ativa: boolean;
  status: 'online' | 'offline' | 'standby';
  performance: number;
  usos: number;
}

const IAS_OFICINA: IA[] = [
  {
    id: 'diagnostico',
    nome: 'Dr. Auto',
    emoji: '🔧',
    funcao: 'Especialista em diagnóstico automotivo',
    tipo: 'diagnostico',
    ativa: true,
    status: 'online',
    performance: 94,
    usos: 156,
  },
  {
    id: 'atendimento',
    nome: 'Anna Laura',
    emoji: '💬',
    funcao: 'Assistente de atendimento ao cliente',
    tipo: 'atendimento',
    ativa: true,
    status: 'online',
    performance: 92,
    usos: 234,
  },
  {
    id: 'orcamento',
    nome: 'Orça Pro',
    emoji: '💰',
    funcao: 'Assistente de orçamentos e upsell',
    tipo: 'orcamento',
    ativa: true,
    status: 'online',
    performance: 88,
    usos: 89,
  },
];

const statusConfig: Record<string, { label: string; color: string }> = {
  online: { label: 'Online', color: 'bg-emerald-500' },
  offline: { label: 'Offline', color: 'bg-destructive' },
  standby: { label: 'Standby', color: 'bg-amber-500' },
};

interface IAPanelProps {
  onNavigateKommo?: () => void;
}

export function IAPanel({ onNavigateKommo }: IAPanelProps) {
  const [ias, setIas] = useState<IA[]>(IAS_OFICINA);
  const [activeTab, setActiveTab] = useState("painel");
  const [selectedIA, setSelectedIA] = useState<IA | null>(null);
  const [chatMessages, setChatMessages] = useState<{ role: string; content: string }[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const toggleIA = (iaId: string) => {
    setIas(ias.map(ia => 
      ia.id === iaId 
        ? { ...ia, ativa: !ia.ativa, status: ia.ativa ? 'offline' : 'online' } 
        : ia
    ));
    const ia = ias.find(i => i.id === iaId);
    toast.success(`${ia?.nome} ${ia?.ativa ? 'desativada' : 'ativada'}!`);
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !selectedIA || isLoading) return;

    const userMessage = { role: "user", content: inputMessage };
    setChatMessages(prev => [...prev, userMessage]);
    setInputMessage("");
    setIsLoading(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-oficina`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            type: selectedIA.tipo,
            messages: [...chatMessages, userMessage],
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Erro ao processar");
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let assistantContent = "";

      if (reader) {
        let done = false;
        while (!done) {
          const { value, done: readerDone } = await reader.read();
          done = readerDone;
          
          if (value) {
            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split("\n");
            
            for (const line of lines) {
              if (line.startsWith("data: ") && !line.includes("[DONE]")) {
                try {
                  const json = JSON.parse(line.slice(6));
                  const content = json.choices?.[0]?.delta?.content;
                  if (content) {
                    assistantContent += content;
                    setChatMessages(prev => {
                      const last = prev[prev.length - 1];
                      if (last?.role === "assistant") {
                        return [...prev.slice(0, -1), { role: "assistant", content: assistantContent }];
                      }
                      return [...prev, { role: "assistant", content: assistantContent }];
                    });
                  }
                } catch {}
              }
            }
          }
        }
      }

      setIas(ias.map(ia => 
        ia.id === selectedIA.id ? { ...ia, usos: ia.usos + 1 } : ia
      ));

    } catch (error) {
      console.error("AI error:", error);
      toast.error(error instanceof Error ? error.message : "Erro ao processar IA");
    } finally {
      setIsLoading(false);
    }
  };

  const startChat = (ia: IA) => {
    setSelectedIA(ia);
    setChatMessages([]);
    setActiveTab("chat");
  };

  const totalUsos = ias.reduce((acc, ia) => acc + ia.usos, 0);
  const iasAtivas = ias.filter(ia => ia.ativa).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Bot className="w-6 h-6" />
            Assistentes IA
          </h2>
          <p className="text-muted-foreground text-sm">Gerencie os assistentes inteligentes da oficina</p>
        </div>
        {onNavigateKommo && (
          <Button 
            variant="outline" 
            onClick={onNavigateKommo}
            className="gap-2"
          >
            <ExternalLink className="w-4 h-4" />
            Monitoramento Kommo
          </Button>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Bot className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{ias.length}</p>
                <p className="text-xs text-muted-foreground">Total IAs</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-500/10">
                <Zap className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{iasAtivas}</p>
                <p className="text-xs text-muted-foreground">Ativas</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <TrendingUp className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalUsos}</p>
                <p className="text-xs text-muted-foreground">Usos Totais</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500/10">
                <TrendingUp className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {Math.round(ias.reduce((acc, ia) => acc + ia.performance, 0) / ias.length)}%
                </p>
                <p className="text-xs text-muted-foreground">Performance</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="painel">Painel de Controle</TabsTrigger>
          <TabsTrigger value="chat" disabled={!selectedIA}>
            {selectedIA ? `Chat: ${selectedIA.nome}` : "Chat"}
          </TabsTrigger>
        </TabsList>

        {/* Tab: Painel */}
        <TabsContent value="painel" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {ias.map((ia) => {
              const status = statusConfig[ia.status];
              return (
                <Card key={ia.id} className={cn(
                  "transition-all",
                  !ia.ativa && "opacity-60"
                )}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">{ia.emoji}</span>
                        <div>
                          <CardTitle className="text-lg flex items-center gap-2">
                            {ia.nome}
                            <span className={cn("w-2 h-2 rounded-full", status.color)} />
                          </CardTitle>
                          <p className="text-sm text-muted-foreground">{ia.funcao}</p>
                        </div>
                      </div>
                      <Switch 
                        checked={ia.ativa} 
                        onCheckedChange={() => toggleIA(ia.id)}
                      />
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="p-2 bg-muted rounded">
                        <p className="text-muted-foreground text-xs">Performance</p>
                        <p className="font-semibold">{ia.performance}%</p>
                      </div>
                      <div className="p-2 bg-muted rounded">
                        <p className="text-muted-foreground text-xs">Usos</p>
                        <p className="font-semibold">{ia.usos}</p>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        className="flex-1"
                        onClick={() => startChat(ia)}
                        disabled={!ia.ativa}
                      >
                        <Play className="w-4 h-4 mr-1" />
                        Testar
                      </Button>
                      <Button size="sm" variant="outline">
                        <Settings className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* IA Descriptions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Como Usar os Assistentes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Wrench className="w-5 h-5 text-primary" />
                    <span className="font-semibold">🔧 Dr. Auto</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Use para diagnósticos técnicos. Descreva os sintomas do veículo 
                    e receba sugestões de causas e testes.
                  </p>
                </div>
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <MessageSquare className="w-5 h-5 text-primary" />
                    <span className="font-semibold">💬 Anna Laura</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Assistente de atendimento. Gera respostas para WhatsApp, 
                    captura informações e sugere agendamentos.
                  </p>
                </div>
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Calculator className="w-5 h-5 text-primary" />
                    <span className="font-semibold">💰 Orça Pro</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Ajuda a montar orçamentos. Sugere itens adicionais, 
                    prioridades e alternativas de preço.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Chat */}
        <TabsContent value="chat" className="space-y-4">
          {selectedIA && (
            <Card className="h-[600px] flex flex-col">
              <CardHeader className="border-b">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{selectedIA.emoji}</span>
                  <div>
                    <CardTitle>{selectedIA.nome}</CardTitle>
                    <p className="text-sm text-muted-foreground">{selectedIA.funcao}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
                {chatMessages.length === 0 && (
                  <div className="text-center text-muted-foreground py-8">
                    <Bot className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Inicie uma conversa com {selectedIA.nome}</p>
                    <p className="text-sm">Exemplo: "Cliente reclamando de barulho ao frear"</p>
                  </div>
                )}
                {chatMessages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={cn(
                      "p-3 rounded-lg max-w-[80%]",
                      msg.role === "user" 
                        ? "bg-primary text-primary-foreground ml-auto" 
                        : "bg-muted"
                    )}
                  >
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Pensando...</span>
                  </div>
                )}
              </CardContent>
              <div className="p-4 border-t">
                <div className="flex gap-2">
                  <Textarea
                    placeholder={`Pergunte algo para ${selectedIA.nome}...`}
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    rows={2}
                    className="resize-none"
                  />
                  <Button 
                    onClick={handleSendMessage} 
                    disabled={isLoading || !inputMessage.trim()}
                    className="shrink-0"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
