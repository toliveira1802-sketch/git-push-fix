import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Mail, Lock, Eye, EyeOff, Shield } from 'lucide-react';
import logo from '@/assets/logo.png';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

const AdminLogin: React.FC = () => {
  const navigate = useNavigate();
  const { signIn, signInWithGoogle } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isValidPassword = password.length >= 6;
  const isFormValid = isValidEmail && isValidPassword;

  const checkAdminRole = async (userId: string): Promise<boolean> => {
    const { data, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error('Error checking role:', error);
      return false;
    }

    const allowedRoles = ['admin', 'gestao', 'dev', 'master'];
    return data?.role && allowedRoles.includes(data.role);
  };

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

    // Get current user to check role
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      const isAdmin = await checkAdminRole(user.id);
      
      if (!isAdmin) {
        await supabase.auth.signOut();
        toast.error('Acesso negado. Esta área é restrita a administradores.');
        setIsLoading(false);
        return;
      }

      toast.success('Bem-vindo ao Painel Administrativo!');
      navigate('/admin');
    }

    setIsLoading(false);
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
    // OAuth redirect handles the rest
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-slate-800/50 rounded-full blur-3xl" />
      </div>

      {/* Content */}
      <div className="relative flex-1 flex flex-col justify-center px-6 py-12 max-w-md mx-auto w-full">
        {/* Logo and Badge */}
        <div className="text-center mb-10">
          <div className="relative inline-block">
            <img src={logo} alt="Doctor Auto Prime" className="w-20 h-20 mx-auto mb-4 object-contain" />
            <div className="absolute -bottom-1 -right-1 bg-primary rounded-full p-1.5">
              <Shield className="w-4 h-4 text-primary-foreground" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">
            Doctor Auto Prime
          </h1>
          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
            <Shield className="w-3 h-3 mr-1" />
            Painel Administrativo
          </Badge>
        </div>

        {/* Login Card */}
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-8 shadow-2xl">
          <div className="text-center mb-8">
            <h2 className="text-xl font-semibold text-white mb-2">
              Área Restrita
            </h2>
            <p className="text-slate-400 text-sm">
              Acesso exclusivo para administradores
            </p>
          </div>

          <div className="space-y-5">
            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-300 font-medium">
                Email
              </Label>
              <div className={cn(
                'flex items-center gap-3 px-4 bg-slate-700/50 border border-slate-600 rounded-lg transition-all duration-300 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary',
                errors.email && 'ring-2 ring-destructive/50 border-destructive/50'
              )}>
                <Mail className="w-5 h-5 text-slate-400" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errors.email) setErrors(prev => ({ ...prev, email: undefined }));
                  }}
                  onKeyPress={handleKeyPress}
                  placeholder="admin@doctorautoprime.com"
                  className="border-0 bg-transparent text-white placeholder:text-slate-500 focus-visible:ring-0 text-base py-5"
                />
              </div>
              {errors.email && (
                <p className="text-destructive text-sm animate-fade-in">{errors.email}</p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-slate-300 font-medium">
                Senha
              </Label>
              <div className={cn(
                'flex items-center gap-3 px-4 bg-slate-700/50 border border-slate-600 rounded-lg transition-all duration-300 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary',
                errors.password && 'ring-2 ring-destructive/50 border-destructive/50'
              )}>
                <Lock className="w-5 h-5 text-slate-400" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password) setErrors(prev => ({ ...prev, password: undefined }));
                  }}
                  onKeyPress={handleKeyPress}
                  placeholder="••••••••"
                  className="border-0 bg-transparent text-white placeholder:text-slate-500 focus-visible:ring-0 text-base py-5"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-destructive text-sm animate-fade-in">{errors.password}</p>
              )}
            </div>

            {/* Login Button */}
            <Button
              onClick={handleLogin}
              disabled={!isFormValid || isLoading}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-6 text-base group"
            >
              {isLoading ? (
                'Entrando...'
              ) : (
                <>
                  Acessar Painel
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </Button>

            {/* Separator */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-600"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-slate-800/50 text-slate-500">ou</span>
              </div>
            </div>

            {/* Google Login Button */}
            <Button
              onClick={handleGoogleLogin}
              disabled={isLoading}
              variant="outline"
              className="w-full py-6 text-base font-semibold bg-white/5 border-slate-600 text-white hover:bg-white/10 hover:border-slate-500"
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Entrar com Google
            </Button>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-slate-500 text-sm">
            Área de clientes?{' '}
            <button
              onClick={() => navigate('/login')}
              className="text-primary hover:underline font-medium"
            >
              Acesse aqui
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
