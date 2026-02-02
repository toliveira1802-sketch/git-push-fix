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

const LoginCliente: React.FC = () => {
  const navigate = useNavigate();
  const { signIn, signInWithGoogle, user } = useAuth();
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

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    const { error } = await signInWithGoogle();

    if (error) {
      toast.error('Erro ao fazer login com Google');
      setIsLoading(false);
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
        <div className="text-center mb-10">
          <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-red-600 to-red-700 rounded-2xl flex items-center justify-center">
            <Car className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-1">
            Doctor Auto Prime
          </h1>
          <p className="text-muted-foreground text-sm">
            Área do Cliente
          </p>
        </div>

        {/* Login Form */}
        <div className="space-y-5 max-w-sm mx-auto w-full">
          {/* Email Field */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-foreground font-medium text-sm">
              Email
            </Label>
            <div className={cn(
              'bg-card/50 backdrop-blur-sm border border-border rounded-xl flex items-center gap-3 px-4 transition-all duration-300',
              errors.email && 'ring-2 ring-destructive/50'
            )}>
              <Mail className="w-4 h-4 text-muted-foreground" />
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
                className="border-0 bg-transparent text-foreground placeholder:text-muted-foreground focus-visible:ring-0 py-5"
              />
            </div>
            {errors.email && (
              <p className="text-destructive text-xs animate-in fade-in">{errors.email}</p>
            )}
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <Label htmlFor="password" className="text-foreground font-medium text-sm">
              Senha
            </Label>
            <div className={cn(
              'bg-card/50 backdrop-blur-sm border border-border rounded-xl flex items-center gap-3 px-4 transition-all duration-300',
              errors.password && 'ring-2 ring-destructive/50'
            )}>
              <Lock className="w-4 h-4 text-muted-foreground" />
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
                className="border-0 bg-transparent text-foreground placeholder:text-muted-foreground focus-visible:ring-0 py-5"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.password && (
              <p className="text-destructive text-xs animate-in fade-in">{errors.password}</p>
            )}
          </div>

          <Button
            onClick={handleLogin}
            disabled={!isFormValid || isLoading}
            className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold py-5 group"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Entrando...
              </>
            ) : (
              <>
                Entrar
                <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </Button>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-background px-3 text-muted-foreground">ou</span>
            </div>
          </div>

          {/* Google Login */}
          <Button
            variant="outline"
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full py-5"
          >
            <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Continuar com Google
          </Button>
        </div>

        {/* Footer */}
        <div className="mt-10 text-center">
          <p className="text-muted-foreground text-sm">
            Primeiro acesso?{' '}
            <button
              onClick={() => navigate('/register')}
              className="text-red-500 hover:underline font-medium"
            >
              Cadastre-se
            </button>
          </p>
        </div>
      </div>

      {/* Bottom safe area */}
      <div className="h-6" />
    </div>
  );
};

export default LoginCliente;
