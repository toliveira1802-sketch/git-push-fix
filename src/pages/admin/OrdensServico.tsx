import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { mockServiceOrders, getVehicleById, getUserById, OrderStatus } from '@/lib/mock-data'
import { formatCurrency, formatDate } from '@/lib/utils'
import { ClipboardList, Search, Filter, ChevronRight, CalendarIcon, X, AlertTriangle } from 'lucide-react'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

const statusConfig: Record<OrderStatus, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  open: { label: 'Aberta', variant: 'secondary' },
  in_progress: { label: 'Em andamento', variant: 'default' },
  waiting_parts: { label: 'Aguardando peças', variant: 'outline' },
  waiting_approval: { label: 'Aguardando aprovação', variant: 'outline' },
  completed: { label: 'Fechada', variant: 'default' },
  cancelled: { label: 'Cancelada', variant: 'destructive' },
}

type FilterStatus = 'all' | 'open' | 'completed' | 'cancelled'

export default function OrdensServico() {
  const navigate = useNavigate()
  const location = useLocation()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<FilterStatus>('all')
  const [startDate, setStartDate] = useState<Date | undefined>()
  const [endDate, setEndDate] = useState<Date | undefined>()

  // Mock data for orders with non-approved items
  const ordersWithRejectedItems = ['os-2', 'os-4'] // IDs of orders that had rejected items

  const filteredOrders = mockServiceOrders.filter((order) => {
    const vehicle = getVehicleById(order.vehicle_id)
    const user = getUserById(order.user_id)

    const matchesSearch =
      order.order_number.toLowerCase().includes(search.toLowerCase()) ||
      vehicle?.plate.toLowerCase().includes(search.toLowerCase()) ||
      user?.full_name?.toLowerCase().includes(search.toLowerCase())

    // Status filter logic
    let matchesStatus = true
    if (statusFilter === 'open') {
      matchesStatus = ['open', 'in_progress', 'waiting_parts', 'waiting_approval'].includes(order.status)
    } else if (statusFilter === 'completed') {
      matchesStatus = order.status === 'completed'
    } else if (statusFilter === 'cancelled') {
      matchesStatus = order.status === 'cancelled'
    }

    // Date filter logic
    const orderDate = new Date(order.created_at)
    const matchesStartDate = !startDate || orderDate >= startDate
    const matchesEndDate = !endDate || orderDate <= new Date(endDate.setHours(23, 59, 59, 999))

    return matchesSearch && matchesStatus && matchesStartDate && matchesEndDate
  })

  const statusFilters: { value: FilterStatus; label: string }[] = [
    { value: 'all', label: 'Todas' },
    { value: 'open', label: 'Abertas' },
    { value: 'completed', label: 'Fechadas' },
    { value: 'cancelled', label: 'Canceladas' },
  ]

  const basePath = location.pathname.includes('/gestao') ? '/gestao' : '/admin'

  const clearDateFilter = () => {
    setStartDate(undefined)
    setEndDate(undefined)
  }

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <ClipboardList className="h-6 w-6" />
            Histórico de Ordens de Serviço
          </h1>
          <p className="text-muted-foreground">
            {filteredOrders.length} ordem(ns) encontrada(s)
          </p>
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

        {/* Orders List */}
        <div className="space-y-3">
          {filteredOrders.map((order) => {
            const vehicle = getVehicleById(order.vehicle_id)
            const user = getUserById(order.user_id)
            const status = statusConfig[order.status]
            const hasRejectedItems = ordersWithRejectedItems.includes(order.id)

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
                        <span className="font-bold">{order.order_number}</span>
                        <Badge variant={status.variant}>{status.label}</Badge>
                        {hasRejectedItems && (
                          <Badge variant="outline" className="gap-1 border-amber-500 text-amber-600 bg-amber-50">
                            <AlertTriangle className="h-3 w-3" />
                            Item não aprovado
                          </Badge>
                        )}
                      </div>
                      {vehicle && (
                        <p className="text-sm">
                          {vehicle.brand} {vehicle.model} • {vehicle.plate}
                        </p>
                      )}
                      {user && (
                        <p className="text-sm text-muted-foreground">{user.full_name}</p>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">
                        Criada em {formatDate(order.created_at)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg">{formatCurrency(order.total)}</p>
                      <ChevronRight className="h-5 w-5 text-muted-foreground ml-auto" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}

          {filteredOrders.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center">
                <ClipboardList className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                <p className="text-muted-foreground">Nenhuma ordem de serviço encontrada</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </AdminLayout>
  )
}
