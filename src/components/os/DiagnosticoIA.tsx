import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Stethoscope, Sparkles, ChevronDown, ChevronUp, AlertTriangle, CheckCircle, Lightbulb } from "lucide-react";
import { cn } from "@/lib/utils";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface DiagnosticoIAProps {
  descricaoProblema: string;
  veiculo: string;
  kmAtual?: string | null;
  onSugestaoClick?: (sugestao: string) => void;
}

interface SugestaoItem {
  titulo: string;
  descricao: string;
  prioridade: "alta" | "media" | "baixa";
  tipo: "teste" | "servico" | "peca";
}

export function DiagnosticoIA({ descricaoProblema, veiculo, kmAtual, onSugestaoClick }: DiagnosticoIAProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [diagnostico, setDiagnostico] = useState<string | null>(null);
  const [sugestoes, setSugestoes] = useState<SugestaoItem[]>([]);
  const [hasAnalyzed, setHasAnalyzed] = useState(false);

  const handleAnalyze = async () => {
    if (!descricaoProblema.trim()) {
      toast.error("Preencha a descrição do problema primeiro");
      return;
    }

    setIsLoading(true);
    setIsOpen(true);

    try {
      const prompt = `Veículo: ${veiculo}
${kmAtual ? `Quilometragem: ${kmAtual} km` : ""}
Problema relatado: ${descricaoProblema}

Analise o problema e forneça:
1. Um diagnóstico provável (2-3 linhas)
2. Testes recomendados para confirmar
3. Serviços e peças que podem ser necessários

Seja técnico mas objetivo.`;

      const response = await supabase.functions.invoke("ai-oficina", {
        body: {
          messages: [{ role: "user", content: prompt }],
          assistantId: "dr-auto",
        },
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      const data = response.data;
      const content = data.content || data.choices?.[0]?.message?.content || "";
      
      setDiagnostico(content);
      
      // Parse simples para extrair sugestões do texto
      const sugestoesExtraidas: SugestaoItem[] = [];
      
      // Verificar menções comuns
      if (content.toLowerCase().includes("pastilha") || content.toLowerCase().includes("freio")) {
        sugestoesExtraidas.push({
          titulo: "Verificar sistema de freios",
          descricao: "Inspecionar pastilhas, discos e fluido de freio",
          prioridade: "alta",
          tipo: "teste"
        });
      }
      if (content.toLowerCase().includes("suspensão") || content.toLowerCase().includes("amortecedor")) {
        sugestoesExtraidas.push({
          titulo: "Checar suspensão",
          descricao: "Verificar amortecedores, molas e buchas",
          prioridade: "media",
          tipo: "teste"
        });
      }
      if (content.toLowerCase().includes("óleo") || content.toLowerCase().includes("motor")) {
        sugestoesExtraidas.push({
          titulo: "Verificar nível e qualidade do óleo",
          descricao: "Checar óleo do motor e possíveis vazamentos",
          prioridade: "media",
          tipo: "teste"
        });
      }
      if (content.toLowerCase().includes("bateria") || content.toLowerCase().includes("elétrico")) {
        sugestoesExtraidas.push({
          titulo: "Teste elétrico",
          descricao: "Verificar bateria, alternador e sistema elétrico",
          prioridade: "media",
          tipo: "teste"
        });
      }
      if (content.toLowerCase().includes("correia")) {
        sugestoesExtraidas.push({
          titulo: "Inspecionar correias",
          descricao: "Verificar estado e tensão das correias",
          prioridade: "alta",
          tipo: "teste"
        });
      }
      if (content.toLowerCase().includes("alinhamento") || content.toLowerCase().includes("balanceamento")) {
        sugestoesExtraidas.push({
          titulo: "Alinhamento e balanceamento",
          descricao: "Verificar geometria e balanceamento das rodas",
          prioridade: "baixa",
          tipo: "servico"
        });
      }

      // Se não encontrou nada específico, adiciona sugestões genéricas
      if (sugestoesExtraidas.length === 0) {
        sugestoesExtraidas.push({
          titulo: "Inspeção visual completa",
          descricao: "Realizar checklist de entrada completo",
          prioridade: "media",
          tipo: "teste"
        });
        sugestoesExtraidas.push({
          titulo: "Test drive diagnóstico",
          descricao: "Dirigir o veículo para identificar o problema",
          prioridade: "alta",
          tipo: "teste"
        });
      }

      setSugestoes(sugestoesExtraidas);
      setHasAnalyzed(true);
    } catch (error) {
      console.error("Erro ao analisar:", error);
      toast.error("Erro ao consultar Dr. Auto");
    } finally {
      setIsLoading(false);
    }
  };

  const prioridadeConfig = {
    alta: { label: "Urgente", color: "bg-red-500/10 text-red-600 border-red-500/20", icon: AlertTriangle },
    media: { label: "Médio", color: "bg-amber-500/10 text-amber-600 border-amber-500/20", icon: Lightbulb },
    baixa: { label: "Tranquilo", color: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20", icon: CheckCircle },
  };

  const tipoConfig = {
    teste: { label: "Teste", color: "bg-blue-500/10 text-blue-600" },
    servico: { label: "Serviço", color: "bg-purple-500/10 text-purple-600" },
    peca: { label: "Peça", color: "bg-orange-500/10 text-orange-600" },
  };

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Stethoscope className="w-4 h-4 text-primary" />
              </div>
              <span>Dr. Auto</span>
              <Badge variant="outline" className="ml-2 text-xs font-normal">
                IA
              </Badge>
            </CardTitle>

            <div className="flex items-center gap-2">
              {!hasAnalyzed && (
                <Button
                  size="sm"
                  onClick={handleAnalyze}
                  disabled={isLoading || !descricaoProblema.trim()}
                  className="gap-2"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Sparkles className="w-4 h-4" />
                  )}
                  Analisar Problema
                </Button>
              )}
              
              {hasAnalyzed && (
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="sm">
                    {isOpen ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </Button>
                </CollapsibleTrigger>
              )}
            </div>
          </div>

          {!hasAnalyzed && !isLoading && (
            <p className="text-sm text-muted-foreground mt-2">
              Clique em "Analisar Problema" para receber sugestões de diagnóstico baseadas na descrição do problema.
            </p>
          )}
        </CardHeader>

        <CollapsibleContent>
          <CardContent className="pt-0 space-y-4">
            {isLoading && (
              <div className="flex items-center justify-center py-8">
                <div className="text-center space-y-2">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
                  <p className="text-sm text-muted-foreground">
                    Dr. Auto está analisando o problema...
                  </p>
                </div>
              </div>
            )}

            {diagnostico && !isLoading && (
              <>
                {/* Diagnóstico */}
                <div className="space-y-2">
                  <h4 className="font-medium text-sm flex items-center gap-2">
                    <Stethoscope className="w-4 h-4" />
                    Análise do Dr. Auto
                  </h4>
                  <div className="bg-muted/50 rounded-lg p-4 text-sm whitespace-pre-wrap">
                    {diagnostico}
                  </div>
                </div>

                {/* Sugestões */}
                {sugestoes.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm flex items-center gap-2">
                      <Lightbulb className="w-4 h-4" />
                      Ações Sugeridas
                    </h4>
                    <div className="grid gap-2">
                      {sugestoes.map((sugestao, index) => {
                        const prioridade = prioridadeConfig[sugestao.prioridade];
                        const tipo = tipoConfig[sugestao.tipo];
                        const PrioridadeIcon = prioridade.icon;

                        return (
                          <div
                            key={index}
                            className={cn(
                              "p-3 rounded-lg border cursor-pointer transition-colors hover:bg-accent/50",
                              prioridade.color.replace("text-", "border-").split(" ")[0] + "/20"
                            )}
                            onClick={() => onSugestaoClick?.(sugestao.titulo)}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex items-start gap-3">
                                <div className={cn("p-1.5 rounded", prioridade.color)}>
                                  <PrioridadeIcon className="w-3 h-3" />
                                </div>
                                <div>
                                  <p className="font-medium text-sm">{sugestao.titulo}</p>
                                  <p className="text-xs text-muted-foreground mt-0.5">
                                    {sugestao.descricao}
                                  </p>
                                </div>
                              </div>
                              <Badge variant="outline" className={cn("text-xs", tipo.color)}>
                                {tipo.label}
                              </Badge>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Botão para re-analisar */}
                <div className="flex justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleAnalyze}
                    disabled={isLoading}
                    className="gap-2"
                  >
                    <Sparkles className="w-3 h-3" />
                    Analisar Novamente
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
