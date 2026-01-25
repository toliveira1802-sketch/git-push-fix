import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { CRMStatsCards } from "@/components/crm/CRMStatsCards";
import { CRMClientCard } from "@/components/crm/CRMClientCard";
import { CRMKanban } from "@/components/crm/CRMKanban";
import { useCRMData, type CRMClient } from "@/hooks/useCRMData";
import {
  Users,
  Search,
  UserPlus,
  LayoutList,
  LayoutGrid,
  Kanban,
  Loader2,
  Filter,
  X,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type ViewMode = "list" | "cards" | "kanban";
type SortOption = "name" | "total_spent" | "last_service" | "created_at";

const loyaltyOptions = [
  { value: "all", label: "Todos os níveis" },
  { value: "bronze", label: "🥉 Bronze" },
  { value: "prata", label: "🥈 Prata" },
  { value: "ouro", label: "🥇 Ouro" },
  { value: "diamante", label: "💎 Diamante" },
];

const origemOptions = [
  { value: "all", label: "Todas origens" },
  { value: "indicacao", label: "Indicação" },
  { value: "redes_sociais", label: "Redes Sociais" },
  { value: "google", label: "Google" },
  { value: "passando", label: "Passando" },
  { value: "direto", label: "Direto" },
];

const sortOptions = [
  { value: "name", label: "Nome" },
  { value: "total_spent", label: "Maior gasto" },
  { value: "last_service", label: "Última visita" },
  { value: "created_at", label: "Mais recente" },
];

export default function Clientes() {
  const navigate = useNavigate();
  const { data, isLoading } = useCRMData();

  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loyaltyFilter, setLoyaltyFilter] = useState("all");
  const [origemFilter, setOrigemFilter] = useState("all");
  const [sortBy, setSortBy] = useState<SortOption>("name");

  const clients = data?.clients || [];
  const stats = data?.stats || {
    total: 0,
    leads: 0,
    ativos: 0,
    em_risco: 0,
    inativos: 0,
    perdidos: 0,
    total_faturamento: 0,
    ticket_medio_geral: 0,
    com_followup_pendente: 0,
  };

  // Filter clients
  const filteredClients = clients.filter((client) => {
    const matchesSearch =
      client.name.toLowerCase().includes(search.toLowerCase()) ||
      client.email?.toLowerCase().includes(search.toLowerCase()) ||
      client.phone.includes(search);

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "followup"
        ? client.proximo_contato && new Date(client.proximo_contato) <= new Date()
        : client.status_crm === statusFilter);

    const matchesLoyalty =
      loyaltyFilter === "all" || client.loyalty_level === loyaltyFilter;

    const matchesOrigem = origemFilter === "all" || client.origem === origemFilter;

    return matchesSearch && matchesStatus && matchesLoyalty && matchesOrigem;
  });

  // Sort clients
  const sortedClients = [...filteredClients].sort((a, b) => {
    switch (sortBy) {
      case "name":
        return a.name.localeCompare(b.name);
      case "total_spent":
        return b.total_spent - a.total_spent;
      case "last_service":
        if (!a.last_service_date) return 1;
        if (!b.last_service_date) return -1;
        return new Date(b.last_service_date).getTime() - new Date(a.last_service_date).getTime();
      case "created_at":
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      default:
        return 0;
    }
  });

  const handleClientClick = (client: CRMClient) => {
    navigate(`/admin/clientes/${client.id}`);
  };

  const handleStatusFilterClick = (status: string) => {
    setStatusFilter(statusFilter === status ? "all" : status);
  };

  const clearFilters = () => {
    setSearch("");
    setStatusFilter("all");
    setLoyaltyFilter("all");
    setOrigemFilter("all");
  };

  const hasActiveFilters =
    search || statusFilter !== "all" || loyaltyFilter !== "all" || origemFilter !== "all";

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-4 md:p-6 space-y-4">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Users className="h-6 w-6" />
              CRM - Clientes
            </h1>
            <p className="text-muted-foreground">
              {filteredClients.length} de {clients.length} cliente(s)
            </p>
          </div>
          <div className="flex items-center gap-2">
            {/* View Mode Toggle */}
            <div className="flex items-center border rounded-md">
              <Button
                variant={viewMode === "list" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("list")}
                className="rounded-r-none"
              >
                <LayoutList className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "cards" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("cards")}
                className="rounded-none border-x"
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "kanban" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("kanban")}
                className="rounded-l-none"
              >
                <Kanban className="h-4 w-4" />
              </Button>
            </div>
            <Button onClick={() => navigate("/admin/clientes/novo")}>
              <UserPlus className="h-4 w-4 mr-2" />
              Novo Cliente
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <CRMStatsCards
          stats={stats}
          onFilterClick={handleStatusFilterClick}
          activeFilter={statusFilter}
        />

        {/* Filters Row */}
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome, email ou telefone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Loyalty Filter */}
          <Select value={loyaltyFilter} onValueChange={setLoyaltyFilter}>
            <SelectTrigger className="w-full md:w-40">
              <SelectValue placeholder="Fidelidade" />
            </SelectTrigger>
            <SelectContent>
              {loyaltyOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Origem Filter */}
          <Select value={origemFilter} onValueChange={setOrigemFilter}>
            <SelectTrigger className="w-full md:w-40">
              <SelectValue placeholder="Origem" />
            </SelectTrigger>
            <SelectContent>
              {origemOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Sort */}
          <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
            <SelectTrigger className="w-full md:w-40">
              <SelectValue placeholder="Ordenar" />
            </SelectTrigger>
            <SelectContent>
              {sortOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <Button variant="ghost" size="icon" onClick={clearFilters}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Active Filters Badges */}
        {hasActiveFilters && (
          <div className="flex items-center gap-2 flex-wrap">
            <Filter className="h-4 w-4 text-muted-foreground" />
            {statusFilter !== "all" && (
              <Badge variant="secondary" className="gap-1">
                Status: {statusFilter === "followup" ? "Follow-up" : statusFilter}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => setStatusFilter("all")}
                />
              </Badge>
            )}
            {loyaltyFilter !== "all" && (
              <Badge variant="secondary" className="gap-1">
                Fidelidade: {loyaltyFilter}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => setLoyaltyFilter("all")}
                />
              </Badge>
            )}
            {origemFilter !== "all" && (
              <Badge variant="secondary" className="gap-1">
                Origem: {origemFilter}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => setOrigemFilter("all")}
                />
              </Badge>
            )}
          </div>
        )}

        {/* Content */}
        {viewMode === "kanban" ? (
          <CRMKanban clients={sortedClients} onClientClick={handleClientClick} />
        ) : viewMode === "cards" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {sortedClients.map((client) => (
              <CRMClientCard
                key={client.id}
                client={client}
                variant="card"
                onClick={() => handleClientClick(client)}
              />
            ))}
            {sortedClients.length === 0 && (
              <Card className="col-span-full">
                <CardContent className="py-12 text-center">
                  <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                  <p className="text-muted-foreground">Nenhum cliente encontrado</p>
                </CardContent>
              </Card>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {sortedClients.map((client) => (
              <CRMClientCard
                key={client.id}
                client={client}
                variant="list"
                onClick={() => handleClientClick(client)}
              />
            ))}
            {sortedClients.length === 0 && (
              <Card>
                <CardContent className="py-12 text-center">
                  <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                  <p className="text-muted-foreground">Nenhum cliente encontrado</p>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
