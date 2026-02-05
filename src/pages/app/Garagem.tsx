import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Car, 
  Wrench, 
  Clock,
  CheckCircle2,
  User,
  LogOut,
  Plus,
  History,
  FileText
} from 'lucide-react';

interface Vehicle {
  id: string;
  brand: string;
  model: string;
  plate: string;
  year: number | null;
  color: string | null;
  km: number | null;
}

interface ServiceOrder {
  id: string;
  order_number: string;
  status: string;
  problem_description: string | null;
  total: number | null;
  created_at: string;
  vehicle: {
    brand: string;
    model: string;
    plate: string;
  };
}

export default function ClienteGaragem() {
  const { user, signOut } = useAuth();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [activeOrders, setActiveOrders] = useState<ServiceOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState('Cliente');
  const [clientId, setClientId] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      try {
        // Buscar nome do usuário
        const { data: profile } = await supabase
          .from('colaboradores')
          .select('full_name')
          .eq('user_id', user.id)
          .single();
        
        if (profile?.full_name) {
          setUserName(profile.full_name);
        }

        // Buscar cliente vinculado ao user
        const { data: cliente } = await supabase
          .from('clientes')
          .select('id, name')
          .eq('user_id', user.id)
          .single();

        if (cliente) {
          setClientId(cliente.id);
          if (cliente.name) setUserName(cliente.name);

          // Buscar veículos do cliente
          const { data: veiculos } = await supabase
            .from('veiculos')
            .select('*')
            .eq('client_id', cliente.id)
            .eq('is_active', true);

          setVehicles(veiculos || []);

          // Buscar OS ativas
          const { data: orders } = await supabase
            .from('ordens_servico')
            .select(`
              id,
              order_number,
              status,
              problem_description,
              total,
              created_at,
              veiculos!inner (brand, model, plate)
            `)
            .eq('client_id', cliente.id)
            .not('status', 'in', '("entregue","cancelada")')
            .order('created_at', { ascending: false });

          const formattedOrders = (orders || []).map((o: any) => ({
            id: o.id,
            order_number: o.order_number,
            status: o.status,
            problem_description: o.problem_description,
            total: o.total,
            created_at: o.created_at,
            vehicle: {
              brand: o.veiculos?.brand || '',
              model: o.veiculos?.model || '',
              plate: o.veiculos?.plate || '',
            },
          }));

          setActiveOrders(formattedOrders);
        }
      } catch (error) {
        console.error('Erro ao buscar dados:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const handleLogout = async () => {
    await signOut();
    window.location.href = '/login';
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
      'aguardando_diagnostico': { label: 'Aguardando Diagnóstico', variant: 'secondary' },
      'orcamento_pendente': { label: 'Orçamento Pendente', variant: 'outline' },
      'orcamento_aprovado': { label: 'Aprovado', variant: 'default' },
      'em_execucao': { label: 'Em Execução', variant: 'default' },
      'aguardando_peca': { label: 'Aguardando Peça', variant: 'secondary' },
      'pronto': { label: 'Pronto', variant: 'default' },
    };

    const config = statusMap[status] || { label: status, variant: 'outline' as const };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const formatCurrency = (value: number | null) => {
    if (!value) return '-';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
              <Car className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-bold text-xl">Doctor Auto Prime</h1>
              <p className="text-sm text-muted-foreground">Minha Garagem</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium">{userName}</span>
            </div>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Seção de OS Ativas */}
        {activeOrders.length > 0 && (
          <section className="mb-8">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Wrench className="w-5 h-5 text-primary" />
              Serviços em Andamento
            </h2>
            
            <div className="grid gap-4">
              {activeOrders.map((order) => (
                <Card key={order.id} className="border-l-4 border-l-primary">
                  <CardContent className="pt-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-mono font-bold text-lg">
                            OS #{order.order_number}
                          </span>
                          {getStatusBadge(order.status)}
                        </div>
                        <p className="text-muted-foreground">
                          {order.vehicle.brand} {order.vehicle.model} - {order.vehicle.plate}
                        </p>
                        {order.problem_description && (
                          <p className="text-sm mt-2">{order.problem_description}</p>
                        )}
                      </div>
                      
                      <div className="text-right">
                        {order.total && (
                          <p className="text-xl font-bold text-primary">
                            {formatCurrency(order.total)}
                          </p>
                        )}
                        <Button variant="outline" size="sm" className="mt-2">
                          <FileText className="w-4 h-4 mr-2" />
                          Ver Detalhes
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* Seção de Veículos */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Car className="w-5 h-5 text-primary" />
              Meus Veículos
            </h2>
            <Button variant="outline" size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Veículo
            </Button>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="pt-6">
                    <div className="h-20 bg-muted rounded"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : vehicles.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Car className="w-12 h-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Nenhum veículo cadastrado</h3>
                <p className="text-muted-foreground text-center mb-4">
                  Adicione seu primeiro veículo para acompanhar serviços.
                </p>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Veículo
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {vehicles.map((vehicle) => (
                <Card key={vehicle.id} className="hover:border-primary/50 transition-colors cursor-pointer">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center justify-between">
                      <span className="text-lg">
                        {vehicle.brand} {vehicle.model}
                      </span>
                      <Badge variant="outline">{vehicle.year || 'N/A'}</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Placa:</span>
                        <span className="font-mono font-bold">{vehicle.plate}</span>
                      </div>
                      {vehicle.color && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Cor:</span>
                          <span>{vehicle.color}</span>
                        </div>
                      )}
                      {vehicle.km && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">KM:</span>
                          <span>{vehicle.km.toLocaleString('pt-BR')} km</span>
                        </div>
                      )}
                    </div>
                    
                    <Button variant="ghost" size="sm" className="w-full mt-4">
                      <History className="w-4 h-4 mr-2" />
                      Ver Histórico
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
