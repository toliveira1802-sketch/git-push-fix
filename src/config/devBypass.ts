// TODO: REMOVER BYPASS DEV - Quando autenticação Supabase estiver funcionando
// Mude para false para desativar todos os bypasses de uma vez
export const DEV_BYPASS = true;

// Dados fake para desenvolvimento
export const DEV_USER = {
  id: 'dev-user-id',
  email: 'dev@doctor.com',
  name: 'Dev User',
};

export const DEV_CLIENT = {
  id: 'dev-client-id',
  name: 'Cliente Dev',
  phone: '11999999999',
  email: 'dev@doctor.com',
};

export const DEV_VEHICLES = [
  {
    id: 'dev-vehicle-1',
    brand: 'FIAT',
    model: 'PALIO',
    plate: 'ABC-1234',
    year: 2020,
    color: 'Prata',
    km: 45000,
    is_active: true,
  },
  {
    id: 'dev-vehicle-2',
    brand: 'HONDA',
    model: 'CIVIC',
    plate: 'XYZ-5678',
    year: 2022,
    color: 'Preto',
    km: 15000,
    is_active: true,
  },
];

export const DEV_COMPANY = {
  id: 'dev-company-id',
  code: 'DEV',
  name: 'Doctor Auto Prime (Dev)',
  hora_abertura: '08:00',
  hora_fechamento: '18:00',
  dias_atendimento: ['seg', 'ter', 'qua', 'qui', 'sex', 'sab'],
  meta_mensal: 100000,
  meta_diaria: 5000,
  is_active: true,
};
