import { useLocation } from "wouter";
import { ArrowLeft, Search, Users, Car, Phone, Loader2 } from "lucide-react";
import { AdminLayout } from "@/components/AdminLayout";
import { Input } from "@/components/ui/input";
import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface Cliente {
  id: string;
  nome: string;
  telefone: string;
  email: string | null;
  cidade: string | null;
  cpf_cnpj: string | null;
  registration_source: string;
  created_at: string;
  veiculos_count?: number;
}

export default function AdminClientesPage() {
  const [, setLocation] = useLocation();
  const [search, setSearch] = useState("");

  // Fetch clients from Supabase
  const { data: clientes = [], isLoading, error } = useQuery({
    queryKey: ['admin-clientes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('clients')
        .select(`
          id,
          nome,
          telefone,
          email,
          cidade,
          cpf_cnpj,
          registration_source,
          created_at
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Cliente[];
    }
  });

  // Fetch vehicle counts per client
  const { data: veiculosCounts = {} } = useQuery({
    queryKey: ['admin-veiculos-counts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vehicles')
        .select('user_id');

      if (error) throw error;

      const counts: Record<string, number> = {};
      data?.forEach(v => {
        counts[v.user_id] = (counts[v.user_id] || 0) + 1;
      });
      return counts;
    }
  });

  // Filter clients based on search
  const clientesFiltrados = useMemo(() => {
    if (!search.trim()) return clientes;
    
    const searchLower = search.toLowerCase();
    return clientes.filter(c =>
      c.nome?.toLowerCase().includes(searchLower) ||
      c.telefone?.includes(search) ||
      c.email?.toLowerCase().includes(searchLower) ||
      c.cidade?.toLowerCase().includes(searchLower) ||
      c.cpf_cnpj?.includes(search)
    );
  }, [clientes, search]);

  return (
    <AdminLayout>
      <div className="flex-1 flex flex-col bg-slate-950">
        {/* Header */}
        <header className="h-12 bg-slate-900 border-b border-slate-800 flex items-center px-4 gap-4">
          <button onClick={() => setLocation('/admin')} className="text-slate-400 hover:text-white">
            <ArrowLeft className="h-4 w-4" />
          </button>
          <h1 className="text-white font-semibold text-sm">Clientes</h1>
          <span className="text-slate-500 text-xs">({clientes.length} total)</span>
          
          {/* Search */}
          <div className="flex-1 max-w-md ml-auto">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
              <Input
                placeholder="Buscar por nome, telefone, email, cidade..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 h-8 bg-slate-800 border-slate-700 text-sm text-white placeholder:text-slate-500"
              />
            </div>
          </div>
        </header>

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-3 p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-3 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/20">
              <Users className="h-4 w-4 text-blue-400" />
            </div>
            <div>
              <p className="text-slate-400 text-xs">Total Clientes</p>
              <p className="text-lg font-bold text-white">{clientes.length}</p>
            </div>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-3 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-500/20">
              <Car className="h-4 w-4 text-green-400" />
            </div>
            <div>
              <p className="text-slate-400 text-xs">Total Veículos</p>
              <p className="text-lg font-bold text-white">{Object.values(veiculosCounts).reduce((a, b) => a + b, 0)}</p>
            </div>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-3 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-500/20">
              <Phone className="h-4 w-4 text-purple-400" />
            </div>
            <div>
              <p className="text-slate-400 text-xs">Com Telefone</p>
              <p className="text-lg font-bold text-white">
                {clientes.filter(c => c.telefone && c.telefone !== 'N/D').length}
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-4 pt-0 overflow-auto">
          {isLoading ? (
            <div className="flex items-center justify-center h-40">
              <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
            </div>
          ) : error ? (
            <div className="bg-red-900/20 border border-red-800 rounded-lg p-4 text-red-400">
              Erro ao carregar clientes: {(error as Error).message}
            </div>
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-800">
                    <th className="text-left text-xs text-slate-400 px-3 py-2">Nome</th>
                    <th className="text-left text-xs text-slate-400 px-3 py-2">Telefone</th>
                    <th className="text-left text-xs text-slate-400 px-3 py-2">Cidade</th>
                    <th className="text-left text-xs text-slate-400 px-3 py-2">Veículos</th>
                    <th className="text-left text-xs text-slate-400 px-3 py-2">Origem</th>
                  </tr>
                </thead>
                <tbody>
                  {clientesFiltrados.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-3 py-8 text-center text-slate-500">
                        {search ? 'Nenhum cliente encontrado' : 'Nenhum cliente cadastrado'}
                      </td>
                    </tr>
                  ) : (
                    clientesFiltrados.slice(0, 100).map(c => (
                      <tr 
                        key={c.id} 
                        className="border-b border-slate-800 hover:bg-slate-800/50 cursor-pointer"
                      >
                        <td className="px-3 py-2">
                          <p className="text-white font-medium">{c.nome}</p>
                          {c.email && <p className="text-slate-500 text-xs">{c.email}</p>}
                        </td>
                        <td className="px-3 py-2 text-slate-300">
                          {c.telefone === 'N/D' ? (
                            <span className="text-slate-500">-</span>
                          ) : c.telefone}
                        </td>
                        <td className="px-3 py-2 text-slate-300">
                          {c.cidade || <span className="text-slate-500">-</span>}
                        </td>
                        <td className="px-3 py-2">
                          <span className="bg-blue-500/10 text-blue-400 text-xs px-2 py-0.5 rounded-full">
                            {veiculosCounts[c.id] || 0}
                          </span>
                        </td>
                        <td className="px-3 py-2">
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            c.registration_source === 'importacao' 
                              ? 'bg-amber-500/10 text-amber-400' 
                              : 'bg-green-500/10 text-green-400'
                          }`}>
                            {c.registration_source === 'importacao' ? 'Importado' : 'Manual'}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
              {clientesFiltrados.length > 100 && (
                <div className="px-3 py-2 text-center text-slate-500 text-xs border-t border-slate-800">
                  Exibindo 100 de {clientesFiltrados.length} clientes
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
