import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { ArrowRight, Mail, Lock, Eye, EyeOff, Wrench, Shield, BarChart3, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

type LoginStep = 'credentials' | 'choose-module';
type ModuleChoice = 'admin' | 'gestao';

export default function Login() {
  const [, setLocation] = useLocation();
  const { user, loading: authLoading } = useAuth();
  const [step, setStep] = useState<LoginStep>('credentials');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  // If already logged in, go straight to module choice
  useEffect(() => {
    if (!authLoading && user) {
      setStep('choose-module');
    }
  }, [user, authLoading]);

  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isValidPassword = password.length >= 4;
  const isFormValid = isValidEmail && isValidPassword;

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
        if (error.message.includes('Invalid login credentials')) {
          toast.error('Email ou senha incorretos');
        } else if (error.message.includes('Email not confirmed')) {
          toast.error('Email não confirmado. Verifique sua caixa de entrada.');
        } else {
          toast.error(error.message || 'Erro ao fazer login');
        }
        setIsLoading(false);
        return;
      }

      if (data.user) {
        toast.success('Login realizado com sucesso!');
        setStep('choose-module');
      }
    } catch (error) {
      toast.error('Erro ao fazer login. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleModuleChoice = async (module: ModuleChoice) => {
    const currentUser = user;
    if (!currentUser) {
      toast.error('Sessão expirada. Faça login novamente.');
      setStep('credentials');
      return;
    }

    setIsLoading(true);

    try {
      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', currentUser.id)
        .single();

      if (roleError || !roleData) {
        toast.error('Erro ao verificar permissões. Contate a gestão.');
        setIsLoading(false);
        return;
      }

      const role = roleData.role;

      if (module === 'admin') {
        if (role === 'admin' || role === 'dev') {
          setLocation('/admin/dashboard');
        } else {
          toast.error('Seu perfil não tem permissão para acessar o módulo Admin.');
          setIsLoading(false);
        }
      } else if (module === 'gestao') {
        if (role === 'gestao' || role === 'dev') {
          setLocation('/gestao');
        } else {
          toast.error('Seu perfil não tem permissão para acessar o módulo Gestão.');
          setIsLoading(false);
        }
      }
    } catch (error) {
      toast.error('Erro ao verificar permissões.');
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && isFormValid) {
      handleLogin();
    }
  };

  const handleBack = async () => {
    await supabase.auth.signOut();
    setStep('credentials');
    setEmail('');
    setPassword('');
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

        {/* Step: Credentials */}
        {step === 'credentials' && (
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
        )}

        {/* Step: Choose Module */}
        {step === 'choose-module' && (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-semibold text-foreground mb-2">
                Escolha o Módulo
              </h2>
              <p className="text-muted-foreground text-sm">
                Selecione para onde deseja ir
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {/* Admin Button */}
              <button
                onClick={() => handleModuleChoice('admin')}
                disabled={isLoading}
                className="group relative overflow-hidden rounded-2xl border border-border bg-card p-6 text-left transition-all duration-300 hover:shadow-xl hover:scale-[1.02] hover:border-primary/50 disabled:opacity-50"
              >
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shrink-0">
                    <Shield className="h-7 w-7 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-foreground">Admin</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Operação da oficina, OS, pátio e agenda
                    </p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground ml-auto group-hover:text-primary group-hover:translate-x-1 transition-all shrink-0" />
                </div>
              </button>

              {/* Gestão Button */}
              <button
                onClick={() => handleModuleChoice('gestao')}
                disabled={isLoading}
                className="group relative overflow-hidden rounded-2xl border border-border bg-card p-6 text-left transition-all duration-300 hover:shadow-xl hover:scale-[1.02] hover:border-primary/50 disabled:opacity-50"
              >
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shrink-0">
                    <BarChart3 className="h-7 w-7 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-foreground">Gestão</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Dashboards, RH, financeiro e estratégia
                    </p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground ml-auto group-hover:text-primary group-hover:translate-x-1 transition-all shrink-0" />
                </div>
              </button>
            </div>

            {/* Back button */}
            <Button
              variant="ghost"
              onClick={handleBack}
              className="w-full text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar ao login
            </Button>
          </div>
        )}

        {/* Modo Desenvolvedor — apenas em DEV local */}
        {import.meta.env.DEV && (
          <div className="mt-6 p-4 rounded-lg border border-dashed border-muted-foreground/20 bg-muted/30">
            <p className="text-xs text-muted-foreground text-center mb-3">
              Modo Desenvolvedor
            </p>
            <div className="flex flex-col gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setEmail('admin@doctorautoprime.com.br');
                  setPassword('admin123');
                  setActiveTab('login');
                  toast.info('Credenciais preenchidas! Clique em Entrar.');
                }}
                className="w-full text-xs"
              >
                <Wrench className="w-3 h-3 mr-2" />
                Preencher Credenciais de Teste
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCreateTestAdmin}
                disabled={isLoading}
                className="w-full text-xs text-muted-foreground"
              >
                <UserPlus className="w-3 h-3 mr-2" />
                Criar Admin de Teste
              </Button>
            </div>
          </div>
        )}

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
