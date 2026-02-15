import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { XCircle, Loader2 } from "lucide-react";

interface RefuseItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (reason?: string) => Promise<void>;
  itemDescription?: string;
  isLoading?: boolean;
}

export function RefuseItemDialog({
  open,
  onOpenChange,
  onConfirm,
  itemDescription,
  isLoading = false,
}: RefuseItemDialogProps) {
  const [reason, setReason] = useState("");

  const handleConfirm = async () => {
    await onConfirm(reason.trim() || undefined);
    setReason("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <XCircle className="w-5 h-5" />
            Recusar Item
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {itemDescription && (
            <p className="text-sm text-muted-foreground">
              Item: <strong>{itemDescription}</strong>
            </p>
          )}

          <div>
            <p className="text-sm text-muted-foreground mb-2">
              Informe o motivo da recusa (opcional):
            </p>
            <Textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Ex: Cliente preferiu fazer o serviço depois, muito caro, não quer fazer agora..."
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button variant="destructive" onClick={handleConfirm} disabled={isLoading}>
            {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Confirmar Recusa
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
