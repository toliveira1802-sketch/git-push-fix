import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Bell,
  UserPlus,
  Check,
  X,
  Phone,
  Mail,
  Calendar,
  Gift,
  Loader2,
  RefreshCw,
  CheckCheck,
  Users
} from 'lucide-react';

interface PendingClient {
  id: string;
  name: string;
  email: string | null;
  phone: string;
  created_at: string;
  registration_source: string;
}

export default function GestaoNotificacoes() {
  const [pendingClients, setPendingClients] = useState<PendingClient[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const fetchPendingClients = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('clients')
      .select('id, name, email, phone, created_at, registration_source')
      .eq('pending_review', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao buscar clientes pendentes:', error);
      toast.error('Erro ao carregar notificações');
    } else {
      setPendingClients(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchPendingClients();

    // Configurar realtime para atualizações
    const channel = supabase
      .channel('pending-clients')
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
      console.error(error);
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
      console.error(error);
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
      console.error(error);
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
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Bell className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Notificações</h1>
              <p className="text-muted-foreground text-sm">
                Novos cadastros e ações pendentes
              </p>
            </div>
          </div>

          <Button
            variant="outline"
            size="icon"
            onClick={fetchPendingClients}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>

        {/* Novos Cadastros Section */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UserPlus className="h-5 w-5 text-blue-500" />
                <CardTitle className="text-lg">Novos Auto-Cadastros</CardTitle>
                {pendingClients.length > 0 && (
                  <Badge variant="destructive" className="ml-2">
                    {pendingClients.length}
                  </Badge>
                )}
              </div>
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
      </div>
    </AdminLayout>
  );
}
