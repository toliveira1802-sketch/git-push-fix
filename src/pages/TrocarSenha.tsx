import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Lock, Eye, EyeOff, ShieldCheck, Wrench } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

export default function TrocarSenha() {
  const [, setLocation] = useLocation();
  const [senhaAtual, setSenhaAtual] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [showSenhaAtual, setShowSenhaAtual] = useState(false);
  const [showNovaSenha, setShowNovaSenha] = useState(false);
  const [showConfirmarSenha, setShowConfirmarSenha] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ senhaAtual?: string; novaSenha?: string; confirmarSenha?: string }>({});

  const isValidNovaSenha = novaSenha.length >= 6;
  const senhasConferem = novaSenha === confirmarSenha && confirmarSenha.length > 0;
  const isFormValid = senhaAtual.length > 0 && isValidNovaSenha && senhasConferem;

  const handleTrocarSenha = async () => {
    const newErrors: { senhaAtual?: string; novaSenha?: string; confirmarSenha?: string } = {};
    
    if (senhaAtual.length === 0) {
      newErrors.senhaAtual = 'Digite a senha atual';
    }
    if (!isValidNovaSenha) {
      newErrors.novaSenha = 'A nova senha deve ter pelo menos 6 caracteres';
    }
    if (!senhasConferem) {
      newErrors.confirmarSenha = 'As senhas não conferem';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      const { error } = await supabase.auth.updateUser({
        password: novaSenha,
      });

      if (error) {
        toast.error(error.message || 'Erro ao trocar senha');
        setIsLoading(false);
        return;
      }

      toast.success('Senha alterada com sucesso!');
      setLocation('/admin');
    } catch (error) {
      toast.error('Erro ao trocar senha. Tente novamente.');
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
        <div className="text-center mb-12">
          <div className="w-24 h-24 mx-auto mb-6 rounded-2xl gradient-primary flex items-center justify-center red-glow">
            <ShieldCheck className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Trocar Senha
          </h1>
          <p className="text-muted-foreground">
            Crie uma nova senha segura
          </p>
        </div>

        {/* Form */}
        <div className="space-y-6">
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
                placeholder="Sua senha atual"
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

          {/* Confirmar Senha */}
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
          </div>

          <Button
            onClick={handleTrocarSenha}
            disabled={!isFormValid || isLoading}
            className="w-full gradient-primary text-primary-foreground font-semibold py-6 text-lg"
          >
            {isLoading ? 'Alterando...' : 'Alterar Senha'}
          </Button>
        </div>
      </div>
    </div>
  );
}
