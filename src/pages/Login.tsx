import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { ArrowRight, Mail, Lock, Eye, EyeOff, Wrench } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { DEV_BYPASS } from '@/config/devBypass';

export default function Login() {
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  // DEV_BYPASS: Redireciona diretamente para /dashboard-cockpit sem login
  useEffect(() => {
    if (DEV_BYPASS) {
      console.log('[DEV_BYPASS] Redirecionando diretamente para /dashboard-cockpit');
      toast.info('Modo desenvolvimento ativo - bypass de login');
      setLocation('/dashboard-cockpit');
    }
  }, [setLocation]);

  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isValidPassword = password.length >= 4;
  const isFormValid = isValidEmail && isValidPassword;

  // Role-based redirect helper
  const redirectByRole = async (userId: string) => {
    try {
      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .single();

      if (roleError) {
        console.error('Erro ao buscar role:', roleError);
        // Default to client view if no role found
        setLocation('/minha-garagem');
        return;
      }

      const role = roleData?.role;
      
      // Role mapping: admin/gestao/dev -> staff view, user -> client view
      if (role === 'admin' || role === 'gestao' || role === 'dev') {
        setLocation('/dashboard-cockpit');
      } else {
        setLocation('/minha-garagem');
      }
    } catch (error) {
      console.error('Erro ao redirecionar:', error);
      setLocation('/minha-garagem');
    }
  };

  const handleLogin = async () => {
    if (!isFormValid) {
      const newErrors: { email?: string; password?: string } = {};
      if (!isValidEmail) newErrors.email = 'Email inválido';
      if (!isValidPassword) newErrors.password = 'Senha deve ter pelo menos 4 caracteres';
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast.error(error.message || 'Erro ao fazer login');
        setIsLoading(false);
        return;
      }

      if (data.user) {
        toast.success('Login realizado com sucesso!');
        // Redirect based on user role
        await redirectByRole(data.user.id);
      }
    } catch (error) {
      toast.error('Erro ao fazer login. Tente novamente.');
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && isFormValid) {
      handleLogin();
    }
  };

  return (
    <div className="min-h-screen gradient-bg flex flex-col">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />
      </div>

      {/* Content */}
      <div className="relative flex-1 flex flex-col justify-center px-6 py-12 max-w-md mx-auto w-full">
        {/* Logo */}
        <div className="text-center mb-12">
          <div className="w-24 h-24 mx-auto mb-6 rounded-2xl gradient-primary flex items-center justify-center red-glow">
            <Wrench className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Doctor Auto Prime
          </h1>
          <p className="text-muted-foreground">
            Sistema de Gestão - Oficina
          </p>
        </div>

        {/* Login Form */}
        <div className="space-y-6">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-2">
              Acesso Funcionário
            </h2>
            <p className="text-muted-foreground text-sm">
              Digite seu email e senha para continuar
            </p>
          </div>

          {/* Email Field */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-foreground font-medium">
              Email
            </Label>
            <div className={`glass-card flex items-center gap-3 px-4 transition-all duration-300 ${errors.email ? 'ring-2 ring-destructive/50' : ''}`}>
              <Mail className="w-5 h-5 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) setErrors(prev => ({ ...prev, email: undefined }));
                }}
                onKeyDown={handleKeyPress}
                placeholder="seu@email.com"
                className="border-0 bg-transparent text-foreground placeholder:text-muted-foreground focus-visible:ring-0 text-lg py-6"
              />
            </div>
            {errors.email && (
              <p className="text-destructive text-sm animate-fade-in">{errors.email}</p>
            )}
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <Label htmlFor="password" className="text-foreground font-medium">
              Senha
            </Label>
            <div className={`glass-card flex items-center gap-3 px-4 transition-all duration-300 ${errors.password ? 'ring-2 ring-destructive/50' : ''}`}>
              <Lock className="w-5 h-5 text-muted-foreground" />
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errors.password) setErrors(prev => ({ ...prev, password: undefined }));
                }}
                onKeyDown={handleKeyPress}
                placeholder="Sua senha"
                className="border-0 bg-transparent text-foreground placeholder:text-muted-foreground focus-visible:ring-0 text-lg py-6"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {errors.password && (
              <p className="text-destructive text-sm animate-fade-in">{errors.password}</p>
            )}
          </div>

          <Button
            onClick={handleLogin}
            disabled={!isFormValid || isLoading}
            className="w-full gradient-primary text-primary-foreground font-semibold py-6 text-lg group"
          >
            {isLoading ? (
              'Entrando...'
            ) : (
              <>
                Entrar
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </Button>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center">
          <p className="text-muted-foreground text-sm">
            Problemas com acesso? Fale com a gestão.
          </p>
        </div>
      </div>
    </div>
  );
}
