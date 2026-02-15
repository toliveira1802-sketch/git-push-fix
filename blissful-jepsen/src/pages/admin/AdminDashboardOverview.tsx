import { useLocation } from "wouter";
import { ArrowLeft, Activity, FileText, Clock, Wrench, CheckCircle } from "lucide-react";
import { AdminLayout } from "@/components/AdminLayout";

// Mock data
const ordensServicoMock = [
  { id: 1, numeroOs: 'OS-0001', placa: 'ABC-1234', veiculo: 'Honda Civic 2020', cliente: 'João Silva', status: 'diagnostico', progresso: 10 },
  { id: 2, numeroOs: 'OS-0002', placa: 'DEF-5678', veiculo: 'Hyundai HB20 2021', cliente: 'Maria Santos', status: 'orcamento', progresso: 25 },
  { id: 3, numeroOs: 'OS-0003', placa: 'GHI-9012', veiculo: 'VW Polo 2022', cliente: 'Pedro Lima', status: 'aguardando_aprovacao', progresso: 30 },
  { id: 4, numeroOs: 'OS-0004', placa: 'JKL-3456', veiculo: 'Chevrolet Onix 2019', cliente: 'Ana Costa', status: 'em_execucao', progresso: 65 },
  { id: 5, numeroOs: 'OS-0005', placa: 'MNO-7890', veiculo: 'Jeep Compass 2023', cliente: 'Carlos Souza', status: 'concluido', progresso: 100 },
];

const statusConfig: Record<string, { label: string; color: string; bgSolid: string; icon: React.ElementType }> = {
  diagnostico: { label: 'Diagnóstico', color: 'bg-blue-500/10 text-blue-400 border-blue-500/30', bgSolid: 'bg-blue-500', icon: Activity },
  orcamento: { label: 'Orçamento', color: 'bg-purple-500/10 text-purple-400 border-purple-500/30', bgSolid: 'bg-purple-500', icon: FileText },
  aguardando_aprovacao: { label: 'Aguard. Aprovação', color: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30', bgSolid: 'bg-yellow-500', icon: Clock },
  em_execucao: { label: 'Em Execução', color: 'bg-orange-500/10 text-orange-400 border-orange-500/30', bgSolid: 'bg-orange-500', icon: Wrench },
  concluido: { label: 'Concluído', color: 'bg-green-500/10 text-green-400 border-green-500/30', bgSolid: 'bg-green-500', icon: CheckCircle },
  entregue: { label: 'Entregue', color: 'bg-slate-500/10 text-slate-400 border-slate-500/30', bgSolid: 'bg-slate-500', icon: CheckCircle },
};

const statusList = Object.entries(statusConfig)
  .filter(([k]) => k !== 'entregue')
  .map(([id, v]) => ({ id, ...v }));

export default function AdminDashboardOverview() {
  const [, setLocation] = useLocation();
  
  const osAtivas = ordensServicoMock.filter(os => !['entregue'].includes(os.status));

  return (
    <AdminLayout>
      <div className="flex-1 flex flex-col bg-slate-950">
        {/* Header */}
        <header className="h-12 bg-slate-900 border-b border-slate-800 flex items-center px-4">
          <button onClick={() => setLocation('/admin')} className="text-slate-400 hover:text-white mr-3">
            <ArrowLeft className="h-4 w-4" />
          </button>
          <h1 className="text-white font-semibold text-sm">Visão Geral</h1>
          <span className="ml-2 w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
        </header>

        {/* Content */}
        <div className="flex-1 p-4 overflow-auto">
          {/* Status Cards */}
          <div className="grid grid-cols-5 gap-3 mb-4">
            {statusList.map(s => (
              <div key={s.id} className="bg-slate-900 border border-slate-800 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <div className={`w-2 h-2 rounded-full ${s.bgSolid}`}></div>
                  <span className="text-xs text-slate-400">{s.label}</span>
                </div>
                <p className="text-xl font-bold text-white">
                  {ordensServicoMock.filter(os => os.status === s.id).length}
                </p>
              </div>
            ))}
          </div>

          {/* Tabela OS em Andamento */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
            <div className="p-3 border-b border-slate-800">
              <h3 className="text-white font-semibold text-sm">OS em Andamento</h3>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-800">
                  <th className="text-left text-xs text-slate-400 px-3 py-2">OS</th>
                  <th className="text-left text-xs text-slate-400 px-3 py-2">Veículo</th>
                  <th className="text-left text-xs text-slate-400 px-3 py-2">Cliente</th>
                  <th className="text-left text-xs text-slate-400 px-3 py-2">Status</th>
                  <th className="text-left text-xs text-slate-400 px-3 py-2">Progresso</th>
                </tr>
              </thead>
              <tbody>
                {osAtivas.map(os => {
                  const c = statusConfig[os.status];
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
                      <td className="px-3 py-2">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1.5 bg-slate-700 rounded-full">
                            <div 
                              className="h-full bg-red-500 rounded-full transition-all" 
                              style={{ width: `${os.progresso}%` }}
                            ></div>
                          </div>
                          <span className="text-xs text-slate-400">{os.progresso}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
