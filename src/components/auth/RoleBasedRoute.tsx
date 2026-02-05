import { ReactNode, useEffect, useState } from 'react';
import { Redirect, useLocation } from 'wouter';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';

type AppRole = 'user' | 'admin' | 'gestao' | 'dev';

interface RoleBasedRouteProps {
  children: ReactNode;
  allowedRoles?: AppRole[];
  redirectTo?: string;
}

/**
 * RoleBasedRoute - O Porteiro Inteligente
 * 
 * Controla acesso às rotas baseado na role do usuário:
 * - admin/gestao/dev = acesso ao painel administrativo
 * - user = acesso à área do cliente (garagem)
 */
export default function RoleBasedRoute({ 
  children, 
  allowedRoles,
  redirectTo 
}: RoleBasedRouteProps) {
  const { user, loading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [role, setRole] = useState<AppRole | null>(null);
  const [roleLoading, setRoleLoading] = useState(true);

  useEffect(() => {
    const fetchRole = async () => {
      if (!user) {
        setRole(null);
        setRoleLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .order('created_at', { ascending: true })
          .limit(1)
          .single();

        if (error) {
          console.error('Erro ao buscar role:', error);
          setRole('user'); // Default para user se erro
        } else {
          setRole(data?.role as AppRole || 'user');
        }
      } catch (err) {
        console.error('Erro ao buscar role:', err);
        setRole('user');
      } finally {
        setRoleLoading(false);
      }
    };

    fetchRole();
  }, [user]);

  // Loading state
  if (authLoading || roleLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
          <p className="text-muted-foreground">Verificando acesso...</p>
        </div>
      </div>
    );
  }

  // Não autenticado -> Login
  if (!user) {
    return <Redirect to="/login" />;
  }

  // Se allowedRoles definido, verificar se tem permissão
  if (allowedRoles && allowedRoles.length > 0) {
    const hasPermission = role && allowedRoles.includes(role);
    
    if (!hasPermission) {
      // Redireciona para a área apropriada baseado na role
      const targetRoute = getDefaultRouteForRole(role);
      return <Redirect to={redirectTo || targetRoute} />;
    }
  }

  return <>{children}</>;
}

/**
 * Retorna a rota padrão baseada na role do usuário
 */
export function getDefaultRouteForRole(role: AppRole | null): string {
  switch (role) {
    case 'dev':
    case 'admin':
    case 'gestao':
      return '/admin';
    case 'user':
    default:
      return '/minha-garagem';
  }
}

/**
 * Helper para verificar se é role administrativa
 */
export function isAdminRole(role: AppRole | null): boolean {
  return role === 'admin' || role === 'gestao' || role === 'dev';
}

/**
 * Helper para verificar se é role de cliente
 */
export function isClientRole(role: AppRole | null): boolean {
  return role === 'user';
}
