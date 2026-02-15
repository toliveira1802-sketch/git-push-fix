import { useState } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { 
  ClipboardCheck, 
  User, 
  Car, 
  Send, 
  Loader2,
  CheckCircle2,
  AlertTriangle,
  Shield,
  Sparkles
} from 'lucide-react';

// Tipos de checklist
type TipoChecklist = "obrigatorio" | "seguranca" | "conforto" | "documentacao";

interface ChecklistItem {
  id: string;
  nome: string;
  tipo: TipoChecklist;
  verificado: boolean;
  observacao: string;
}

// Itens padrão do checklist
const itensChecklistPadrao: ChecklistItem[] = [
  { id: "1", nome: "Nível de Óleo", tipo: "obrigatorio", verificado: false, observacao: "" },
  { id: "2", nome: "Nível de Água", tipo: "obrigatorio", verificado: false, observacao: "" },
  { id: "3", nome: "Freios", tipo: "obrigatorio", verificado: false, observacao: "" },
  { id: "4", nome: "KM Atual Registrado", tipo: "obrigatorio", verificado: false, observacao: "" },
  { id: "5", nome: "Pneus", tipo: "seguranca", verificado: false, observacao: "" },
  { id: "6", nome: "Luzes", tipo: "seguranca", verificado: false, observacao: "" },
  { id: "7", nome: "Bateria", tipo: "seguranca", verificado: false, observacao: "" },
  { id: "8", nome: "Suspensão", tipo: "seguranca", verificado: false, observacao: "" },
  { id: "9", nome: "Ar Condicionado", tipo: "conforto", verificado: false, observacao: "" },
  { id: "10", nome: "Vidros", tipo: "conforto", verificado: false, observacao: "" },
  { id: "11", nome: "Limpadores", tipo: "conforto", verificado: false, observacao: "" },
  { id: "12", nome: "Correia", tipo: "seguranca", verificado: false, observacao: "" },
];

const API_URL = "https://us-central1-doctor-auto-prime-core.cloudfunctions.net/analisar-checklist";

export default function AdminChecklist() {
  // Estado do cliente
  const [cliente, setCliente] = useState({
    nome: "",
    telefone: "",
    email: "",
  });

  // Estado do veículo
  const [veiculo, setVeiculo] = useState({
    modelo: "",
    placa: "",
    ano: "",
    cor: "",
    kmAtual: "",
  });

  // Estado do checklist
  const [itensChecklist, setItensChecklist] = useState<ChecklistItem[]>(itensChecklistPadrao);
  
  // Estado de envio
  const [enviando, setEnviando] = useState(false);

  // Atualizar item do checklist
  const toggleItem = (id: string) => {
    setItensChecklist(prev => 
      prev.map(item => 
        item.id === id ? { ...item, verificado: !item.verificado } : item
      )
    );
  };

  // Atualizar observação do item
  const updateObservacao = (id: string, observacao: string) => {
    setItensChecklist(prev => 
      prev.map(item => 
        item.id === id ? { ...item, observacao } : item
      )
    );
  };

  // Enviar checklist para API externa
  const enviarChecklist = async () => {
    // Validação básica
    if (!cliente.nome.trim()) {
      toast.error("Informe o nome do cliente");
      return;
    }
    if (!veiculo.placa.trim()) {
      toast.error("Informe a placa do veículo");
      return;
    }

    setEnviando(true);

    const payload = {
      cliente: {
        nome: cliente.nome.trim(),
        telefone: cliente.telefone.trim(),
        email: cliente.email.trim(),
      },
      veiculo: {
        modelo: veiculo.modelo.trim(),
        placa: veiculo.placa.trim().toUpperCase(),
        ano: veiculo.ano ? parseInt(veiculo.ano) : null,
        cor: veiculo.cor.trim(),
        kmAtual: veiculo.kmAtual ? parseInt(veiculo.kmAtual) : null,
      },
      checklist: itensChecklist.map(item => ({
        id: item.id,
        nome: item.nome,
        tipo: item.tipo,
        verificado: item.verificado,
        observacao: item.observacao.trim(),
      })),
      dataEnvio: new Date().toISOString(),
    };

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Erro na API:", response.status, errorText);
        throw new Error(`Erro ${response.status}: ${errorText || "Falha ao sincronizar"}`);
      }

      const data = await response.json();
      console.log("Resposta da API:", data);

      toast.success("Checklist Sincronizado com Doctor Auto Prime Core", {
        description: "Os dados foram enviados com sucesso!",
        duration: 5000,
      });

      // Limpar formulário após sucesso (opcional)
      // resetFormulario();

    } catch (error) {
      console.error("Erro ao enviar checklist:", error);
      toast.error("Erro ao sincronizar checklist", {
        description: error instanceof Error ? error.message : "Tente novamente mais tarde",
      });
    } finally {
      setEnviando(false);
    }
  };

  // Agrupar itens por tipo
  const itensPorTipo = {
    obrigatorio: itensChecklist.filter(i => i.tipo === "obrigatorio"),
    seguranca: itensChecklist.filter(i => i.tipo === "seguranca"),
    conforto: itensChecklist.filter(i => i.tipo === "conforto"),
    documentacao: itensChecklist.filter(i => i.tipo === "documentacao"),
  };

  const getTipoIcon = (tipo: TipoChecklist) => {
    switch (tipo) {
      case "obrigatorio": return <CheckCircle2 className="h-4 w-4 text-destructive" />;
      case "seguranca": return <Shield className="h-4 w-4 text-warning" />;
      case "conforto": return <Sparkles className="h-4 w-4 text-primary" />;
      case "documentacao": return <AlertTriangle className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getTipoLabel = (tipo: TipoChecklist) => {
    switch (tipo) {
      case "obrigatorio": return "Obrigatório";
      case "seguranca": return "Segurança";
      case "conforto": return "Conforto";
      case "documentacao": return "Documentação";
    }
  };

  return (
    <AdminLayout>
      <div className="p-4 md:p-6 space-y-6 max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3">
          <ClipboardCheck className="h-6 w-6 text-primary" />
          <div>
            <h1 className="text-2xl font-bold">Checklist de Entrada</h1>
            <p className="text-muted-foreground">Registre a inspeção do veículo</p>
          </div>
        </div>

        {/* Dados do Cliente */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <User className="h-5 w-5" />
              Dados do Cliente
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome *</Label>
              <Input
                id="nome"
                placeholder="Nome do cliente"
                value={cliente.nome}
                onChange={(e) => setCliente(prev => ({ ...prev, nome: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="telefone">Telefone</Label>
              <Input
                id="telefone"
                placeholder="(00) 00000-0000"
                value={cliente.telefone}
                onChange={(e) => setCliente(prev => ({ ...prev, telefone: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="email@exemplo.com"
                value={cliente.email}
                onChange={(e) => setCliente(prev => ({ ...prev, email: e.target.value }))}
              />
            </div>
          </CardContent>
        </Card>

        {/* Dados do Veículo */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Car className="h-5 w-5" />
              Dados do Veículo
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="placa">Placa *</Label>
              <Input
                id="placa"
                placeholder="ABC-1234"
                value={veiculo.placa}
                onChange={(e) => setVeiculo(prev => ({ ...prev, placa: e.target.value.toUpperCase() }))}
                maxLength={8}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="modelo">Modelo</Label>
              <Input
                id="modelo"
                placeholder="Ex: Honda Civic"
                value={veiculo.modelo}
                onChange={(e) => setVeiculo(prev => ({ ...prev, modelo: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ano">Ano</Label>
              <Input
                id="ano"
                type="number"
                placeholder="2024"
                value={veiculo.ano}
                onChange={(e) => setVeiculo(prev => ({ ...prev, ano: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cor">Cor</Label>
              <Input
                id="cor"
                placeholder="Preto"
                value={veiculo.cor}
                onChange={(e) => setVeiculo(prev => ({ ...prev, cor: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="kmAtual">KM Atual</Label>
              <Input
                id="kmAtual"
                type="number"
                placeholder="45000"
                value={veiculo.kmAtual}
                onChange={(e) => setVeiculo(prev => ({ ...prev, kmAtual: e.target.value }))}
              />
            </div>
          </CardContent>
        </Card>

        {/* Itens do Checklist */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <ClipboardCheck className="h-5 w-5" />
              Itens do Checklist
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {(["obrigatorio", "seguranca", "conforto"] as TipoChecklist[]).map(tipo => (
              itensPorTipo[tipo].length > 0 && (
                <div key={tipo} className="space-y-3">
                  <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    {getTipoIcon(tipo)}
                    {getTipoLabel(tipo)}
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {itensPorTipo[tipo].map(item => (
                      <div 
                        key={item.id} 
                        className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                      >
                        <Checkbox
                          id={`item-${item.id}`}
                          checked={item.verificado}
                          onCheckedChange={() => toggleItem(item.id)}
                          className="mt-0.5"
                        />
                        <div className="flex-1 space-y-2">
                          <Label 
                            htmlFor={`item-${item.id}`}
                            className="text-sm font-medium cursor-pointer"
                          >
                            {item.nome}
                          </Label>
                          <Textarea
                            placeholder="Observação (opcional)"
                            value={item.observacao}
                            onChange={(e) => updateObservacao(item.id, e.target.value)}
                            className="min-h-[60px] text-xs resize-none"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            ))}
          </CardContent>
        </Card>

        {/* Botão Enviar */}
        <div className="flex justify-end">
          <Button 
            size="lg" 
            onClick={enviarChecklist}
            disabled={enviando}
            className="gap-2"
          >
            {enviando ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                Salvar / Enviar Checklist
              </>
            )}
          </Button>
        </div>
      </div>
    </AdminLayout>
  );
}
