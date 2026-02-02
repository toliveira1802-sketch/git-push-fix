import { useState } from 'react';
import { useLocation } from 'wouter';
import { ArrowRight, Mail, Lock, Eye, EyeOff, Wrench } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { trpc } from '@/lib/trpc';

export default function Login() {
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isValidPassword = password.length >= 4;
  const isFormValid = isValidEmail && isValidPassword;

  // Query para buscar colaborador por email
  const colaboradorQuery = trpc.colaboradores.getByEmail.useQuery(
    { email },
    { enabled: false }
  );

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
      // Buscar colaborador pelo email
      const result = await colaboradorQuery.refetch();
      const colaborador = result.data;

      if (!colaborador) {
        toast.error('Email não encontrado no sistema');
        setIsLoading(false);
        return;
      }

      // Verificar senha (por enquanto, comparação simples)
      // Em produção, usar hash
      if (colaborador.senha !== password) {
        toast.error('Senha incorreta');
        setIsLoading(false);
        return;
      }

      // Salvar dados do colaborador no localStorage
      localStorage.setItem('doctorAuto_colaborador', JSON.stringify({
        id: colaborador.id,
        nome: colaborador.nome,
        cargo: colaborador.cargo,
        email: colaborador.email,
        empresaId: colaborador.empresaId,
        nivelAcessoId: colaborador.nivelAcessoId,
        primeiroAcesso: colaborador.primeiroAcesso,
      }));

      toast.success(`Bem-vindo(a), ${colaborador.nome}!`);
      
      // Verificar se é primeiro acesso - redirecionar para troca de senha
      if (colaborador.primeiroAcesso) {
        toast.info('Por segurança, você precisa criar uma nova senha.');
        setLocation('/trocar-senha');
      } else {
        // Redirecionar para o dashboard admin
        setLocation('/admin');
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
            Primeiro acesso? Senha padrão: <span className="text-primary font-mono">123456</span>
          </p>
          <p className="text-muted-foreground text-sm mt-2">
            Problemas com acesso? Fale com a gestão.
          </p>
        </div>
      </div>
    </div>
  );
}
