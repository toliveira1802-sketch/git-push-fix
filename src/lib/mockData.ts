// Mock data for development

export interface Cliente {
  id: string;
  nome: string;
  nomeCompleto: string;
  telefone: string;
  email: string;
  cpf: string;
  endereco?: string;
  cidade?: string;
  estado?: string;
  cep?: string;
}

export interface Veiculo {
  id: string;
  modelo: string;
  marca: string;
  placa: string;
  ano: number;
  clienteId: string;
  kmAtual?: number;
}

export const mockClientes: Cliente[] = [
  { 
    id: "1", 
    nome: "João", 
    nomeCompleto: "João Silva", 
    telefone: "(11) 99999-9999", 
    email: "joao@email.com",
    cpf: "123.456.789-00",
    endereco: "Rua das Flores, 123",
    cidade: "São Paulo",
    estado: "SP",
    cep: "01234-567"
  },
  { 
    id: "2", 
    nome: "Maria", 
    nomeCompleto: "Maria Santos", 
    telefone: "(11) 98888-8888", 
    email: "maria@email.com",
    cpf: "987.654.321-00",
    endereco: "Av. Principal, 456",
    cidade: "São Paulo",
    estado: "SP",
    cep: "01234-890"
  },
];

export const mockVeiculos: Veiculo[] = [
  { id: "1", modelo: "Civic", marca: "Honda", placa: "ABC-1234", ano: 2022, clienteId: "1", kmAtual: 45000 },
  { id: "2", modelo: "Corolla", marca: "Toyota", placa: "DEF-5678", ano: 2021, clienteId: "2", kmAtual: 32000 },
];

export const mockOS = [
  { id: "1", numero: "OS-001", status: "em_andamento", clienteId: "1", veiculoId: "1" },
  { id: "2", numero: "OS-002", status: "aguardando", clienteId: "2", veiculoId: "2" },
];

// Aliases for backwards compatibility
export const clientesMock = mockClientes;
export const veiculosMock = mockVeiculos;
export const colaboradoresMock: any[] = [];
export const servicosMock: any[] = [];
export const ordemServicoMock = mockOS;
