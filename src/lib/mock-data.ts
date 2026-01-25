// Mock data for admin pages (frontend only mode)

export interface MockUser {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  role: 'user' | 'admin' | 'mechanic';
  created_at: string;
}

export interface MockVehicle {
  id: string;
  user_id: string;
  brand: string;
  model: string;
  year: number;
  plate: string;
  color: string;
}

export interface MockService {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
}

export type OrderStatus = 'open' | 'in_progress' | 'waiting_parts' | 'waiting_approval' | 'completed' | 'cancelled';

export interface MockServiceOrder {
  id: string;
  order_number: string;
  user_id: string;
  vehicle_id: string;
  status: OrderStatus;
  total: number;
  created_at: string;
  updated_at: string;
}

// Mock Users
export const mockUsers: MockUser[] = [
  {
    id: 'user-1',
    email: 'joao.silva@email.com',
    full_name: 'João Silva',
    phone: '11999887766',
    role: 'user',
    created_at: '2024-01-10T10:00:00Z'
  },
  {
    id: 'user-2',
    email: 'maria.santos@email.com',
    full_name: 'Maria Santos',
    phone: '11988776655',
    role: 'user',
    created_at: '2024-01-15T14:30:00Z'
  },
  {
    id: 'user-3',
    email: 'carlos.oliveira@email.com',
    full_name: 'Carlos Oliveira',
    phone: '11977665544',
    role: 'user',
    created_at: '2024-02-01T09:00:00Z'
  },
  {
    id: 'admin-1',
    email: 'admin@doctorauto.com',
    full_name: 'Administrador',
    phone: '11966554433',
    role: 'admin',
    created_at: '2023-06-01T08:00:00Z'
  },
  {
    id: 'mechanic-1',
    email: 'pedro.mecanico@doctorauto.com',
    full_name: 'Pedro Mecânico',
    phone: '11955443322',
    role: 'mechanic',
    created_at: '2023-07-01T08:00:00Z'
  }
];

// Mock Vehicles
export const mockVehicles: MockVehicle[] = [
  {
    id: 'vehicle-1',
    user_id: 'user-1',
    brand: 'Volkswagen',
    model: 'Golf GTI',
    year: 2020,
    plate: 'ABC-1234',
    color: 'Preto'
  },
  {
    id: 'vehicle-2',
    user_id: 'user-1',
    brand: 'Honda',
    model: 'Civic',
    year: 2019,
    plate: 'DEF-5678',
    color: 'Prata'
  },
  {
    id: 'vehicle-3',
    user_id: 'user-2',
    brand: 'Toyota',
    model: 'Corolla',
    year: 2021,
    plate: 'GHI-9012',
    color: 'Branco'
  },
  {
    id: 'vehicle-4',
    user_id: 'user-3',
    brand: 'BMW',
    model: '320i',
    year: 2022,
    plate: 'JKL-3456',
    color: 'Azul'
  }
];

// Mock Services
export const mockServices: MockService[] = [
  {
    id: 'service-1',
    name: 'Troca de Óleo',
    description: 'Troca de óleo do motor com filtro',
    price: 350,
    category: 'Manutenção'
  },
  {
    id: 'service-2',
    name: 'Alinhamento e Balanceamento',
    description: 'Alinhamento de direção e balanceamento das rodas',
    price: 180,
    category: 'Suspensão'
  },
  {
    id: 'service-3',
    name: 'Revisão de Freios',
    description: 'Inspeção e substituição de pastilhas/discos',
    price: 450,
    category: 'Freios'
  },
  {
    id: 'service-4',
    name: 'Diagnóstico Eletrônico',
    description: 'Scanner completo e diagnóstico de falhas',
    price: 250,
    category: 'Elétrica'
  },
  {
    id: 'service-5',
    name: 'Troca de Correia Dentada',
    description: 'Substituição da correia dentada e tensor',
    price: 850,
    category: 'Motor'
  },
  {
    id: 'service-6',
    name: 'Higienização de Ar Condicionado',
    description: 'Limpeza e higienização do sistema de A/C',
    price: 200,
    category: 'Climatização'
  }
];

// Mock Service Orders
export const mockServiceOrders: MockServiceOrder[] = [
  {
    id: 'os-1',
    order_number: 'OS-2024-001',
    user_id: 'user-1',
    vehicle_id: 'vehicle-1',
    status: 'in_progress',
    total: 1250,
    created_at: '2024-01-20T10:00:00Z',
    updated_at: '2024-01-20T14:30:00Z'
  },
  {
    id: 'os-2',
    order_number: 'OS-2024-002',
    user_id: 'user-2',
    vehicle_id: 'vehicle-3',
    status: 'waiting_approval',
    total: 2100,
    created_at: '2024-01-21T09:00:00Z',
    updated_at: '2024-01-21T11:00:00Z'
  },
  {
    id: 'os-3',
    order_number: 'OS-2024-003',
    user_id: 'user-1',
    vehicle_id: 'vehicle-2',
    status: 'completed',
    total: 350,
    created_at: '2024-01-18T08:00:00Z',
    updated_at: '2024-01-19T17:00:00Z'
  },
  {
    id: 'os-4',
    order_number: 'OS-2024-004',
    user_id: 'user-3',
    vehicle_id: 'vehicle-4',
    status: 'open',
    total: 450,
    created_at: '2024-01-22T14:00:00Z',
    updated_at: '2024-01-22T14:00:00Z'
  }
];

// Helper functions
export const getUserById = (id: string): MockUser | undefined => {
  return mockUsers.find(user => user.id === id);
};

export const getVehicleById = (id: string): MockVehicle | undefined => {
  return mockVehicles.find(vehicle => vehicle.id === id);
};

export const getServiceById = (id: string): MockService | undefined => {
  return mockServices.find(service => service.id === id);
};

export const getVehiclesByUserId = (userId: string): MockVehicle[] => {
  return mockVehicles.filter(vehicle => vehicle.user_id === userId);
};

export const getOrdersByUserId = (userId: string): MockServiceOrder[] => {
  return mockServiceOrders.filter(order => order.user_id === userId);
};
