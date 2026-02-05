import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { ArrowRight, Mail, Lock, Eye, EyeOff, Wrench, User, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { getDefaultRouteForRole } from '@/components/auth/RoleBasedRoute';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

type AppRole = 'user' | 'admin' | 'gestao' | 'dev';

export default function Login() {
  const [, setLocation] = useLocation();
  const { user, loading: authLoading } = useAuth();
  
  // Login state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; name?: string }>({});
  
  // Sign up state
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [signUpName, setSignUpName] = useState('');
  const [showSignUpPassword, setShowSignUpPassword] = useState(false);
  const [activeTab, setActiveTab] = useState('login');

  // Redireciona se já logado
  useEffect(() => {
    const checkAndRedirect = async () => {
      if (authLoading) return;
      if (!user) return;

      // Buscar role e redirecionar
      const { data } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true })
        .limit(1)
        .single();

      const role = (data?.role as AppRole) || 'user';
      const targetRoute = getDefaultRouteForRole(role);
      
      // Buscar nome para toast de boas-vindas
      const { data: profileData } = await supabase
        .from('colaboradores')
        .select('full_name')
        .eq('user_id', user.id)
        .single();
      
      const userName = profileData?.full_name || user.email?.split('@')[0] || 'Usuário';
      toast.success(`Bem-vindo ao Doctor Auto Prime, ${userName}!`);
      
      setLocation(targetRoute);
    };

    checkAndRedirect();
  }, [user, authLoading, setLocation]);

  // Validations
  const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isValidPassword = (password: string) => password.length >= 6;
  const isValidName = (name: string) => name.length >= 3;

  const isLoginFormValid = isValidEmail(email) && isValidPassword(password);
  const isSignUpFormValid = isValidEmail(signUpEmail) && isValidPassword(signUpPassword) && isValidName(signUpName);

  const handleLogin = async () => {
    if (!isLoginFormValid) {
      const newErrors: typeof errors = {};
      if (!isValidEmail(email)) newErrors.email = 'Email inválido';
      if (!isValidPassword(password)) newErrors.password = 'Senha deve ter pelo menos 6 caracteres';
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
        // Redirecionamento será feito pelo useEffect
      }
    } catch (error) {
      toast.error('Erro ao fazer login. Tente novamente.');
      setIsLoading(false);
    }
  };

  const handleSignUp = async () => {
    if (!isSignUpFormValid) {
      const newErrors: typeof errors = {};
      if (!isValidName(signUpName)) newErrors.name = 'Nome deve ter pelo menos 3 caracteres';
      if (!isValidEmail(signUpEmail)) newErrors.email = 'Email inválido';
      if (!isValidPassword(signUpPassword)) newErrors.password = 'Senha deve ter pelo menos 6 caracteres';
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const { data, error } = await supabase.auth.signUp({
        email: signUpEmail,
        password: signUpPassword,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            full_name: signUpName,
          },
        },
      });

      if (error) {
        if (error.message.includes('already registered')) {
          toast.error('Este email já está cadastrado. Tente fazer login.');
        } else {
          toast.error(error.message || 'Erro ao criar conta');
        }
        setIsLoading(false);
        return;
      }

      if (data.user) {
        toast.success('Conta criada! Verifique seu email para confirmar o cadastro.');
        setActiveTab('login');
        setEmail(signUpEmail);
        setPassword('');
      }
    } catch (error) {
      toast.error('Erro ao criar conta. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent, action: 'login' | 'signup') => {
    if (e.key === 'Enter') {
      if (action === 'login' && isLoginFormValid) {
        handleLogin();
      } else if (action === 'signup' && isSignUpFormValid) {
        handleSignUp();
      }
    }
  };

  // Criar admin de teste (DEV)
  const handleCreateTestAdmin = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-admin-user', {
        body: {
          email: 'admin@doctorautoprime.com.br',
          password: 'admin123',
          name: 'Admin Doctor Auto',
        },
      });

      if (error) {
        console.error('Erro:', error);
        toast.error('Erro ao criar admin: ' + error.message);
      } else {
        toast.success('Admin criado! Use: admin@doctorautoprime.com.br / admin123');
        setEmail('admin@doctorautoprime.com.br');
        setPassword('admin123');
      }
    } catch (err: any) {
      console.error('Erro:', err);
      toast.error('Erro ao criar admin de teste');
    } finally {
      setIsLoading(false);
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
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto mb-4 rounded-2xl gradient-primary flex items-center justify-center red-glow">
            <Wrench className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-1">
            Doctor Auto Prime
          </h1>
          <p className="text-muted-foreground text-sm">
            Sistema de Gestão - Oficina
          </p>
        </div>

        {/* Auth Form with Tabs */}
        <div className="glass-card p-6 rounded-2xl">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="login" className="flex items-center gap-2">
                <User className="w-4 h-4" />
                Entrar
              </TabsTrigger>
              <TabsTrigger value="signup" className="flex items-center gap-2">
                <UserPlus className="w-4 h-4" />
                Cadastrar
              </TabsTrigger>
            </TabsList>

            {/* LOGIN TAB */}
            <TabsContent value="login" className="space-y-4">
              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="login-email" className="text-foreground font-medium">
                  Email
                </Label>
                <div className={`flex items-center gap-3 px-4 py-2 rounded-lg bg-background/50 border transition-all duration-300 ${errors.email ? 'border-destructive' : 'border-border'}`}>
                  <Mail className="w-5 h-5 text-muted-foreground" />
                  <Input
                    id="login-email"
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (errors.email) setErrors(prev => ({ ...prev, email: undefined }));
                    }}
                    onKeyDown={(e) => handleKeyPress(e, 'login')}
                    placeholder="seu@email.com"
                    className="border-0 bg-transparent text-foreground placeholder:text-muted-foreground focus-visible:ring-0 p-0"
                  />
                </div>
                {errors.email && (
                  <p className="text-destructive text-sm">{errors.email}</p>
                )}
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <Label htmlFor="login-password" className="text-foreground font-medium">
                  Senha
                </Label>
                <div className={`flex items-center gap-3 px-4 py-2 rounded-lg bg-background/50 border transition-all duration-300 ${errors.password ? 'border-destructive' : 'border-border'}`}>
                  <Lock className="w-5 h-5 text-muted-foreground" />
                  <Input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (errors.password) setErrors(prev => ({ ...prev, password: undefined }));
                    }}
                    onKeyDown={(e) => handleKeyPress(e, 'login')}
                    placeholder="••••••"
                    className="border-0 bg-transparent text-foreground placeholder:text-muted-foreground focus-visible:ring-0 p-0"
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
                  <p className="text-destructive text-sm">{errors.password}</p>
                )}
              </div>

              <Button
                onClick={handleLogin}
                disabled={!isLoginFormValid || isLoading}
                className="w-full gradient-primary text-primary-foreground font-semibold py-5 group"
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
            </TabsContent>

            {/* SIGN UP TAB */}
            <TabsContent value="signup" className="space-y-4">
              {/* Name Field */}
              <div className="space-y-2">
                <Label htmlFor="signup-name" className="text-foreground font-medium">
                  Nome Completo
                </Label>
                <div className={`flex items-center gap-3 px-4 py-2 rounded-lg bg-background/50 border transition-all duration-300 ${errors.name ? 'border-destructive' : 'border-border'}`}>
                  <User className="w-5 h-5 text-muted-foreground" />
                  <Input
                    id="signup-name"
                    type="text"
                    value={signUpName}
                    onChange={(e) => {
                      setSignUpName(e.target.value);
                      if (errors.name) setErrors(prev => ({ ...prev, name: undefined }));
                    }}
                    onKeyDown={(e) => handleKeyPress(e, 'signup')}
                    placeholder="Seu nome"
                    className="border-0 bg-transparent text-foreground placeholder:text-muted-foreground focus-visible:ring-0 p-0"
                  />
                </div>
                {errors.name && (
                  <p className="text-destructive text-sm">{errors.name}</p>
                )}
              </div>

              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="signup-email" className="text-foreground font-medium">
                  Email
                </Label>
                <div className={`flex items-center gap-3 px-4 py-2 rounded-lg bg-background/50 border transition-all duration-300 ${errors.email ? 'border-destructive' : 'border-border'}`}>
                  <Mail className="w-5 h-5 text-muted-foreground" />
                  <Input
                    id="signup-email"
                    type="email"
                    value={signUpEmail}
                    onChange={(e) => {
                      setSignUpEmail(e.target.value);
                      if (errors.email) setErrors(prev => ({ ...prev, email: undefined }));
                    }}
                    onKeyDown={(e) => handleKeyPress(e, 'signup')}
                    placeholder="seu@email.com"
                    className="border-0 bg-transparent text-foreground placeholder:text-muted-foreground focus-visible:ring-0 p-0"
                  />
                </div>
                {errors.email && (
                  <p className="text-destructive text-sm">{errors.email}</p>
                )}
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <Label htmlFor="signup-password" className="text-foreground font-medium">
                  Senha
                </Label>
                <div className={`flex items-center gap-3 px-4 py-2 rounded-lg bg-background/50 border transition-all duration-300 ${errors.password ? 'border-destructive' : 'border-border'}`}>
                  <Lock className="w-5 h-5 text-muted-foreground" />
                  <Input
                    id="signup-password"
                    type={showSignUpPassword ? 'text' : 'password'}
                    value={signUpPassword}
                    onChange={(e) => {
                      setSignUpPassword(e.target.value);
                      if (errors.password) setErrors(prev => ({ ...prev, password: undefined }));
                    }}
                    onKeyDown={(e) => handleKeyPress(e, 'signup')}
                    placeholder="Mínimo 6 caracteres"
                    className="border-0 bg-transparent text-foreground placeholder:text-muted-foreground focus-visible:ring-0 p-0"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSignUpPassword(!showSignUpPassword)}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showSignUpPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-destructive text-sm">{errors.password}</p>
                )}
              </div>

              <Button
                onClick={handleSignUp}
                disabled={!isSignUpFormValid || isLoading}
                className="w-full gradient-primary text-primary-foreground font-semibold py-5 group"
              >
                {isLoading ? (
                  'Criando conta...'
                ) : (
                  <>
                    Criar Conta
                    <UserPlus className="ml-2 w-5 h-5" />
                  </>
                )}
              </Button>
              
              <p className="text-xs text-muted-foreground text-center">
                Após o cadastro, verifique seu email para confirmar a conta.
              </p>
            </TabsContent>
          </Tabs>
        </div>

        {/* DEV: Botão para criar admin de teste */}
        {import.meta.env.DEV && (
          <div className="mt-6 p-4 rounded-lg border border-dashed border-yellow-500/30 bg-yellow-500/5">
            <p className="text-xs text-yellow-500 text-center mb-3">
              🔧 Modo Desenvolvimento
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={handleCreateTestAdmin}
              disabled={isLoading}
              className="w-full border-yellow-500/50 text-yellow-500 hover:bg-yellow-500/10"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Criar Admin de Teste
            </Button>
            <p className="text-xs text-muted-foreground text-center mt-2">
              admin@doctorautoprime.com.br / admin123
            </p>
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-muted-foreground text-sm">
            Problemas com acesso? Fale com a gestão.
          </p>
        </div>
      </div>
    </div>
  );
}
