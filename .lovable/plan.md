
# Plano: Bypass de Login para Testes

## Objetivo
Adicionar botões de acesso rápido na tela de login para testar diferentes roles sem precisar digitar credenciais.

## Implementacao

### 1. Adicionar botoes de bypass na tela de Login

Modificar `src/pages/Login.tsx` para incluir:

- **Secao de Teste** (visivel apenas em desenvolvimento):
  - Botao "Entrar como Admin" - redireciona para `/admin`
  - Botao "Entrar como Gestao" - redireciona para `/gestao`  
  - Botao "Entrar como Cliente" - redireciona para `/`

### 2. Detalhes Tecnicos

**Arquivo a modificar:** `src/pages/Login.tsx`

**Mudancas:**
```tsx
// Adicionar no final do formulario, antes do footer
{import.meta.env.DEV && (
  <div className="mt-6 p-4 border border-dashed border-yellow-500 rounded-lg">
    <p className="text-yellow-600 text-sm mb-3 text-center">
      Modo Desenvolvimento - Bypass
    </p>
    <div className="flex gap-2">
      <Button variant="outline" onClick={() => navigate('/admin')}>
        Admin
      </Button>
      <Button variant="outline" onClick={() => navigate('/gestao')}>
        Gestao
      </Button>
      <Button variant="outline" onClick={() => navigate('/')}>
        Cliente
      </Button>
    </div>
  </div>
)}
```

### 3. Consideracoes de Seguranca

- O bypass so aparece em modo desenvolvimento (`import.meta.env.DEV`)
- Em producao, esses botoes nao serao visiveis
- As paginas protegidas ainda devem verificar autenticacao real

### 4. Limitacoes

- Este bypass apenas navega para as rotas, nao cria sessao real
- Paginas que verificam `user` do contexto podem redirecionar de volta ao login
- Para teste completo, recomenda-se usar um usuario de teste real cadastrado na base

## Resultado Esperado

Na tela de login (apenas em DEV):
- Caixa amarela com titulo "Modo Desenvolvimento - Bypass"
- 3 botoes: Admin, Gestao, Cliente
- Clique navega diretamente para a rota correspondente
