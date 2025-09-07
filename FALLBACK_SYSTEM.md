# Sistema de Fallback para Desenvolvimento

Este projeto foi configurado com um sistema de fallback que permite o desenvolvimento frontend mesmo quando a API backend não está disponível.

## Como Funciona

Quando uma requisição para a API falha (retorna 404 ou erro de conexão), o sistema automaticamente usa dados mock para simular as respostas da API.

## Configuração

O arquivo `src/config/api.ts` contém as configurações da API:

```typescript
export const API_CONFIG = {
  BASE_URL: 'http://localhost:3333/api/v1',
  USE_FALLBACK_DATA: true, // Ativa/desativa o fallback
  REQUEST_TIMEOUT: 10000,
};
```

## Rotas da API

- **GET** `/users?user_uid={uid}` - Buscar dados do usuário
- **PUT** `/users` - Atualizar dados do usuário  
- **POST** `/users/login` - Login do usuário
- **POST** `/users` - Registrar novo usuário
- **GET** `/quotes/user?user_uid={uid}` - Buscar orçamentos do usuário
- **POST** `/quotes` - Criar novo orçamento

## Funcionalidades com Fallback

### 1. Login (`LoginUser`)
- **API disponível**: Faz login real no backend
- **API indisponível**: Simula login bem-sucedido com tokens mock
- **Dados mock**: Retorna tokens de acesso e refresh simulados

### 2. Registro (`RegisterUser`)
- **API disponível**: Registra usuário no backend
- **API indisponível**: Simula registro bem-sucedido
- **Dados mock**: Retorna ID de usuário simulado

### 3. Perfil do Usuário (`GetUserProfile`)
- **API disponível**: Busca dados reais do usuário
- **API indisponível**: Retorna perfil mock com dados de exemplo
- **Dados mock**:
  ```javascript
  {
    studio_name: 'Meu Estúdio',
    email: 'artista@studio.com',
    tax_id: '12.345.678/0001-90',
    phone: '(11) 99999-9999',
    // ... outros campos
  }
  ```

### 4. Atualização de Perfil (`UpdateUserProfile`)
- **API disponível**: Atualiza dados no backend
- **API indisponível**: Simula atualização bem-sucedida
- **Comportamento**: Retorna os dados enviados como se tivessem sido salvos

### 5. Orçamentos (`GetQuotesByUserUid`)
- **API disponível**: Busca orçamentos reais do usuário
- **API indisponível**: Retorna lista de orçamentos mock
- **Dados mock**: 3-5 orçamentos variados com diferentes:
  - Clientes (Ana Silva, João Santos, etc.)
  - Valores (R$ 300 a R$ 2.200)
  - Status (aprovado, pendente)
  - Datas (últimos 15 dias)

### 6. Criação de Orçamento (`CreateQuote`)
- **API disponível**: Cria orçamento no backend
- **API indisponível**: Simula criação bem-sucedida
- **Comportamento**: Retorna o orçamento com ID gerado

## Logs de Desenvolvimento

O sistema mostra avisos no console quando está usando dados mock:

```
⚠️ API não disponível, usando dados locais de desenvolvimento
⚠️ Erro de conexão com API, usando dados locais de desenvolvimento
```

## Para Produção

Para usar em produção com API real:

1. Certifique-se de que a API backend está rodando em `http://localhost:3333`
2. Opcionalmente, altere `USE_FALLBACK_DATA: false` em `src/config/api.ts` para desativar o fallback

## Vantagens do Sistema

1. **Desenvolvimento Independente**: Frontend pode ser desenvolvido sem depender do backend
2. **Testes de UI**: Interface pode ser testada com dados variados
3. **Demonstrações**: Aplicação pode ser demonstrada mesmo sem backend
4. **Onboarding**: Novos desenvolvedores podem começar a trabalhar imediatamente

## Estrutura dos Dados Mock

### Dashboard
- Orçamentos com datas variadas (últimos 15 dias)
- Valores diversificados para testar métricas
- Status diferentes para testar filtros
- Dados suficientes para gráficos e estatísticas

### Perfil
- Dados completos incluindo endereço
- Telefone formatado corretamente
- CNPJ válido para testes
- Dados realistas para validação de UI

### Autenticação
- Tokens simulados com timestamp
- Estrutura idêntica à API real
- Suporte a fluxo completo de login/logout
