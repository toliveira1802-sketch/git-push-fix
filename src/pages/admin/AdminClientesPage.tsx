import { useLocation } from "wouter";
import { ArrowLeft } from "lucide-react";
import { AdminLayout } from "@/components/AdminLayout";

// Mock data
const clientesMock = [
  { id: 1, nomeCompleto: 'João Silva', cpf: '123.456.789-00', email: 'joao@email.com', telefone: '(11) 99999-1234', cidade: 'São Paulo', estado: 'SP', totalGasto: 4500 },
  { id: 2, nomeCompleto: 'Maria Santos', cpf: '987.654.321-00', email: 'maria@email.com', telefone: '(11) 98888-5678', cidade: 'São Paulo', estado: 'SP', totalGasto: 2800 },
  { id: 3, nomeCompleto: 'Pedro Lima', cpf: '456.789.123-00', email: 'pedro@email.com', telefone: '(11) 97777-9012', cidade: 'Guarulhos', estado: 'SP', totalGasto: 12500 },
  { id: 4, nomeCompleto: 'Ana Costa', cpf: '321.654.987-00', email: 'ana@email.com', telefone: '(11) 96666-3456', cidade: 'Osasco', estado: 'SP', totalGasto: 950 },
  { id: 5, nomeCompleto: 'Carlos Souza', cpf: '789.123.456-00', email: 'carlos@email.com', telefone: '(11) 95555-7890', cidade: 'São Paulo', estado: 'SP', totalGasto: 18900 },
];

const veiculosMock = [
  { id: 1, clienteId: 1 },
  { id: 2, clienteId: 1 },
  { id: 3, clienteId: 2 },
  { id: 4, clienteId: 3 },
  { id: 5, clienteId: 4 },
  { id: 6, clienteId: 5 },
];

export default function AdminClientesPage() {
  const [, setLocation] = useLocation();

  return (
    <AdminLayout>
      <div className="flex-1 flex flex-col bg-slate-950">
        {/* Header */}
        <header className="h-12 bg-slate-900 border-b border-slate-800 flex items-center px-4">
          <button onClick={() => setLocation('/admin')} className="text-slate-400 hover:text-white mr-3">
            <ArrowLeft className="h-4 w-4" />
          </button>
          <h1 className="text-white font-semibold text-sm">Clientes</h1>
          <span className="ml-2 text-slate-500 text-xs">({clientesMock.length})</span>
        </header>

        {/* Content */}
        <div className="flex-1 p-4 overflow-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-800">
                  <th className="text-left text-xs text-slate-400 px-3 py-2">Nome</th>
                  <th className="text-left text-xs text-slate-400 px-3 py-2">Telefone</th>
                  <th className="text-left text-xs text-slate-400 px-3 py-2">Cidade</th>
                  <th className="text-left text-xs text-slate-400 px-3 py-2">Veículos</th>
                  <th className="text-right text-xs text-slate-400 px-3 py-2">Total</th>
                </tr>
              </thead>
              <tbody>
                {clientesMock.map(c => (
                  <tr 
                    key={c.id} 
                    className="border-b border-slate-800 hover:bg-slate-800/50 cursor-pointer"
                  >
                    <td className="px-3 py-2">
                      <p className="text-white">{c.nomeCompleto}</p>
                      <p className="text-slate-500 text-xs">{c.email}</p>
                    </td>
                    <td className="px-3 py-2 text-slate-300">{c.telefone}</td>
                    <td className="px-3 py-2 text-slate-300">{c.cidade}/{c.estado}</td>
                    <td className="px-3 py-2">
                      <span className="bg-blue-500/10 text-blue-400 text-xs px-2 py-0.5 rounded-full">
                        {veiculosMock.filter(v => v.clienteId === c.id).length}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-right text-green-400 font-semibold">
                      R$ {c.totalGasto.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
