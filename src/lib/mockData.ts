// Mock data for development
export const mockClientes = [
  { id: "1", nome: "João Silva", telefone: "(11) 99999-9999", email: "joao@email.com" },
  { id: "2", nome: "Maria Santos", telefone: "(11) 98888-8888", email: "maria@email.com" },
];

export const mockVeiculos = [
  { id: "1", modelo: "Honda Civic", placa: "ABC-1234", ano: 2022, clienteId: "1" },
  { id: "2", modelo: "Toyota Corolla", placa: "DEF-5678", ano: 2021, clienteId: "2" },
];

export const mockOS = [
  { id: "1", numero: "OS-001", status: "em_andamento", clienteId: "1", veiculoId: "1" },
  { id: "2", numero: "OS-002", status: "aguardando", clienteId: "2", veiculoId: "2" },
];
