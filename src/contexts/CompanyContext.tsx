import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import { DEV_BYPASS, DEV_COMPANY } from '@/config/devBypass';

export interface Company {
  id: string;
  code: string;
  name: string;
  hora_abertura?: string;
  hora_fechamento?: string;
  dias_atendimento?: string[];
  meta_mensal?: number;
  meta_diaria?: number;
  is_active?: boolean;
}

interface CompanyContextType {
  companies: Company[];
  currentCompany: Company | null;
  setCurrentCompany: (company: Company) => void;
  userCompany: Company | null;
  canSelectCompany: boolean;
  isConsolidated: boolean;
  setConsolidated: (value: boolean) => void;
  isLoading: boolean;
}

const CompanyContext = createContext<CompanyContextType | undefined>(undefined);

export function CompanyProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [companies, setCompanies] = useState<Company[]>(DEV_BYPASS ? [DEV_COMPANY] : []);
  const [currentCompany, setCurrentCompany] = useState<Company | null>(DEV_BYPASS ? DEV_COMPANY : null);
  const [userCompany, setUserCompany] = useState<Company | null>(DEV_BYPASS ? DEV_COMPANY : null);
  const [userRole, setUserRole] = useState<string | null>(DEV_BYPASS ? 'dev' : null);
  const [isConsolidated, setConsolidated] = useState(false);
  const [isLoading, setIsLoading] = useState(DEV_BYPASS ? false : true);

  // Buscar empresas do banco
  useEffect(() => {
    // DEV BYPASS: não buscar empresas do banco
    if (DEV_BYPASS) {
      return;
    }

    const fetchCompanies = async () => {
      try {
        const { data, error } = await supabase
          .from('empresas')
          .select('*')
          .eq('is_active', true)
          .order('name');

        if (error) throw error;

        const mappedCompanies: Company[] = (data || []).map(c => ({
          id: c.id,
          code: c.code,
          name: c.name,
          hora_abertura: c.hora_abertura,
          hora_fechamento: c.hora_fechamento,
          dias_atendimento: c.dias_atendimento,
          meta_mensal: c.meta_mensal,
          meta_diaria: c.meta_diaria,
          is_active: c.is_active,
        }));

        setCompanies(mappedCompanies);

        // Definir empresa padrão se ainda não tiver
        if (mappedCompanies.length > 0 && !currentCompany) {
          setCurrentCompany(mappedCompanies[0]);
        }
      } catch (err) {
        console.error('Erro ao buscar empresas:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCompanies();
  }, []);

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
      if (!user || companies.length === 0) {
        if (!user) {
          setUserRole(null);
          setUserCompany(null);
        }
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

        // Por enquanto, usar empresa padrão baseada na role
        // Futuramente: buscar do campo company_code no profile
        if (role === 'admin' || role === 'gestao') {
          // Admin/gestao fixo na primeira empresa - futuramente virá do cadastro
          const defaultCompany = companies[0];
          setUserCompany(defaultCompany);
          setCurrentCompany(defaultCompany);
        } else if (role === 'dev') {
          // Dev pode ver todas
          setUserCompany(null);
        }
      } catch (err) {
        console.error('Erro ao buscar dados do usuário:', err);
      }
    };

    fetchUserData();
  }, [user, companies]);

  // Verificar se pode selecionar empresa (apenas dev/master)
  const canSelectCompany = userRole === 'dev';

  // Handler para trocar empresa com validação
  const handleSetCurrentCompany = (company: Company) => {
    if (canSelectCompany || !userCompany) {
      setCurrentCompany(company);
      setConsolidated(false);
    }
  };

  return (
    <CompanyContext.Provider value={{ 
      companies, 
      currentCompany: userCompany || currentCompany, 
      setCurrentCompany: handleSetCurrentCompany,
      userCompany,
      canSelectCompany,
      isConsolidated,
      setConsolidated,
      isLoading,
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
