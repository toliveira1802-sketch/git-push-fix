import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn, formatCurrency } from "@/lib/utils";
import { AlertTriangle, Loader2 } from "lucide-react";
import type { NewItemInput, PrioridadeType, BudgetTier } from "@/hooks/useOSItems";

interface ItemFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (item: NewItemInput) => Promise<boolean>;
  defaultMargin?: number;
  isSaving?: boolean;
}

const prioridadeOptions = [
  { value: "verde", label: "🟢 Preventivo", description: "Pode aguardar, mas fique atento" },
  { value: "amarelo", label: "🟡 Atenção", description: "Recomendamos fazer em breve" },
  { value: "vermelho", label: "🔴 Urgente", description: "Troca imediata necessária" },
];

const tierOptions = [
  { value: "premium", label: "⭐ Premium", description: "Peças primeira linha" },
  { value: "standard", label: "🔧 Standard", description: "Melhor custo-benefício" },
  { value: "eco", label: "💰 Econômico", description: "Opção mais acessível" },
];

export function ItemFormDialog({
  open,
  onOpenChange,
  onSubmit,
  defaultMargin = 40,
  isSaving = false,
}: ItemFormDialogProps) {
  const [formData, setFormData] = useState({
    description: "",
    type: "peca" as "peca" | "mao_de_obra",
    quantity: 1,
    cost_price: 0,
    unit_price: 0,
    priority: "amarelo" as PrioridadeType,
    budget_tier: "standard" as BudgetTier,
    notes: "",
    discount_justification: "",
  });

  const [useAutoPrice, setUseAutoPrice] = useState(true);

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      setFormData({
        description: "",
        type: "peca",
        quantity: 1,
        cost_price: 0,
        unit_price: 0,
        priority: "amarelo",
        budget_tier: "standard",
        notes: "",
        discount_justification: "",
      });
      setUseAutoPrice(true);
    }
  }, [open]);

  // Calculate values
  const suggestedPrice = formData.cost_price * (1 + defaultMargin / 100);
  const effectiveUnitPrice = useAutoPrice ? suggestedPrice : formData.unit_price;
  const totalPrice = effectiveUnitPrice * formData.quantity;
  
  const actualMargin = formData.cost_price > 0 
    ? ((effectiveUnitPrice - formData.cost_price) / formData.cost_price) * 100
    : 100;
  
  const isLowMargin = actualMargin < defaultMargin;
  const needsJustification = isLowMargin && !formData.discount_justification.trim();

  // Handle type change - reset cost for labor
  const handleTypeChange = (type: "peca" | "mao_de_obra") => {
    setFormData({
      ...formData,
      type,
      cost_price: type === "mao_de_obra" ? 0 : formData.cost_price,
    });
  };

  // Handle cost change - update unit price if auto
  const handleCostChange = (cost: number) => {
    setFormData({ ...formData, cost_price: cost });
  };

  // Handle unit price change
  const handleUnitPriceChange = (price: number) => {
    setUseAutoPrice(false);
    setFormData({ ...formData, unit_price: price });
  };

  // Handle submit
  const handleSubmit = async () => {
    const itemData: NewItemInput = {
      description: formData.description,
      type: formData.type,
      quantity: formData.quantity,
      cost_price: formData.cost_price,
      unit_price: effectiveUnitPrice,
      priority: formData.priority,
      budget_tier: formData.budget_tier,
      notes: formData.notes || undefined,
      discount_justification: formData.discount_justification || undefined,
    };

    const success = await onSubmit(itemData);
    if (success) {
      onOpenChange(false);
    }
  };

  const isValid = 
    formData.description.trim() && 
    effectiveUnitPrice > 0 && 
    formData.quantity > 0 &&
    (!needsJustification || formData.type === "mao_de_obra");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Adicionar Item ao Orçamento</DialogTitle>
          <DialogDescription>
            Preencha os dados do item. O valor de venda será calculado automaticamente com base na margem padrão de {defaultMargin}%.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Description */}
          <div>
            <Label>Descrição *</Label>
            <Input
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Ex: Pastilhas de freio dianteiras Brembo"
            />
          </div>

          {/* Type & Priority */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Tipo *</Label>
              <Select value={formData.type} onValueChange={handleTypeChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="peca">🔩 Peça</SelectItem>
                  <SelectItem value="mao_de_obra">👷 Mão de Obra</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Prioridade *</Label>
              <Select
                value={formData.priority}
                onValueChange={(v) => setFormData({ ...formData, priority: v as PrioridadeType })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {prioridadeOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Tier & Quantity */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Nível</Label>
              <Select
                value={formData.budget_tier}
                onValueChange={(v) => setFormData({ ...formData, budget_tier: v as BudgetTier })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {tierOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Quantidade *</Label>
              <Input
                type="number"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) || 1 })}
                min={1}
              />
            </div>
          </div>

          {/* Cost & Price */}
          <div className="grid grid-cols-2 gap-4">
            {formData.type === "peca" && (
              <div>
                <Label>Custo (R$)</Label>
                <Input
                  type="number"
                  value={formData.cost_price || ""}
                  onChange={(e) => handleCostChange(Number(e.target.value) || 0)}
                  min={0}
                  step={0.01}
                  placeholder="0,00"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Sugerido: {formatCurrency(suggestedPrice)}
                </p>
              </div>
            )}
            <div className={formData.type === "mao_de_obra" ? "col-span-2" : ""}>
              <Label>Valor Unitário (R$) *</Label>
              <Input
                type="number"
                value={useAutoPrice ? suggestedPrice.toFixed(2) : formData.unit_price || ""}
                onChange={(e) => handleUnitPriceChange(Number(e.target.value) || 0)}
                min={0}
                step={0.01}
              />
              {formData.type === "peca" && !useAutoPrice && (
                <Button
                  type="button"
                  variant="link"
                  size="sm"
                  className="h-auto p-0 text-xs"
                  onClick={() => setUseAutoPrice(true)}
                >
                  Usar preço sugerido
                </Button>
              )}
            </div>
          </div>

          {/* Margin Warning */}
          {formData.type === "peca" && isLowMargin && (
            <div className={cn(
              "p-3 rounded-lg border flex items-start gap-3",
              needsJustification 
                ? "bg-red-500/10 border-red-500/30" 
                : "bg-amber-500/10 border-amber-500/30"
            )}>
              <AlertTriangle className={cn(
                "w-5 h-5 shrink-0 mt-0.5",
                needsJustification ? "text-red-600" : "text-amber-600"
              )} />
              <div className="flex-1">
                <p className={cn(
                  "font-medium text-sm",
                  needsJustification ? "text-red-600" : "text-amber-600"
                )}>
                  Margem abaixo do padrão: {actualMargin.toFixed(1)}%
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Informe a justificativa para o desconto aplicado.
                </p>
                <Textarea
                  className="mt-2"
                  value={formData.discount_justification}
                  onChange={(e) => setFormData({ ...formData, discount_justification: e.target.value })}
                  placeholder="Ex: Cliente antigo com desconto fidelidade..."
                  rows={2}
                />
              </div>
            </div>
          )}

          {/* Notes */}
          <div>
            <Label>Observações</Label>
            <Textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Observações adicionais sobre o item..."
              rows={2}
            />
          </div>

          {/* Summary */}
          <div className="p-4 bg-muted rounded-lg space-y-2">
            <div className="flex justify-between text-sm">
              <span>Quantidade</span>
              <span>{formData.quantity}x</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Valor Unitário</span>
              <span>{formatCurrency(effectiveUnitPrice)}</span>
            </div>
            {formData.type === "peca" && (
              <div className="flex justify-between text-sm">
                <span>Margem</span>
                <Badge 
                  variant="outline" 
                  className={cn(
                    isLowMargin ? "text-amber-600 border-amber-500/30" : "text-emerald-600 border-emerald-500/30"
                  )}
                >
                  {actualMargin.toFixed(1)}%
                </Badge>
              </div>
            )}
            <div className="border-t pt-2 mt-2 flex justify-between">
              <span className="font-medium">Total</span>
              <span className="font-bold text-lg">{formatCurrency(totalPrice)}</span>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={!isValid || isSaving}>
            {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Adicionar Item
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
