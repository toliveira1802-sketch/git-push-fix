import { useState } from "react";
import { useLocation } from "wouter";
import { ArrowLeft, Search, Plus, Activity, FileText, Clock, Wrench, CheckCircle } from "lucide-react";
import { AdminLayout } from "@/components/AdminLayout";

// Mock data
const ordensServicoMock = [
  { id: 1, numeroOs: 'OS-0001', placa: 'ABC-1234', veiculo: 'Honda Civic 2020', cliente: 'João Silva', telefone: '(11) 99999-1234', status: 'diagnostico', dataEntrada: '02/02/2026', km: 45000, valorOrcado: 0, valorAprovado: 0, descricao: 'Revisão completa 40.000km', progresso: 10 },
  { id: 2, numeroOs: 'OS-0002', placa: 'DEF-5678', veiculo: 'Hyundai HB20 2021', cliente: 'Maria Santos', telefone: '(11) 98888-5678', status: 'orcamento', dataEntrada: '01/02/2026', km: 28500, valorOrcado: 850, valorAprovado: 0, descricao: 'Troca de pastilhas e discos', progresso: 25 },
  { id: 3, numeroOs: 'OS-0003', placa: 'GHI-9012', veiculo: 'VW Polo 2022', cliente: 'Pedro Lima', telefone: '(11) 97777-9012', status: 'aguardando_aprovacao', dataEntrada: '31/01/2026', km: 15200, valorOrcado: 2200, valorAprovado: 0, descricao: 'Suspensão dianteira', progresso: 30 },
  { id: 4, numeroOs: 'OS-0004', placa: 'JKL-3456', veiculo: 'Chevrolet Onix 2019', cliente: 'Ana Costa', telefone: '(11) 96666-3456', status: 'em_execucao', dataEntrada: '30/01/2026', km: 58200, valorOrcado: 3500, valorAprovado: 2800, descricao: 'Motor falhando', progresso: 65 },
  { id: 5, numeroOs: 'OS-0005', placa: 'MNO-7890', veiculo: 'Jeep Compass 2023', cliente: 'Carlos Souza', telefone: '(11) 95555-7890', status: 'concluido', dataEntrada: '28/01/2026', km: 12500, valorOrcado: 650, valorAprovado: 650, descricao: 'Diagnóstico eletrônico', progresso: 100 },
  { id: 6, numeroOs: 'OS-0006', placa: 'XYZ-9876', veiculo: 'Toyota Corolla 2018', cliente: 'João Silva', telefone: '(11) 99999-1234', status: 'entregue', dataEntrada: '25/01/2026', km: 72500, valorOrcado: 1200, valorAprovado: 1200, descricao: 'Correia dentada', progresso: 100 },
];

const statusConfig: Record<string, { label: string; color: string; bgSolid: string; icon: React.ElementType }> = {
  diagnostico: { label: 'Diagnóstico', color: 'bg-blue-500/10 text-blue-400 border-blue-500/30', bgSolid: 'bg-blue-500', icon: Activity },
  orcamento: { label: 'Orçamento', color: 'bg-purple-500/10 text-purple-400 border-purple-500/30', bgSolid: 'bg-purple-500', icon: FileText },
  aguardando_aprovacao: { label: 'Aguard. Aprovação', color: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30', bgSolid: 'bg-yellow-500', icon: Clock },
  em_execucao: { label: 'Em Execução', color: 'bg-orange-500/10 text-orange-400 border-orange-500/30', bgSolid: 'bg-orange-500', icon: Wrench },
  concluido: { label: 'Concluído', color: 'bg-green-500/10 text-green-400 border-green-500/30', bgSolid: 'bg-green-500', icon: CheckCircle },
  entregue: { label: 'Entregue', color: 'bg-slate-500/10 text-slate-400 border-slate-500/30', bgSolid: 'bg-slate-500', icon: CheckCircle },
};

export default function AdminOrdensServico() {
  const [, setLocation] = useLocation();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('todos');

  const list = ordensServicoMock.filter(os => 
    (os.placa.toLowerCase().includes(search.toLowerCase()) || 
     os.cliente.toLowerCase().includes(search.toLowerCase())) && 
    (filter === 'todos' || os.status === filter)
  );

  return (
    <AdminLayout>
      <div className="flex-1 flex flex-col bg-slate-950">
        {/* Header */}
        <header className="h-12 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <button onClick={() => setLocation('/admin')} className="text-slate-400 hover:text-white">
              <ArrowLeft className="h-4 w-4" />
            </button>
            <h1 className="text-white font-semibold text-sm">Ordens de Serviço</h1>
          </div>
          <button 
            onClick={() => setLocation('/admin/nova-os')} 
            className="bg-red-600 text-white px-2 py-1 rounded-lg text-xs flex items-center gap-1 hover:bg-red-500"
          >
            <Plus className="w-3 h-3" /> Nova
          </button>
        </header>

        {/* Content */}
        <div className="flex-1 p-4 overflow-auto">
          {/* Filtros */}
          <div className="flex gap-2 mb-3">
            <div className="flex-1 max-w-xs flex items-center gap-2 px-2 py-1.5 bg-slate-800 border border-slate-700 rounded-lg">
              <Search className="w-4 h-4 text-slate-400" />
              <input 
                value={search} 
                onChange={e => setSearch(e.target.value)} 
                className="flex-1 bg-transparent text-white outline-none text-sm" 
                placeholder="Buscar..." 
              />
            </div>
            <select 
              value={filter} 
              onChange={e => setFilter(e.target.value)} 
              className="bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-white text-xs"
            >
              <option value="todos">Todos</option>
              {Object.entries(statusConfig).map(([k, v]) => (
                <option key={k} value={k}>{v.label}</option>
              ))}
            </select>
          </div>

          {/* Tabela */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-800">
                  <th className="text-left text-xs text-slate-400 px-3 py-2">OS</th>
                  <th className="text-left text-xs text-slate-400 px-3 py-2">Veículo</th>
                  <th className="text-left text-xs text-slate-400 px-3 py-2">Cliente</th>
                  <th className="text-left text-xs text-slate-400 px-3 py-2">Status</th>
                  <th className="text-right text-xs text-slate-400 px-3 py-2">Valor</th>
                </tr>
              </thead>
              <tbody>
                {list.map(os => {
                  const c = statusConfig[os.status] || statusConfig.diagnostico;
                  return (
                    <tr 
                      key={os.id} 
                      onClick={() => setLocation(`/admin/os/${os.id}`)} 
                      className="border-b border-slate-800 hover:bg-slate-800/50 cursor-pointer"
                    >
                      <td className="px-3 py-2 text-white font-mono">{os.numeroOs}</td>
                      <td className="px-3 py-2">
                        <p className="text-white font-bold">{os.placa}</p>
                        <p className="text-slate-400 text-xs">{os.veiculo}</p>
                      </td>
                      <td className="px-3 py-2 text-white">{os.cliente}</td>
                      <td className="px-3 py-2">
                        <span className={`text-xs px-2 py-0.5 rounded-full border ${c.color}`}>
                          {c.label}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-right text-green-400 font-semibold">
                        R$ {os.valorAprovado.toLocaleString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {list.length === 0 && (
              <div className="p-8 text-center text-slate-500">
                Nenhuma OS encontrada
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
