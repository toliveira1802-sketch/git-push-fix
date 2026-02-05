import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { 
  Car, 
  Wrench, 
  CheckCircle, 
  Clock,
  FileText,
  ChevronRight,
  AlertCircle,
  Calendar,
  LogOut,
  User
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface VehicleData {
  id: string;
  plate: string;
  model: string;
  brand: string;
  year: number | null;
  color: string | null;
}

interface ServiceOrderData {
  id: string;
  order_number: string;
  status: string;
  created_at: string;
  total: number | null;
  problem_description: string | null;
  diagnosis: string | null;
  estimated_completion: string | null;
}

interface ClientData {
  id: string;
  name: string;
  email: string | null;
  phone: string;
}

export default function MinhaGaragem() {
  const [, setLocation] = useLocation();
  const { user, signOut } = useAuth();
  const [clientData, setClientData] = useState<ClientData | null>(null);
  const [vehicles, setVehicles] = useState<VehicleData[]>([]);
  const [activeOrders, setActiveOrders] = useState<ServiceOrderData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchClientData();
    }
  }, [user]);

  const fetchClientData = async () => {
    if (!user) return;

    try {
      // Fetch client data linked to user
      const { data: client, error: clientError } = await supabase
        .from('clientes')
        .select('id, name, email, phone')
        .eq('user_id', user.id)
        .single();

      if (clientError || !client) {
        console.error('Cliente não encontrado:', clientError);
        setIsLoading(false);
        return;
      }

      setClientData(client);

      // Fetch vehicles for this client
      const { data: vehiclesData, error: vehiclesError } = await supabase
        .from('veiculos')
        .select('id, plate, model, brand, year, color')
        .eq('client_id', client.id)
        .eq('is_active', true);

      if (!vehiclesError && vehiclesData) {
        setVehicles(vehiclesData);
      }

      // Fetch active service orders for this client
      const { data: ordersData, error: ordersError } = await supabase
        .from('ordens_servico')
        .select('id, order_number, status, created_at, total, problem_description, diagnosis, estimated_completion')
        .eq('client_id', client.id)
        .in('status', ['aberta', 'em_andamento', 'orcamento_enviado', 'orcamento_aprovado', 'em_execucao', 'aguardando_peca'])
        .order('created_at', { ascending: false });

      if (!ordersError && ordersData) {
        setActiveOrders(ordersData);
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    await signOut();
    toast.success('Logout realizado com sucesso!');
    setLocation('/login');
  };

  const getStatusProgress = (status: string): number => {
    switch (status) {
      case 'aberta': return 10;
      case 'em_andamento': return 25;
      case 'orcamento_enviado': return 40;
      case 'orcamento_aprovado': return 55;
      case 'aguardando_peca': return 65;
      case 'em_execucao': return 80;
      case 'finalizada': return 95;
      case 'entregue': return 100;
      default: return 0;
    }
  };

  const getStatusLabel = (status: string): string => {
    switch (status) {
      case 'aberta': return 'Aguardando Análise';
      case 'em_andamento': return 'Em Análise';
      case 'orcamento_enviado': return 'Orçamento Enviado';
      case 'orcamento_aprovado': return 'Orçamento Aprovado';
      case 'aguardando_peca': return 'Aguardando Peça';
      case 'em_execucao': return 'Em Execução';
      case 'finalizada': return 'Finalizado';
      case 'entregue': return 'Entregue';
      default: return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'aberta': return 'text-blue-400';
      case 'em_andamento': return 'text-amber-400';
      case 'orcamento_enviado': return 'text-purple-400';
      case 'orcamento_aprovado': return 'text-emerald-400';
      case 'aguardando_peca': return 'text-orange-400';
      case 'em_execucao': return 'text-cyan-400';
      default: return 'text-muted-foreground';
    }
  };

  const formatCurrency = (value: number | null) => {
    if (!value) return '-';
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center">
                <Car className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-lg">Minha Garagem</h1>
                <p className="text-xs text-muted-foreground">
                  Olá, {clientData?.name || 'Cliente'}
                </p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={handleLogout}>
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Welcome Card */}
        <Card className="glass-card border-primary/20">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center">
                <User className="w-7 h-7 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-bold">{clientData?.name}</h2>
                <p className="text-sm text-muted-foreground">{clientData?.email}</p>
                <p className="text-sm text-muted-foreground">{clientData?.phone}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Active Orders Section */}
        {activeOrders.length > 0 && (
          <section className="space-y-3">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Wrench className="w-5 h-5 text-primary" />
              Serviços em Andamento
            </h3>

            {activeOrders.map((order) => (
              <Card 
                key={order.id} 
                className="glass-card cursor-pointer hover:border-primary/50 transition-colors"
                onClick={() => setLocation(`/cliente/orcamento/${order.id}`)}
              >
                <CardContent className="pt-4 space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <Badge className="bg-primary/20 text-primary border-0">
                        OS {order.order_number}
                      </Badge>
                      <p className={`text-sm font-medium mt-2 ${getStatusColor(order.status)}`}>
                        {getStatusLabel(order.status)}
                      </p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground" />
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Progresso</span>
                      <span>{getStatusProgress(order.status)}%</span>
                    </div>
                    <Progress value={getStatusProgress(order.status)} className="h-2" />
                  </div>

                  {/* Order Details */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Entrada</p>
                      <p className="font-medium">{formatDate(order.created_at)}</p>
                    </div>
                    {order.estimated_completion && (
                      <div>
                        <p className="text-muted-foreground">Previsão</p>
                        <p className="font-medium">{formatDate(order.estimated_completion)}</p>
                      </div>
                    )}
                    {order.total && (
                      <div>
                        <p className="text-muted-foreground">Valor Total</p>
                        <p className="font-medium text-emerald-400">{formatCurrency(order.total)}</p>
                      </div>
                    )}
                  </div>

                  {/* Problem Description */}
                  {order.problem_description && (
                    <div className="p-3 bg-muted/50 rounded-lg">
                      <p className="text-xs text-muted-foreground mb-1">Problema Relatado</p>
                      <p className="text-sm">{order.problem_description}</p>
                    </div>
                  )}

                  {/* Pending Approval Button */}
                  {order.status === 'orcamento_enviado' && (
                    <Button 
                      className="w-full gradient-primary"
                      onClick={(e) => {
                        e.stopPropagation();
                        setLocation(`/cliente/orcamento/${order.id}`);
                      }}
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Ver e Aprovar Orçamento
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </section>
        )}

        {/* Vehicles Section */}
        <section className="space-y-3">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Car className="w-5 h-5 text-primary" />
            Meus Veículos
          </h3>

          {vehicles.length === 0 ? (
            <Card className="glass-card">
              <CardContent className="py-8 text-center">
                <Car className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground">Nenhum veículo cadastrado</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-3">
              {vehicles.map((vehicle) => (
                <Card key={vehicle.id} className="glass-card">
                  <CardContent className="py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center">
                        <Car className="w-6 h-6 text-muted-foreground" />
                      </div>
                      <div className="flex-1">
                        <p className="font-bold">{vehicle.brand} {vehicle.model}</p>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                          <span className="font-mono font-bold">{vehicle.plate}</span>
                          {vehicle.year && <span>{vehicle.year}</span>}
                          {vehicle.color && <span>{vehicle.color}</span>}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>

        {/* No Active Orders Message */}
        {activeOrders.length === 0 && (
          <Card className="glass-card border-emerald-500/20">
            <CardContent className="py-8 text-center">
              <CheckCircle className="w-12 h-12 mx-auto text-emerald-500 mb-3" />
              <p className="font-medium text-emerald-400">Tudo em dia!</p>
              <p className="text-sm text-muted-foreground mt-1">
                Você não tem nenhum serviço em andamento
              </p>
            </CardContent>
          </Card>
        )}

        {/* Quick Actions */}
        <section className="space-y-3">
          <h3 className="text-lg font-semibold">Ações Rápidas</h3>
          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" className="h-auto py-4 flex-col gap-2">
              <Calendar className="w-5 h-5" />
              <span className="text-xs">Agendar Serviço</span>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex-col gap-2">
              <FileText className="w-5 h-5" />
              <span className="text-xs">Histórico</span>
            </Button>
          </div>
        </section>
      </main>
    </div>
  );
}
