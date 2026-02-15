import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Car, 
  Search, 
  RefreshCw, 
  Link2, 
  Trash2, 
  ChevronLeft, 
  ChevronRight,
  Filter,
  Download,
  AlertCircle
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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

interface VeiculoOrfao {
  id: string;
  client_id_original: string | null;
  marca: string | null;
  modelo: string | null;
  versao: string | null;
  ano: string | null;
  cor: string | null;
  placa: string | null;
  chassi: string | null;
  km: number | null;
  combustivel: string | null;
  notas: string | null;
  origem_contato: string | null;
  is_active: boolean | null;
  created_at: string | null;
}

interface Cliente {
  id: string;
  name: string;
  phone: string;
}

const PAGE_SIZE = 25;

export default function GestaoVeiculosOrfaos() {
  const [veiculos, setVeiculos] = useState<VeiculoOrfao[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [marcaFilter, setMarcaFilter] = useState<string>("all");
  const [marcas, setMarcas] = useState<string[]>([]);
  
  // Modal de vincular
  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const [selectedVeiculo, setSelectedVeiculo] = useState<VeiculoOrfao | null>(null);
  const [clienteSearch, setClienteSearch] = useState("");
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null);
  const [linking, setLinking] = useState(false);
  
  // Delete confirmation
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [veiculoToDelete, setVeiculoToDelete] = useState<VeiculoOrfao | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Buscar veículos
  const fetchVeiculos = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('veiculos_orfaos')
        .select('*', { count: 'exact' })
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (searchTerm) {
        query = query.or(`placa.ilike.%${searchTerm}%,marca.ilike.%${searchTerm}%,modelo.ilike.%${searchTerm}%,client_id_original.ilike.%${searchTerm}%`);
      }
      
      if (marcaFilter && marcaFilter !== "all") {
        query = query.eq('marca', marcaFilter);
      }

      query = query.range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);

      const { data, error, count } = await query;

      if (error) throw error;
      
      setVeiculos(data || []);
      setTotalCount(count || 0);
    } catch (error) {
      console.error('Erro ao buscar veículos:', error);
      toast.error('Erro ao carregar veículos');
    } finally {
      setLoading(false);
    }
  };

  // Buscar marcas únicas
  const fetchMarcas = async () => {
    const { data } = await supabase
      .from('veiculos_orfaos')
      .select('marca')
      .eq('is_active', true)
      .not('marca', 'is', null);
    
    if (data) {
      const uniqueMarcas = [...new Set(data.map(v => v.marca).filter(Boolean))] as string[];
      setMarcas(uniqueMarcas.sort());
    }
  };

  // Buscar clientes
  const searchClientes = async (term: string) => {
    if (term.length < 2) {
      setClientes([]);
      return;
    }

    const { data } = await supabase
      .from('clientes')
      .select('id, name, phone')
      .or(`name.ilike.%${term}%,phone.ilike.%${term}%`)
      .limit(10);

    setClientes(data || []);
  };

  // Vincular veículo a cliente
  const handleLink = async () => {
    if (!selectedVeiculo || !selectedCliente) return;

    setLinking(true);
    try {
      // Criar veículo na tabela principal
      const { error: insertError } = await supabase
        .from('veiculos')
        .insert({
          client_id: selectedCliente.id,
          brand: selectedVeiculo.marca || 'N/A',
          model: selectedVeiculo.modelo || 'N/A',
          versao: selectedVeiculo.versao,
          year: selectedVeiculo.ano ? parseInt(selectedVeiculo.ano.split('|')[0]) : null,
          color: selectedVeiculo.cor,
          plate: selectedVeiculo.placa || 'SEM-PLACA',
          chassis: selectedVeiculo.chassi,
          km: selectedVeiculo.km,
          fuel_type: selectedVeiculo.combustivel,
          notes: selectedVeiculo.notas,
          origem_contato: selectedVeiculo.origem_contato,
        });

      if (insertError) throw insertError;

      // Marcar veículo órfão como inativo
      const { error: updateError } = await supabase
        .from('veiculos_orfaos')
        .update({ is_active: false })
        .eq('id', selectedVeiculo.id);

      if (updateError) throw updateError;

      toast.success(`Veículo vinculado a ${selectedCliente.name}`);
      setLinkDialogOpen(false);
      setSelectedVeiculo(null);
      setSelectedCliente(null);
      setClienteSearch("");
      fetchVeiculos();
    } catch (error: any) {
      console.error('Erro ao vincular:', error);
      toast.error(error.message || 'Erro ao vincular veículo');
    } finally {
      setLinking(false);
    }
  };

  // Deletar veículo órfão
  const handleDelete = async () => {
    if (!veiculoToDelete) return;

    setDeleting(true);
    try {
      const { error } = await supabase
        .from('veiculos_orfaos')
        .update({ is_active: false })
        .eq('id', veiculoToDelete.id);

      if (error) throw error;

      toast.success('Veículo removido');
      setDeleteDialogOpen(false);
      setVeiculoToDelete(null);
      fetchVeiculos();
    } catch (error) {
      console.error('Erro ao deletar:', error);
      toast.error('Erro ao remover veículo');
    } finally {
      setDeleting(false);
    }
  };

  useEffect(() => {
    fetchVeiculos();
    fetchMarcas();
  }, [page, marcaFilter]);

  useEffect(() => {
    const debounce = setTimeout(() => {
      setPage(0);
      fetchVeiculos();
    }, 300);
    return () => clearTimeout(debounce);
  }, [searchTerm]);

  useEffect(() => {
    const debounce = setTimeout(() => {
      searchClientes(clienteSearch);
    }, 300);
    return () => clearTimeout(debounce);
  }, [clienteSearch]);

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  return (
    <AdminLayout>
      <div className="p-4 md:p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Car className="h-6 w-6" />
              Veículos Órfãos
            </h1>
            <p className="text-muted-foreground">
              Veículos importados do sistema antigo aguardando vinculação
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-lg px-4 py-2">
              {totalCount.toLocaleString()} veículos
            </Badge>
            <Button variant="outline" size="icon" onClick={fetchVeiculos}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalCount.toLocaleString()}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Marcas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{marcas.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Com Placa</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">
                {veiculos.filter(v => v.placa).length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Com Chassi</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-accent-foreground">
                {veiculos.filter(v => v.chassi).length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por placa, marca, modelo ou ID original..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={marcaFilter} onValueChange={setMarcaFilter}>
                <SelectTrigger className="w-full md:w-[200px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filtrar por marca" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as marcas</SelectItem>
                  {marcas.map((marca) => (
                    <SelectItem key={marca} value={marca}>
                      {marca}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Table */}
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Placa</TableHead>
                    <TableHead>Marca</TableHead>
                    <TableHead>Modelo</TableHead>
                    <TableHead>Ano</TableHead>
                    <TableHead>Cor</TableHead>
                    <TableHead>Chassi</TableHead>
                    <TableHead>ID Original</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-10">
                        <RefreshCw className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                      </TableCell>
                    </TableRow>
                  ) : veiculos.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-10">
                        <AlertCircle className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                        <p className="text-muted-foreground">Nenhum veículo encontrado</p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    veiculos.map((veiculo) => (
                      <TableRow key={veiculo.id}>
                        <TableCell className="font-mono font-medium">
                          {veiculo.placa || '-'}
                        </TableCell>
                        <TableCell>{veiculo.marca || '-'}</TableCell>
                        <TableCell className="max-w-[200px] truncate">
                          {veiculo.modelo || '-'}
                        </TableCell>
                        <TableCell>{veiculo.ano || '-'}</TableCell>
                        <TableCell>{veiculo.cor || '-'}</TableCell>
                        <TableCell className="font-mono text-xs">
                          {veiculo.chassi ? `${veiculo.chassi.slice(0, 8)}...` : '-'}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{veiculo.client_id_original || '-'}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedVeiculo(veiculo);
                                setLinkDialogOpen(true);
                              }}
                            >
                              <Link2 className="h-4 w-4 mr-1" />
                              Vincular
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-destructive hover:text-destructive"
                              onClick={() => {
                                setVeiculoToDelete(veiculo);
                                setDeleteDialogOpen(true);
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t">
                <p className="text-sm text-muted-foreground">
                  Página {page + 1} de {totalPages}
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(p => Math.max(0, p - 1))}
                    disabled={page === 0}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                    disabled={page >= totalPages - 1}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Link Dialog */}
      <Dialog open={linkDialogOpen} onOpenChange={setLinkDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Vincular Veículo a Cliente</DialogTitle>
            <DialogDescription>
              {selectedVeiculo && (
                <span>
                  Vincular <strong>{selectedVeiculo.placa}</strong> - {selectedVeiculo.marca} {selectedVeiculo.modelo}
                </span>
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Buscar Cliente</label>
              <Input
                placeholder="Digite nome ou telefone do cliente..."
                value={clienteSearch}
                onChange={(e) => setClienteSearch(e.target.value)}
                className="mt-1"
              />
            </div>

            {clientes.length > 0 && (
              <div className="border rounded-lg max-h-48 overflow-auto">
                {clientes.map((cliente) => (
                  <div
                    key={cliente.id}
                    className={`p-3 cursor-pointer hover:bg-muted transition-colors ${
                      selectedCliente?.id === cliente.id ? 'bg-primary/10 border-l-2 border-primary' : ''
                    }`}
                    onClick={() => setSelectedCliente(cliente)}
                  >
                    <p className="font-medium">{cliente.name}</p>
                    <p className="text-sm text-muted-foreground">{cliente.phone}</p>
                  </div>
                ))}
              </div>
            )}

            {clienteSearch.length > 1 && clientes.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                Nenhum cliente encontrado
              </p>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setLinkDialogOpen(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={handleLink} 
              disabled={!selectedCliente || linking}
            >
              {linking ? 'Vinculando...' : 'Vincular'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover Veículo</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja remover o veículo{' '}
              <strong>{veiculoToDelete?.placa}</strong>? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? 'Removendo...' : 'Remover'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}
