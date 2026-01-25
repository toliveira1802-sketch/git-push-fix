import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Skeleton } from '@/components/ui/skeleton'
import { supabase } from '@/integrations/supabase/client'
import { Search, Filter, ChevronRight, CalendarIcon, X, AlertTriangle, FileText, Clock, CheckCircle, XCircle, DollarSign, Loader2 } from 'lucide-react'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface ServiceOrderRow {
  id: string;
  order_number: string;
  status: string;
  total: number | null;
  created_at: string;
  completed_at: string | null;
  problem_description: string | null;
  vehicles: {
    plate: string;
    brand: string;
    model: string;
  };
  clients: {
    name: string;
    phone: string;
  };
}

const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  diagnostico: { label: 'Diagnóstico', variant: 'outline' },
  orcamento: { label: 'Orçamento', variant: 'secondary' },
  aguardando_aprovacao: { label: 'Aguardando Aprovação', variant: 'outline' },
  aguardando_peca: { label: 'Aguardando Peça', variant: 'outline' },
  em_execucao: { label: 'Em Execução', variant: 'default' },
  em_teste: { label: 'Em Teste', variant: 'default' },
  pronto: { label: 'Pronto', variant: 'default' },
  entregue: { label: 'Entregue', variant: 'secondary' },
}

type FilterStatus = 'all' | 'ativas' | 'entregue'

export default function OrdensServico() {
  const navigate = useNavigate()
  const location = useLocation()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<FilterStatus>('all')
  const [startDate, setStartDate] = useState<Date | undefined>()
  const [endDate, setEndDate] = useState<Date | undefined>()
  const [orders, setOrders] = useState<ServiceOrderRow[]>([])
  const [loading, setLoading] = useState(true)

  // Fetch all orders from database
  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true)
      try {
        const { data, error } = await supabase
          .from('service_orders')
          .select(`
            id,
            order_number,
            status,
            total,
            created_at,
            completed_at,
            problem_description,
            vehicles!inner(plate, brand, model),
            clients!inner(name, phone)
          `)
          .order('created_at', { ascending: false })

        if (error) throw error
        setOrders((data as unknown as ServiceOrderRow[]) || [])
      } catch (error) {
        console.error('Error fetching orders:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchOrders()
  }, [])

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.order_number.toLowerCase().includes(search.toLowerCase()) ||
      order.vehicles?.plate.toLowerCase().includes(search.toLowerCase()) ||
      order.clients?.name?.toLowerCase().includes(search.toLowerCase())

    // Status filter logic
    let matchesStatus = true
    if (statusFilter === 'ativas') {
      matchesStatus = order.status !== 'entregue'
    } else if (statusFilter === 'entregue') {
      matchesStatus = order.status === 'entregue'
    }

    // Date filter logic
    const orderDate = new Date(order.created_at)
    const matchesStartDate = !startDate || orderDate >= startDate
    const matchesEndDate = !endDate || orderDate <= new Date(endDate.setHours(23, 59, 59, 999))

    return matchesSearch && matchesStatus && matchesStartDate && matchesEndDate
  })

  const statusFilters: { value: FilterStatus; label: string }[] = [
    { value: 'all', label: 'Todas' },
    { value: 'ativas', label: 'Ativas' },
    { value: 'entregue', label: 'Histórico' },
  ]

  const basePath = location.pathname.includes('/gestao') ? '/gestao' : '/admin'

  const clearDateFilter = () => {
    setStartDate(undefined)
    setEndDate(undefined)
  }

  // Calculate summary stats
  const totalOrders = orders.length
  const activeOrders = orders.filter(o => o.status !== 'entregue').length
  const deliveredOrders = orders.filter(o => o.status === 'entregue').length
  const totalRevenue = orders
    .filter(o => o.status === 'entregue')
    .reduce((sum, o) => sum + (o.total || 0), 0)

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Card className="bg-card border">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                <FileText className="h-4 w-4" />
                Total
              </div>
              <p className="text-2xl font-bold">{loading ? '-' : totalOrders}</p>
            </CardContent>
          </Card>

          <Card className="bg-blue-500/10 border-blue-500/30">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 text-sm mb-1">
                <Clock className="h-4 w-4" />
                Ativas
              </div>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{loading ? '-' : activeOrders}</p>
            </CardContent>
          </Card>

          <Card className="bg-emerald-500/10 border-emerald-500/30">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-sm mb-1">
                <CheckCircle className="h-4 w-4" />
                Entregues
              </div>
              <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{loading ? '-' : deliveredOrders}</p>
            </CardContent>
          </Card>

          <Card className="bg-primary/10 border-primary/30">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-primary text-sm mb-1">
                <DollarSign className="h-4 w-4" />
                Faturado
              </div>
              <p className="text-2xl font-bold text-primary">{loading ? '-' : formatCurrency(totalRevenue)}</p>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por número, placa ou cliente..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Filters Row */}
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Status Filters */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0">
            <Filter className="h-4 w-4 text-muted-foreground shrink-0" />
            {statusFilters.map((filter) => (
              <Button
                key={filter.value}
                variant={statusFilter === filter.value ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter(filter.value)}
                className="shrink-0"
              >
                {filter.label}
              </Button>
            ))}
          </div>

          {/* Date Filters */}
          <div className="flex items-center gap-2 ml-auto">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <CalendarIcon className="h-4 w-4" />
                  {startDate ? format(startDate, 'dd/MM/yy', { locale: ptBR }) : 'De'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <Calendar
                  mode="single"
                  selected={startDate}
                  onSelect={setStartDate}
                  locale={ptBR}
                  initialFocus
                />
              </PopoverContent>
            </Popover>

            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <CalendarIcon className="h-4 w-4" />
                  {endDate ? format(endDate, 'dd/MM/yy', { locale: ptBR }) : 'Até'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <Calendar
                  mode="single"
                  selected={endDate}
                  onSelect={setEndDate}
                  locale={ptBR}
                  initialFocus
                />
              </PopoverContent>
            </Popover>

            {(startDate || endDate) && (
              <Button variant="ghost" size="sm" onClick={clearDateFilter}>
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Results count */}
        <p className="text-sm text-muted-foreground">
          {filteredOrders.length} ordem(ns) encontrada(s)
        </p>

        {/* Orders List */}
        <div className="space-y-3">
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-5 w-32" />
                      <Skeleton className="h-4 w-48" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                    <Skeleton className="h-6 w-20" />
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            filteredOrders.map((order) => {
              const status = statusConfig[order.status] || { label: order.status, variant: 'outline' as const }

              return (
                <Card 
                  key={order.id} 
                  className="hover:bg-accent/50 transition-colors cursor-pointer"
                  onClick={() => navigate(`${basePath}/os/${order.id}`)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="font-bold font-mono">{order.order_number}</span>
                          <Badge variant={status.variant}>{status.label}</Badge>
                        </div>
                        {order.vehicles && (
                          <p className="text-sm">
                            {order.vehicles.brand} {order.vehicles.model} • <span className="font-mono">{order.vehicles.plate}</span>
                          </p>
                        )}
                        {order.clients && (
                          <p className="text-sm text-muted-foreground">{order.clients.name}</p>
                        )}
                        <p className="text-xs text-muted-foreground mt-1">
                          {order.status === 'entregue' && order.completed_at 
                            ? `Entregue em ${formatDate(order.completed_at)}`
                            : `Criada em ${formatDate(order.created_at)}`
                          }
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg">{formatCurrency(order.total || 0)}</p>
                        <ChevronRight className="h-5 w-5 text-muted-foreground ml-auto" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })
          )}

          {!loading && filteredOrders.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center">
                <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                <p className="text-muted-foreground">Nenhuma ordem de serviço encontrada</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </AdminLayout>
  )
}
