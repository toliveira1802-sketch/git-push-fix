import { useState, useEffect } from "react";
import { useNavigate } from "@/hooks/useNavigate";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { 
  Megaphone, Users, Target, TrendingUp, ArrowLeft, Eye,
  UserPlus, Check, X, Phone, Mail, Calendar, Gift, Loader2, 
  RefreshCw, CheckCheck, Bell
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { NovaPromocaoForm } from "@/components/promocao/NovaPromocaoForm";

interface PendingClient {
  id: string;
  name: string;
  email: string | null;
  phone: string;
  created_at: string;
  registration_source: string;
}

// Mock data
const mockKpis = {
  totalClients: 248,
  newClients: 23,
  promoClicks: 156,
  activePromos: 3,
  conversionRate: 12.5,
  averageTicket: 1890,
  monthlyRevenue: 85000,
  leadCount: 45,
};

const promoStats = [
  { title: "Troca de Óleo 20% OFF", clicks: 89 },
  { title: "Revisão Completa", clicks: 45 },
  { title: "Check-up Grátis", clicks: 22 },
];

const dailyClients = [
  { date: "Seg", count: 5 },
  { date: "Ter", count: 8 },
  { date: "Qua", count: 6 },
  { date: "Qui", count: 12 },
  { date: "Sex", count: 15 },
  { date: "Sáb", count: 10 },
  { date: "Dom", count: 3 },
];

export default function GestaoComercial() {
  const navigate = useNavigate();
  const [kpis] = useState(mockKpis);
  const [pendingClients, setPendingClients] = useState<PendingClient[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("overview");

  const fetchPendingClients = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('clients')
      .select('id, name, email, phone, created_at, registration_source')
      .eq('pending_review', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao buscar clientes pendentes:', error);
    } else {
      setPendingClients(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchPendingClients();

    const channel = supabase
      .channel('pending-clients-comercial')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'clients',
          filter: 'pending_review=eq.true'
        },
        () => {
          fetchPendingClients();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleApprove = async (client: PendingClient) => {
    setProcessingId(client.id);
    
    const { error } = await supabase
      .from('clients')
      .update({
        pending_review: false,
        reviewed_at: new Date().toISOString()
      })
      .eq('id', client.id);

    if (error) {
      toast.error('Erro ao aprovar cliente');
    } else {
      toast.success(`${client.name} foi aprovado!`);
      setPendingClients(prev => prev.filter(c => c.id !== client.id));
    }
    setProcessingId(null);
  };

  const handleReject = async (client: PendingClient) => {
    setProcessingId(client.id);
    
    const { error } = await supabase
      .from('clients')
      .update({
        pending_review: false,
        status: 'inactive',
        reviewed_at: new Date().toISOString()
      })
      .eq('id', client.id);

    if (error) {
      toast.error('Erro ao rejeitar cliente');
    } else {
      toast.success(`Cadastro de ${client.name} foi rejeitado`);
      setPendingClients(prev => prev.filter(c => c.id !== client.id));
    }
    setProcessingId(null);
  };

  const handleApproveAll = async () => {
    if (pendingClients.length === 0) return;

    setLoading(true);
    const { error } = await supabase
      .from('clients')
      .update({
        pending_review: false,
        reviewed_at: new Date().toISOString()
      })
      .eq('pending_review', true);

    if (error) {
      toast.error('Erro ao aprovar todos');
    } else {
      toast.success(`${pendingClients.length} cliente(s) aprovado(s)!`);
      setPendingClients([]);
    }
    setLoading(false);
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  const formatPhone = (phone: string) => {
    const digits = phone.replace(/\D/g, '');
    if (digits.length === 11) {
      return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
    }
    if (digits.length === 10) {
      return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
    }
    return phone;
  };

  return (
    <AdminLayout>
      <div className="p-4 md:p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/gestao")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <Megaphone className="h-6 w-6 text-pink-500" />
                Comercial e Marketing
              </h1>
              <p className="text-muted-foreground">
                Promoções e aquisição de clientes
              </p>
            </div>
          </div>
          {pendingClients.length > 0 && (
            <Badge variant="destructive" className="animate-pulse">
              <Bell className="h-3 w-3 mr-1" />
              {pendingClients.length} pendente(s)
            </Badge>
          )}
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3 max-w-lg">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="promocoes">Nova Promoção</TabsTrigger>
            <TabsTrigger value="notifications" className="relative">
              Novos Cadastros
              {pendingClients.length > 0 && (
                <Badge variant="destructive" className="ml-2 h-5 w-5 p-0 flex items-center justify-center text-xs">
                  {pendingClients.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          {/* Tab: Visão Geral */}
          <TabsContent value="overview" className="space-y-6 mt-6">
            {/* KPIs */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                      <Users className="h-5 w-5 text-blue-500" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{kpis.totalClients}</p>
                      <p className="text-xs text-muted-foreground">Total Clientes</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                      <TrendingUp className="h-5 w-5 text-emerald-500" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">+{kpis.newClients}</p>
                      <p className="text-xs text-muted-foreground">Novos Este Mês</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                      <Target className="h-5 w-5 text-amber-500" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{kpis.conversionRate}%</p>
                      <p className="text-xs text-muted-foreground">Taxa Conversão</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-pink-500/10 flex items-center justify-center">
                      <Megaphone className="h-5 w-5 text-pink-500" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{kpis.activePromos}</p>
                      <p className="text-xs text-muted-foreground">Promoções Ativas</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Gráfico de Novos Clientes */}
            <Card>
              <CardHeader>
                <CardTitle>Novos Clientes por Dia</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={dailyClients}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="date" className="text-xs" />
                      <YAxis className="text-xs" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px"
                        }}
                      />
                      <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Performance das Promoções */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  Performance das Promoções
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {promoStats.map((promo, index) => (
                    <div 
                      key={index}
                      className="flex items-center justify-between p-3 rounded-lg border"
                    >
                      <span className="font-medium">{promo.title}</span>
                      <div className="flex items-center gap-2">
                        <Eye className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">{promo.clicks} cliques</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab: Nova Promoção */}
          <TabsContent value="promocoes" className="mt-6">
            <NovaPromocaoForm onSuccess={() => setActiveTab("overview")} />
          </TabsContent>

          {/* Tab: Novos Cadastros */}
          <TabsContent value="notifications" className="mt-6">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <UserPlus className="h-5 w-5 text-blue-500" />
                    <CardTitle className="text-lg">Auto-Cadastros Pendentes</CardTitle>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={fetchPendingClients}
                      disabled={loading}
                    >
                      <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                    </Button>
                    {pendingClients.length > 1 && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleApproveAll}
                        disabled={loading}
                      >
                        <CheckCheck className="h-4 w-4 mr-2" />
                        Aprovar todos
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : pendingClients.length === 0 ? (
                  <div className="text-center py-12">
                    <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                    <p className="text-muted-foreground">
                      Nenhum cadastro pendente de revisão
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Novos clientes que se cadastrarem pelo app aparecerão aqui
                    </p>
                  </div>
                ) : (
                  <ScrollArea className="max-h-[500px]">
                    <div className="space-y-3">
                      {pendingClients.map((client) => (
                        <Card key={client.id} className="border-l-4 border-l-blue-500">
                          <CardContent className="p-4">
                            <div className="flex items-start gap-4">
                              <Avatar className="h-12 w-12">
                                <AvatarFallback className="bg-blue-500/10 text-blue-500 font-semibold">
                                  {getInitials(client.name)}
                                </AvatarFallback>
                              </Avatar>

                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-bold">{client.name}</span>
                                  <Badge variant="secondary" className="text-xs">
                                    <Gift className="h-3 w-3 mr-1" />
                                    +50 pts
                                  </Badge>
                                </div>

                                <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                                  {client.email && (
                                    <span className="flex items-center gap-1">
                                      <Mail className="h-3 w-3" />
                                      {client.email}
                                    </span>
                                  )}
                                  <span className="flex items-center gap-1">
                                    <Phone className="h-3 w-3" />
                                    {formatPhone(client.phone)}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Calendar className="h-3 w-3" />
                                    {format(new Date(client.created_at), "dd/MM/yy 'às' HH:mm", { locale: ptBR })}
                                  </span>
                                </div>
                              </div>

                              <div className="flex gap-2 shrink-0">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
                                  onClick={() => handleReject(client)}
                                  disabled={processingId === client.id}
                                >
                                  {processingId === client.id ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <X className="h-4 w-4" />
                                  )}
                                </Button>
                                <Button
                                  size="sm"
                                  onClick={() => handleApprove(client)}
                                  disabled={processingId === client.id}
                                >
                                  {processingId === client.id ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <>
                                      <Check className="h-4 w-4 mr-1" />
                                      Aprovar
                                    </>
                                  )}
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
