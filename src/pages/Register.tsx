import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Mail, Lock, ArrowRight, Eye, EyeOff, Phone, Car, Gift } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface FormData {
  name: string;
  phone: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface FormErrors {
  name?: string;
  phone?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
}

const formatPhone = (value: string) => {
  const numbers = value.replace(/\D/g, "");
  if (numbers.length <= 2) return `(${numbers}`;
  if (numbers.length <= 7) return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
  return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
};

const Register: React.FC = () => {
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const [formData, setFormData] = useState<FormData>({
    name: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Nome é obrigatório';
    } else if (formData.name.trim().length < 3) {
      newErrors.name = 'Nome deve ter pelo menos 3 caracteres';
    }

    const phoneDigits = formData.phone.replace(/\D/g, '');
    if (!phoneDigits) {
      newErrors.phone = 'Telefone é obrigatório';
    } else if (phoneDigits.length < 10) {
      newErrors.phone = 'Telefone deve ter pelo menos 10 dígitos';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email é obrigatório';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    if (!formData.password) {
      newErrors.password = 'Senha é obrigatória';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Senha deve ter pelo menos 6 caracteres';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Senhas não conferem';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    
    const { error: signUpError } = await signUp(formData.email, formData.password, formData.name, formData.phone);
    
    if (signUpError) {
      if (signUpError.message.includes('already registered')) {
        toast.error('Este email já está cadastrado');
      } else {
        toast.error('Erro ao criar conta. Tente novamente.');
      }
      setIsSubmitting(false);
      return;
    }

    // Aguardar um momento para o auth processar e criar o profile
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Buscar o usuário recém criado
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      // Criar entrada em clients como auto-cadastro
      const { error: clientError } = await supabase
        .from('clients')
        .insert({
          nome: formData.name,
          telefone: formData.phone.replace(/\D/g, ''),
          email: formData.email,
          origem_cadastro: 'self',
          user_id: user.id,
          status: 'ativo',
          is_active: true,
          nivel_fidelidade: 'bronze'
        });

      if (clientError) {
        console.error('Erro ao criar cliente:', clientError);
      }

      // Dar 50 pontos de boas-vindas no profile
      const { error: pointsError } = await supabase
        .from('profiles')
        .update({ 
          loyalty_points: 50,
          loyalty_level: 'bronze'
        })
        .eq('user_id', user.id);

      if (pointsError) {
        console.error('Erro ao atribuir pontos:', pointsError);
      }
    }

    toast.success(
      <div className="flex items-center gap-2">
        <Gift className="h-5 w-5 text-amber-500" />
        <div>
          <p className="font-semibold">Conta criada com sucesso!</p>
          <p className="text-sm text-muted-foreground">Você ganhou 50 pontos de boas-vindas! 🎉</p>
        </div>
      </div>
    );
    navigate('/');
  };

  const handleChange = (field: keyof FormData, value: string) => {
    let formattedValue = value;
    if (field === 'phone') {
      formattedValue = formatPhone(value);
    }
    setFormData((prev) => ({ ...prev, [field]: formattedValue }));
    
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const phoneDigits = formData.phone.replace(/\D/g, '');
  const isFormValid = formData.name.trim().length >= 3 &&
    phoneDigits.length >= 10 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email) &&
    formData.password.length >= 6 &&
    formData.password === formData.confirmPassword;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex flex-col">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <div className="relative px-4 py-6">
        <button
          onClick={() => navigate('/login')}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Voltar</span>
        </button>
      </div>

      {/* Content */}
      <div className="relative flex-1 flex flex-col px-6 py-4 overflow-y-auto">
        {/* Logo */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 mx-auto mb-3 bg-gradient-to-br from-red-600 to-red-700 rounded-xl flex items-center justify-center">
            <Car className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-1">
            Crie sua conta
          </h1>
          <p className="text-muted-foreground text-sm">
            Preencha seus dados para começar
          </p>
        </div>

        {/* Form */}
        <div className="space-y-4 flex-1">
          {/* Name Field */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-foreground font-medium text-sm">
              Nome completo
            </Label>
            <div className={cn(
              'bg-card/50 backdrop-blur-sm border border-border rounded-xl flex items-center gap-3 px-4 transition-all duration-300',
              errors.name && 'ring-2 ring-destructive/50'
            )}>
              <User className="w-5 h-5 text-muted-foreground" />
              <Input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="Seu nome"
                className="border-0 bg-transparent text-foreground placeholder:text-muted-foreground focus-visible:ring-0 py-5"
              />
            </div>
            {errors.name && (
              <p className="text-destructive text-sm animate-in fade-in">{errors.name}</p>
            )}
          </div>

          {/* Phone Field */}
          <div className="space-y-2">
            <Label htmlFor="phone" className="text-foreground font-medium text-sm">
              Telefone
            </Label>
            <div className={cn(
              'bg-card/50 backdrop-blur-sm border border-border rounded-xl flex items-center gap-3 px-4 transition-all duration-300',
              errors.phone && 'ring-2 ring-destructive/50'
            )}>
              <Phone className="w-5 h-5 text-muted-foreground" />
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                placeholder="(11) 99999-9999"
                maxLength={15}
                className="border-0 bg-transparent text-foreground placeholder:text-muted-foreground focus-visible:ring-0 py-5"
              />
            </div>
            {errors.phone && (
              <p className="text-destructive text-sm animate-in fade-in">{errors.phone}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-foreground font-medium text-sm">
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
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="seu@email.com"
                className="border-0 bg-transparent text-foreground placeholder:text-muted-foreground focus-visible:ring-0 py-5"
              />
            </div>
            {errors.email && (
              <p className="text-destructive text-sm animate-in fade-in">{errors.email}</p>
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
              <Lock className="w-5 h-5 text-muted-foreground" />
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => handleChange('password', e.target.value)}
                placeholder="Mínimo 6 caracteres"
                className="border-0 bg-transparent text-foreground placeholder:text-muted-foreground focus-visible:ring-0 py-5"
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

          {/* Confirm Password Field */}
          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-foreground font-medium text-sm">
              Confirmar senha
            </Label>
            <div className={cn(
              'bg-card/50 backdrop-blur-sm border border-border rounded-xl flex items-center gap-3 px-4 transition-all duration-300',
              errors.confirmPassword && 'ring-2 ring-destructive/50'
            )}>
              <Lock className="w-5 h-5 text-muted-foreground" />
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                value={formData.confirmPassword}
                onChange={(e) => handleChange('confirmPassword', e.target.value)}
                placeholder="Repita a senha"
                className="border-0 bg-transparent text-foreground placeholder:text-muted-foreground focus-visible:ring-0 py-5"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-destructive text-sm animate-in fade-in">{errors.confirmPassword}</p>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-4 pb-2">
          <Button
            onClick={handleSubmit}
            disabled={!isFormValid || isSubmitting}
            className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold py-6 text-lg group"
          >
            {isSubmitting ? (
              'Criando conta...'
            ) : (
              <>
                Criar conta
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </Button>
        </div>

        {/* Footer */}
        <div className="text-center pb-4">
          <p className="text-muted-foreground text-sm">
            Já tem conta?{' '}
            <button 
              onClick={() => navigate('/login')}
              className="text-red-500 hover:underline font-medium"
            >
              Entrar
            </button>
          </p>
        </div>
      </div>

      {/* Bottom safe area */}
      <div className="h-8" />
    </div>
  );
};

export default Register;
