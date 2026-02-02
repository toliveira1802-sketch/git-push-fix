import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Lock, Eye, EyeOff, ShieldCheck, Wrench } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { trpc } from '@/lib/trpc';

interface ColaboradorLogado {
  id: number;
  nome: string;
  cargo: string;
  email: string;
  empresaId: number | null;
  nivelAcessoId: number | null;
  primeiroAcesso?: boolean;
}

export default function TrocarSenha() {
  const [, setLocation] = useLocation();
  const [colaborador, setColaborador] = useState<ColaboradorLogado | null>(null);
  const [senhaAtual, setSenhaAtual] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [showSenhaAtual, setShowSenhaAtual] = useState(false);
  const [showNovaSenha, setShowNovaSenha] = useState(false);
  const [showConfirmarSenha, setShowConfirmarSenha] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ senhaAtual?: string; novaSenha?: string; confirmarSenha?: string }>({});

  const trocarSenhaMutation = trpc.colaboradores.trocarSenha.useMutation();

  useEffect(() => {
    const stored = localStorage.getItem('doctorAuto_colaborador');
    if (!stored) {
      setLocation('/login');
      return;
    }
    setColaborador(JSON.parse(stored));
  }, [setLocation]);

  const isValidNovaSenha = novaSenha.length >= 6;
  const senhasConferem = novaSenha === confirmarSenha && confirmarSenha.length > 0;
  const isFormValid = senhaAtual.length > 0 && isValidNovaSenha && senhasConferem;

  const handleTrocarSenha = async () => {
    if (!colaborador) return;

    const newErrors: { senhaAtual?: string; novaSenha?: string; confirmarSenha?: string } = {};
    
    if (!senhaAtual) newErrors.senhaAtual = 'Digite a senha atual';
    if (!isValidNovaSenha) newErrors.novaSenha = 'A nova senha deve ter pelo menos 6 caracteres';
    if (!senhasConferem) newErrors.confirmarSenha = 'As senhas não conferem';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      const result = await trocarSenhaMutation.mutateAsync({
        id: colaborador.id,
        senhaAtual,
        novaSenha,
      });

      if (!result.success) {
        toast.error(result.error || 'Erro ao trocar senha');
        setIsLoading(false);
        return;
      }

      // Atualizar localStorage para marcar que não é mais primeiro acesso
      const updatedColaborador = { ...colaborador, primeiroAcesso: false };
      localStorage.setItem('doctorAuto_colaborador', JSON.stringify(updatedColaborador));

      toast.success('Senha alterada com sucesso!');
      setLocation('/admin');
    } catch (error) {
      toast.error('Erro ao trocar senha. Tente novamente.');
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && isFormValid) {
      handleTrocarSenha();
    }
  };

  if (!colaborador) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Carregando...</div>
      </div>
    );
  }

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
            <ShieldCheck className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Primeiro Acesso
          </h1>
          <p className="text-muted-foreground">
            Olá, <span className="text-primary font-medium">{colaborador.nome}</span>!
          </p>
          <p className="text-muted-foreground text-sm mt-2">
            Por segurança, você precisa criar uma nova senha.
          </p>
        </div>

        {/* Form */}
        <div className="space-y-5">
          {/* Senha Atual */}
          <div className="space-y-2">
            <Label htmlFor="senhaAtual" className="text-foreground font-medium">
              Senha Atual
            </Label>
            <div className={`glass-card flex items-center gap-3 px-4 transition-all duration-300 ${errors.senhaAtual ? 'ring-2 ring-destructive/50' : ''}`}>
              <Lock className="w-5 h-5 text-muted-foreground" />
              <Input
                id="senhaAtual"
                type={showSenhaAtual ? 'text' : 'password'}
                value={senhaAtual}
                onChange={(e) => {
                  setSenhaAtual(e.target.value);
                  if (errors.senhaAtual) setErrors(prev => ({ ...prev, senhaAtual: undefined }));
                }}
                onKeyDown={handleKeyPress}
                placeholder="Digite a senha atual (123456)"
                className="border-0 bg-transparent text-foreground placeholder:text-muted-foreground focus-visible:ring-0 text-lg py-6"
              />
              <button
                type="button"
                onClick={() => setShowSenhaAtual(!showSenhaAtual)}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                {showSenhaAtual ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {errors.senhaAtual && (
              <p className="text-destructive text-sm animate-fade-in">{errors.senhaAtual}</p>
            )}
          </div>

          {/* Nova Senha */}
          <div className="space-y-2">
            <Label htmlFor="novaSenha" className="text-foreground font-medium">
              Nova Senha
            </Label>
            <div className={`glass-card flex items-center gap-3 px-4 transition-all duration-300 ${errors.novaSenha ? 'ring-2 ring-destructive/50' : ''}`}>
              <Lock className="w-5 h-5 text-muted-foreground" />
              <Input
                id="novaSenha"
                type={showNovaSenha ? 'text' : 'password'}
                value={novaSenha}
                onChange={(e) => {
                  setNovaSenha(e.target.value);
                  if (errors.novaSenha) setErrors(prev => ({ ...prev, novaSenha: undefined }));
                }}
                onKeyDown={handleKeyPress}
                placeholder="Mínimo 6 caracteres"
                className="border-0 bg-transparent text-foreground placeholder:text-muted-foreground focus-visible:ring-0 text-lg py-6"
              />
              <button
                type="button"
                onClick={() => setShowNovaSenha(!showNovaSenha)}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                {showNovaSenha ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {errors.novaSenha && (
              <p className="text-destructive text-sm animate-fade-in">{errors.novaSenha}</p>
            )}
          </div>

          {/* Confirmar Nova Senha */}
          <div className="space-y-2">
            <Label htmlFor="confirmarSenha" className="text-foreground font-medium">
              Confirmar Nova Senha
            </Label>
            <div className={`glass-card flex items-center gap-3 px-4 transition-all duration-300 ${errors.confirmarSenha ? 'ring-2 ring-destructive/50' : ''}`}>
              <Lock className="w-5 h-5 text-muted-foreground" />
              <Input
                id="confirmarSenha"
                type={showConfirmarSenha ? 'text' : 'password'}
                value={confirmarSenha}
                onChange={(e) => {
                  setConfirmarSenha(e.target.value);
                  if (errors.confirmarSenha) setErrors(prev => ({ ...prev, confirmarSenha: undefined }));
                }}
                onKeyDown={handleKeyPress}
                placeholder="Repita a nova senha"
                className="border-0 bg-transparent text-foreground placeholder:text-muted-foreground focus-visible:ring-0 text-lg py-6"
              />
              <button
                type="button"
                onClick={() => setShowConfirmarSenha(!showConfirmarSenha)}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                {showConfirmarSenha ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {errors.confirmarSenha && (
              <p className="text-destructive text-sm animate-fade-in">{errors.confirmarSenha}</p>
            )}
            {novaSenha && confirmarSenha && senhasConferem && (
              <p className="text-green-500 text-sm animate-fade-in">✓ Senhas conferem</p>
            )}
          </div>

          <Button
            onClick={handleTrocarSenha}
            disabled={!isFormValid || isLoading}
            className="w-full gradient-primary text-primary-foreground font-semibold py-6 text-lg mt-4"
          >
            {isLoading ? 'Salvando...' : 'Salvar Nova Senha'}
          </Button>
        </div>
      </div>
    </div>
  );
}
