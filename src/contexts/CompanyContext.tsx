import { createContext, useContext, useState, ReactNode } from 'react';

export interface Company {
  id: string;
  name: string;
  logo?: string;
}

interface CompanyContextType {
  companies: Company[];
  currentCompany: Company;
  setCurrentCompany: (company: Company) => void;
}

const defaultCompanies: Company[] = [
  { id: 'pombal', name: 'POMBAL' },
  { id: 'centro', name: 'CENTRO' },
  { id: 'matriz', name: 'MATRIZ' },
];

const CompanyContext = createContext<CompanyContextType | undefined>(undefined);

export function CompanyProvider({ children }: { children: ReactNode }) {
  const [currentCompany, setCurrentCompany] = useState<Company>(defaultCompanies[0]);

  return (
    <CompanyContext.Provider value={{ 
      companies: defaultCompanies, 
      currentCompany, 
      setCurrentCompany 
    }}>
      {children}
    </CompanyContext.Provider>
  );
}

export function useCompany() {
  const context = useContext(CompanyContext);
  if (context === undefined) {
    throw new Error('useCompany must be used within a CompanyProvider');
  }
  return context;
}
