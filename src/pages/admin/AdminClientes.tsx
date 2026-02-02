import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Search, Plus, User, Car, Phone, Mail, MapPin } from "lucide-react";
import { clientesMock, veiculosMock } from "@/lib/mockData";

export default function AdminClientes() {
  const [search, setSearch] = useState("");
  const [clienteExpandido, setClienteExpandido] = useState<number | null>(null);

  const clientesFiltrados = clientesMock.filter((cliente) => {
    const searchLower = search.toLowerCase();
    const veiculosDoCliente = veiculosMock.filter(v => v.clienteId === cliente.id);
    const placaMatch = veiculosDoCliente.some(v => v.placa.toLowerCase().includes(searchLower));
    return (
      cliente.nomeCompleto.toLowerCase().includes(searchLower) ||
      cliente.cpf.includes(search) ||
      cliente.telefone.includes(search) ||
      cliente.email.toLowerCase().includes(searchLower) ||
      placaMatch
    );
  });

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
              <p className="text-2xl font-bold text-white">{clientesMock.length}</p>
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
              <p className="text-2xl font-bold text-white">{veiculosMock.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-lg bg-purple-500/20">
              <Car className="h-6 w-6 text-purple-400" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Média Veículos/Cliente</p>
              <p className="text-2xl font-bold text-white">{(veiculosMock.length / clientesMock.length).toFixed(1)}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-white/5 border-white/10 mb-6">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Buscar por nome, CPF, telefone, email ou placa..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 bg-white/5 border-white/10 text-white"
            />
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {clientesFiltrados.map((cliente) => {
          const veiculosDoCliente = veiculosMock.filter(v => v.clienteId === cliente.id);
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
                        <p className="text-white font-bold text-lg">{cliente.nomeCompleto}</p>
                        <div className="flex items-center gap-4 text-gray-400 text-sm">
                          <span className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {cliente.telefone}
                          </span>
                          <span className="flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {cliente.email}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <Badge className="bg-blue-500/20 text-blue-400 border-0">
                        {veiculosDoCliente.length} veículo(s)
                      </Badge>
                      <span className="text-gray-400">{cliente.cpf}</span>
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
                        <p className="text-gray-400">{cliente.endereco}</p>
                        <p className="text-gray-400">{cliente.cidade} - {cliente.estado}</p>
                        <p className="text-gray-400">CEP: {cliente.cep}</p>
                      </div>
                      <div>
                        <h4 className="text-white font-medium mb-3 flex items-center gap-2">
                          <Car className="h-4 w-4 text-gray-400" />
                          Veículos
                        </h4>
                        <div className="space-y-2">
                          {veiculosDoCliente.map((veiculo) => (
                            <div key={veiculo.id} className="p-3 bg-white/5 rounded-lg">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="text-white font-bold">{veiculo.placa}</p>
                                  <p className="text-gray-400 text-sm">{veiculo.marca} {veiculo.modelo}</p>
                                </div>
                                <div className="text-right">
                                  <p className="text-gray-400 text-sm">{veiculo.ano}</p>
                                  <p className="text-gray-500 text-xs">{veiculo.kmAtual.toLocaleString("pt-BR")} km</p>
                                </div>
                              </div>
                            </div>
                          ))}
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
