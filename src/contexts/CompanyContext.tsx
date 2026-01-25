import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';

export interface Company {
  id: string;
  name: string;
  logo?: string;
}

interface CompanyContextType {
  companies: Company[];
  currentCompany: Company;
  setCurrentCompany: (company: Company) => void;
  userCompany: Company | null; // Empresa do usuário (para admins)
  canSelectCompany: boolean; // Se pode trocar empresa (dev/master)
  isConsolidated: boolean; // Visão consolidada (todas empresas)
  setConsolidated: (value: boolean) => void;
}

const defaultCompanies: Company[] = [
  { id: 'pombal', name: 'POMBAL' },
  { id: 'centro', name: 'CENTRO' },
  { id: 'matriz', name: 'MATRIZ' },
];

const CompanyContext = createContext<CompanyContextType | undefined>(undefined);

export function CompanyProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [currentCompany, setCurrentCompany] = useState<Company>(defaultCompanies[0]);
  const [userCompany, setUserCompany] = useState<Company | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isConsolidated, setConsolidated] = useState(false);

  // Escutar mudanças de auth diretamente do Supabase
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Buscar role e empresa do usuário
  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) {
        setUserRole(null);
        setUserCompany(null);
        return;
      }

      try {
        // Buscar role do usuário
        const { data: roleData } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .limit(1)
          .maybeSingle();

        const role = roleData?.role || 'user';
        setUserRole(role);

        // Buscar empresa do usuário (do profile ou metadata)
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        // Por enquanto, usar empresa padrão baseada na role
        // Futuramente: buscar do campo company_id no profile
        if (role === 'admin') {
          // Admin fixo na primeira empresa (POMBAL) - futuramente virá do cadastro
          setUserCompany(defaultCompanies[0]);
          setCurrentCompany(defaultCompanies[0]);
        } else if (role === 'dev') {
          // Dev pode ver todas
          setUserCompany(null);
        }
      } catch (err) {
        console.error('Erro ao buscar dados do usuário:', err);
      }
    };

    fetchUserData();
  }, [user]);

  // Verificar se pode selecionar empresa (apenas dev/master)
  const canSelectCompany = userRole === 'dev';

  // Handler para trocar empresa com validação
  const handleSetCurrentCompany = (company: Company) => {
    if (canSelectCompany || !userCompany) {
      setCurrentCompany(company);
      setConsolidated(false); // Desativa consolidado ao selecionar empresa
    }
  };

  return (
    <CompanyContext.Provider value={{ 
      companies: defaultCompanies, 
      currentCompany: userCompany || currentCompany, 
      setCurrentCompany: handleSetCurrentCompany,
      userCompany,
      canSelectCompany,
      isConsolidated,
      setConsolidated,
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
