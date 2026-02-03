import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { User, Phone, Mail, MapPin, Car, ChevronDown, ChevronUp, Pencil, Trash2 } from "lucide-react";
import type { Cliente, Veiculo } from "@/hooks/useClientes";
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

interface ClienteCardProps {
  cliente: Cliente;
  veiculos: Veiculo[];
  onEdit?: (cliente: Cliente) => void;
  onDelete?: (id: string) => void;
}

export function ClienteCard({ cliente, veiculos, onEdit, onDelete }: ClienteCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  return (
    <>
      <Card className="border hover:shadow-md transition-shadow">
        <CardContent className="p-0">
          <div
            className="p-4 cursor-pointer"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-primary/10">
                  <User className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="font-bold text-lg">{cliente.name}</p>
                  <div className="flex items-center gap-4 text-muted-foreground text-sm">
                    <span className="flex items-center gap-1">
                      <Phone className="h-3 w-3" />
                      {cliente.phone}
                    </span>
                    {cliente.email && (
                      <span className="flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        {cliente.email}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Badge variant="secondary">
                  {veiculos.length} veículo(s)
                </Badge>
                {cliente.cpf && (
                  <span className="text-muted-foreground text-sm">{cliente.cpf}</span>
                )}
                {isExpanded ? (
                  <ChevronUp className="h-5 w-5 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-muted-foreground" />
                )}
              </div>
            </div>
          </div>

          {isExpanded && (
            <div className="border-t p-4 bg-muted/30">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    Informações
                  </h4>
                  <div className="space-y-2 text-sm">
                    {cliente.address && (
                      <p className="text-muted-foreground">{cliente.address}</p>
                    )}
                    {cliente.city && (
                      <p className="text-muted-foreground">{cliente.city}</p>
                    )}
                    {cliente.notes && (
                      <p className="text-muted-foreground italic">{cliente.notes}</p>
                    )}
                    <p className="text-muted-foreground">
                      Cadastro: {new Date(cliente.created_at).toLocaleDateString("pt-BR")}
                    </p>
                  </div>

                  <div className="flex gap-2 mt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onEdit?.(cliente);
                      }}
                    >
                      <Pencil className="h-4 w-4 mr-1" />
                      Editar
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowDeleteDialog(true);
                      }}
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Excluir
                    </Button>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <Car className="h-4 w-4 text-muted-foreground" />
                    Veículos
                  </h4>
                  {veiculos.length > 0 ? (
                    <div className="space-y-2">
                      {veiculos.map((veiculo) => (
                        <div
                          key={veiculo.id}
                          className="p-3 bg-background rounded-lg border"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-bold">{veiculo.plate}</p>
                              <p className="text-muted-foreground text-sm">
                                {veiculo.brand} {veiculo.model}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-muted-foreground text-sm">{veiculo.year}</p>
                              {veiculo.km && (
                                <p className="text-muted-foreground text-xs">
                                  {veiculo.km.toLocaleString("pt-BR")} km
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-sm">Nenhum veículo cadastrado</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Cliente?</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir <strong>{cliente.name}</strong>?
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => onDelete?.(cliente.id)}
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
