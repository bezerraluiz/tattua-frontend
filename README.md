# Tattua Frontend

Aplicação React + Vite + Tailwind para gerenciamento de orçamentos de estúdios de tatuagem.

 
## Funcionalidades (MVP)

- Landing page dark com tom roxo
- Autenticação (mock local) + cadastro com confirmação de senha
- Criação de orçamentos com campos dinâmicos e cálculo automático
- Campos personalizados (select ou texto com valor base)
- Listagem, busca e filtro básico por cliente
- Exportar orçamento em PDF (layout de tabela básico)
- Página de plano (billing) com valor fixo R$80/mês (simulação Stripe)
- Configuração de campos e valores
- Perfil do usuário + endereço com máscaras (CPF/CNPJ, CEP) e auto-preenchimento ViaCEP
- Sistema de toasts (sucesso/erro)

## Executar

Instalar dependências:

```bash
npm install
```

Rodar ambiente de desenvolvimento:

```bash
npm run dev
```

Build produção:

```bash
npm run build
```

Preview:

```bash
npm run preview
```

## Variáveis de Ambiente

Criar arquivo `.env` na raiz com:

```bash
VITE_STRIPE_PK=pk_test_sua_chave_publica
```

Se não definido, usa placeholder.

## Próximos Passos

- Integração real com Stripe (backend + webhooks)
- Autenticação JWT/OAuth
- Persistência via API (atualmente estado em memória)
- Testes unitários
- Internacionalização
