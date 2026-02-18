import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Search, Plus, User, Car, Phone, Mail, MapPin, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Cliente {
  id: string;
  nome: string;
  cpf_cnpj: string | null;
  email: string | null;
  telefone: string;
  endereco: string | null;
  cidade: string | null;
}

interface Veiculo {
  id: string;
  user_id: string;
  plate: string;
  brand: string;
  model: string;
  year: string | null;
  km_atual: number | null;
}

export default function AdminClientes() {
  const [search, setSearch] = useState("");
  const [clienteExpandido, setClienteExpandido] = useState<string | null>(null);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [veiculos, setVeiculos] = useState<Veiculo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const [clientesRes, veiculosRes] = await Promise.all([
        supabase.from("clientes").select("id, name, cpf, email, phone, address, city").then(r => ({ data: (r.data || []).map((c: any) => ({ id: c.id, nome: c.name, cpf_cnpj: c.cpf, email: c.email, telefone: c.phone, endereco: c.address, cidade: c.city })), error: r.error })),
        supabase.from("veiculos").select("id, client_id, plate, brand, model, year, km").then(r => ({ data: (r.data || []).map((v: any) => ({ id: v.id, user_id: v.client_id, plate: v.plate, brand: v.brand, model: v.model, year: v.year, km_atual: v.km })), error: r.error })),
      ]);
      setClientes((clientesRes.data as any) ?? []);
      setVeiculos((veiculosRes.data as any) ?? []);
      setLoading(false);
    }
    fetchData();
  }, []);

  const clientesFiltrados = clientes.filter((cliente) => {
    const searchLower = search.toLowerCase();
    const veiculosDoCliente = veiculos.filter(v => v.user_id === cliente.id);
    const placaMatch = veiculosDoCliente.some(v => v.plate.toLowerCase().includes(searchLower));
    return (
      (cliente.nome || "").toLowerCase().includes(searchLower) ||
      (cliente.cpf_cnpj || "").includes(search) ||
      (cliente.telefone || "").includes(search) ||
      (cliente.email || "").toLowerCase().includes(searchLower) ||
      placaMatch
    );
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-white" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link href="/admin">
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <User className="w-6 h-6 text-red-500" />
              Clientes
            </h1>
            <p className="text-gray-400">Gestão de clientes e veículos</p>
          </div>
        </div>
        <Button className="bg-red-600 hover:bg-red-700">
          <Plus className="h-4 w-4 mr-2" />
          Novo Cliente
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-lg bg-blue-500/20">
              <User className="h-6 w-6 text-blue-400" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Total Clientes</p>
              <p className="text-2xl font-bold text-white">{clientes.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-lg bg-green-500/20">
              <Car className="h-6 w-6 text-green-400" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Total Veículos</p>
              <p className="text-2xl font-bold text-white">{veiculos.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-lg bg-purple-500/20">
              <Phone className="h-6 w-6 text-purple-400" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Com Telefone</p>
              <p className="text-2xl font-bold text-white">
                {clientes.filter(c => c.telefone).length}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-white/5 border-white/10 mb-6">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Buscar por nome, telefone, email, cidade..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 bg-white/5 border-white/10 text-white"
            />
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {clientesFiltrados.length === 0 && (
          <Card className="bg-white/5 border-white/10">
            <CardContent className="p-8 text-center">
              <p className="text-gray-400">Nenhum cliente encontrado</p>
            </CardContent>
          </Card>
        )}
        {clientesFiltrados.map((cliente) => {
          const veiculosDoCliente = veiculos.filter(v => v.user_id === cliente.id);
          const isExpandido = clienteExpandido === cliente.id;

          return (
            <Card key={cliente.id} className="bg-white/5 border-white/10">
              <CardContent className="p-0">
                <div
                  className="p-4 cursor-pointer hover:bg-white/5 transition-colors"
                  onClick={() => setClienteExpandido(isExpandido ? null : cliente.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-full bg-red-500/20">
                        <User className="h-6 w-6 text-red-400" />
                      </div>
                      <div>
                        <p className="text-white font-bold text-lg">{cliente.nome}</p>
                        <div className="flex items-center gap-4 text-gray-400 text-sm">
                          <span className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {cliente.telefone}
                          </span>
                          {cliente.email && (
                            <span className="flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              {cliente.email}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <Badge className="bg-blue-500/20 text-blue-400 border-0">
                        {veiculosDoCliente.length} veículo(s)
                      </Badge>
                      {cliente.cpf_cnpj && <span className="text-gray-400">{cliente.cpf_cnpj}</span>}
                    </div>
                  </div>
                </div>

                {isExpandido && (
                  <div className="border-t border-white/10 p-4 bg-white/5">
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <h4 className="text-white font-medium mb-3 flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-gray-400" />
                          Endereço
                        </h4>
                        <p className="text-gray-400">{cliente.endereco || "Não informado"}</p>
                        <p className="text-gray-400">{cliente.cidade || ""}</p>
                      </div>
                      <div>
                        <h4 className="text-white font-medium mb-3 flex items-center gap-2">
                          <Car className="h-4 w-4 text-gray-400" />
                          Veículos
                        </h4>
                        <div className="space-y-2">
                          {veiculosDoCliente.length === 0 ? (
                            <p className="text-gray-500 text-sm">Nenhum veículo cadastrado</p>
                          ) : (
                            veiculosDoCliente.map((veiculo) => (
                              <div key={veiculo.id} className="p-3 bg-white/5 rounded-lg">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <p className="text-white font-bold">{veiculo.plate}</p>
                                    <p className="text-gray-400 text-sm">{veiculo.brand} {veiculo.model}</p>
                                  </div>
                                  <div className="text-right">
                                    <p className="text-gray-400 text-sm">{veiculo.year || "-"}</p>
                                    <p className="text-gray-500 text-xs">{veiculo.km_atual ? veiculo.km_atual.toLocaleString("pt-BR") + " km" : "-"}</p>
                                  </div>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
