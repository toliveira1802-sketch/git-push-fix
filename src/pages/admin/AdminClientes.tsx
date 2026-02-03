import { useState } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Plus, User, Car, RefreshCw } from "lucide-react";
import { useClientes } from "@/hooks/useClientes";
import { ClienteCard } from "@/components/cadastros/ClienteCard";
import { NovoClienteDialog } from "@/components/cadastros/NovoClienteDialog";

export default function AdminClientes() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showNovoCliente, setShowNovoCliente] = useState(false);

  const {
    clientes,
    veiculosPorCliente,
    isLoading,
    refetch,
    deleteCliente,
    totalClientes,
    totalVeiculos,
  } = useClientes({
    searchTerm: search,
    status: statusFilter,
  });

  return (
    <AdminLayout>
      <div className="p-4 md:p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <User className="w-6 h-6 text-primary" />
              Clientes
            </h1>
            <p className="text-muted-foreground">
              Gestão de clientes e veículos
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="icon" onClick={() => refetch()}>
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button onClick={() => setShowNovoCliente(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Cliente
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 rounded-lg bg-primary/10">
                <User className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-muted-foreground text-sm">Total Clientes</p>
                <p className="text-2xl font-bold">{totalClientes}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 rounded-lg bg-accent">
                <Car className="h-6 w-6 text-accent-foreground" />
              </div>
              <div>
                <p className="text-muted-foreground text-sm">Total Veículos</p>
                <p className="text-2xl font-bold">{totalVeiculos}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="hidden md:block">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 rounded-lg bg-secondary">
                <Car className="h-6 w-6 text-secondary-foreground" />
              </div>
              <div>
                <p className="text-muted-foreground text-sm">Média Veículos/Cliente</p>
                <p className="text-2xl font-bold">
                  {totalClientes > 0 ? (totalVeiculos / totalClientes).toFixed(1) : "0"}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome, CPF, telefone, email ou placa..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Tabs value={statusFilter} onValueChange={setStatusFilter}>
            <TabsList>
              <TabsTrigger value="all">Todos</TabsTrigger>
              <TabsTrigger value="active">Ativos</TabsTrigger>
              <TabsTrigger value="inactive">Inativos</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Lista de Clientes */}
        <div className="space-y-4">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-48" />
                      <Skeleton className="h-3 w-64" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : clientes.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <User className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  {search
                    ? "Nenhum cliente encontrado com essa busca"
                    : "Nenhum cliente cadastrado ainda"}
                </p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => setShowNovoCliente(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Cadastrar Primeiro Cliente
                </Button>
              </CardContent>
            </Card>
          ) : (
            clientes.map((cliente) => (
              <ClienteCard
                key={cliente.id}
                cliente={cliente}
                veiculos={veiculosPorCliente[cliente.id] || []}
                onDelete={deleteCliente}
              />
            ))
          )}
        </div>
      </div>

      {/* Modal Novo Cliente */}
      <NovoClienteDialog
        open={showNovoCliente}
        onOpenChange={setShowNovoCliente}
        onSuccess={refetch}
      />
    </AdminLayout>
  );
}
