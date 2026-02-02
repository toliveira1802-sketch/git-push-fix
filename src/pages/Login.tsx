import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Mail, Lock, Eye, EyeOff, Car, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRole, getHomeRouteForRole } from '@/hooks/useUserRole';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { DEV_BYPASS } from '@/config/devBypass';
<<<<<<< Updated upstream
<<<<<<< Updated upstream

const DEV_PASSWORD = 'dev2024';
=======
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { signIn, user } = useAuth();
  const { role, isLoading: isRoleLoading } = useUserRole();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isValidPassword = password.length >= 6;
  const isFormValid = isValidEmail && isValidPassword;

  // Redirecionar se já estiver logado
  useEffect(() => {
    if (user && !isRoleLoading && role) {
      const redirectTo = getHomeRouteForRole(role);
      navigate(redirectTo);
    }
  }, [user, role, isRoleLoading, navigate]);

  const handleLogin = async () => {
    if (!isFormValid) {
      const newErrors: { email?: string; password?: string } = {};
      if (!isValidEmail) newErrors.email = 'Email inválido';
      if (!isValidPassword) newErrors.password = 'Senha deve ter pelo menos 6 caracteres';
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    setErrors({});

    // DEV BYPASS: Pular autenticação e ir direto para a home
    if (DEV_BYPASS) {
      console.log('DEV BYPASS ATIVO - pulando autenticação');
      toast.success('[DEV] Bypass ativo! Entrando...');
      await new Promise(resolve => setTimeout(resolve, 1000));
      navigate('/');
      return;
    }

    const { error } = await signIn(email, password);

    if (error) {
      if (error.message.includes('Invalid login credentials')) {
        toast.error('Email ou senha incorretos');
      } else {
        toast.error('Erro ao fazer login. Tente novamente.');
      }
      setIsLoading(false);
      return;
    }

    toast.success('Login realizado com sucesso!');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && isFormValid) {
      handleLogin();
    }
  };

  const handleDevAccess = () => {
    const pwd = prompt('Senha de desenvolvedor:');
    if (pwd === DEV_PASSWORD) {
      const route = prompt('Rota (admin/gestao/cliente):')?.toLowerCase();
      if (route === 'admin') navigate('/admin');
      else if (route === 'gestao') navigate('/gestao');
      else if (route === 'cliente') navigate('/');
      else toast.error('Rota inválida');
    } else if (pwd !== null) {
      toast.error('Senha incorreta');
    }
  };

  // Mostrar loading enquanto verifica autenticação
  if (user && isRoleLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex flex-col">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />
      </div>

      {/* Content */}
      <div className="relative flex-1 flex flex-col justify-center px-6 py-12">
        {/* Logo */}
        <div className="text-center mb-12">
          <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-red-600 to-red-700 rounded-2xl flex items-center justify-center">
            <Car className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Doctor Auto Prime
          </h1>
          <p className="text-muted-foreground">
            Acesso Administrativo
          </p>
        </div>

        {/* Login Form */}
        <div className="space-y-6">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-2">
              Entre na sua conta
            </h2>
            <p className="text-muted-foreground text-sm">
              Acesso restrito para colaboradores
            </p>
          </div>

          {/* Email Field */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-foreground font-medium">
              Email
            </Label>
            <div className={cn(
              'bg-card/50 backdrop-blur-sm border border-border rounded-xl flex items-center gap-3 px-4 transition-all duration-300',
              errors.email && 'ring-2 ring-destructive/50'
            )}>
              <Mail className="w-5 h-5 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) setErrors(prev => ({ ...prev, email: undefined }));
                }}
                onKeyPress={handleKeyPress}
                placeholder="seu@email.com"
                className="border-0 bg-transparent text-foreground placeholder:text-muted-foreground focus-visible:ring-0 text-lg py-6"
              />
            </div>
            {errors.email && (
              <p className="text-destructive text-sm animate-in fade-in">{errors.email}</p>
            )}
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <Label htmlFor="password" className="text-foreground font-medium">
              Senha
            </Label>
            <div className={cn(
              'bg-card/50 backdrop-blur-sm border border-border rounded-xl flex items-center gap-3 px-4 transition-all duration-300',
              errors.password && 'ring-2 ring-destructive/50'
            )}>
              <Lock className="w-5 h-5 text-muted-foreground" />
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errors.password) setErrors(prev => ({ ...prev, password: undefined }));
                }}
                onKeyPress={handleKeyPress}
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
              <p className="text-destructive text-sm animate-in fade-in">{errors.password}</p>
            )}
          </div>

          <Button
            onClick={handleLogin}
            disabled={!isFormValid || isLoading}
            className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold py-6 text-lg group"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Entrando...
              </>
            ) : (
              <>
                Entrar
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </Button>
        </div>

        {/* Dev bypass - discrete text */}
        {import.meta.env.DEV && (
          <div className="mt-8 text-center">
            <button
              onClick={handleDevAccess}
              className="text-muted-foreground/40 text-xs hover:text-muted-foreground transition-colors"
            >
              v0.0.1-dev
            </button>
          </div>
        )}
      </div>

      {/* Bottom safe area */}
      <div className="h-8" />
    </div>
  );
};

export default Login;
