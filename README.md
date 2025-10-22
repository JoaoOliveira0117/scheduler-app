# ServPlat - Plataforma de Serviços MVP

Este é um MVP (Minimum Viable Product) de uma plataforma de serviços desenvolvida em React Native com Expo, seguindo as especificações da planilha de entregas.

## 🚀 Funcionalidades Implementadas

### Entrega 1 - Cadastro de Pessoas ✅
- **Formulário de cadastro** com validação de campos obrigatórios
- **Formulário de login** com validação de credenciais
- **Armazenamento de usuários** em SQLite com dados consistentes
- **Mecanismo de autenticação** com sessão ativa
- **Validações implementadas:**
  - Email: formato válido e único
  - Senha: mínimo 6 caracteres com letra e número
  - Telefone: formato brasileiro (XX) XXXXX-XXXX
  - Nome: obrigatório
  - Tipo de usuário: cliente ou prestador

### Entrega 1 - Cadastro de Serviços ✅
- **Formulário de cadastro de serviços** com validação
- **Armazenamento de serviços** em SQLite
- **Validações implementadas:**
  - Título e descrição obrigatórios
  - Preço maior que 0 e menor que 999999.99
  - Tipo de preço: fixo, por_hora ou orçamento
  - Cidade obrigatória
  - Verificação de prestador existente

### Entrega 2 - Edição e Exclusão de Serviços ✅
- **Edição de serviços** com validação
- **Exclusão de serviços** com confirmação
- **Alterações refletidas** corretamente no banco

### Entrega 2 - Cadastro de Agenda ✅
- **Formulário de cadastro de agenda** com horários válidos
- **Definição de horários disponíveis** por dia da semana
- **Armazenamento da agenda** em SQLite
- **Validações implementadas:**
  - Dia da semana: 0 (domingo) a 6 (sábado)
  - Horários: formato HH:MM válido
  - Horário de início anterior ao fim
  - Verificação de conflitos de agendamento

### Entrega 2 - Consulta/Busca de Serviços ✅
- **Tela de busca de serviços** implementada
- **Filtros por:**
  - Nome/descrição do serviço
  - Categoria
  - Cidade
  - Faixa de preço
  - Tipo de preço
  - Avaliação mínima
- **Usuário encontra serviços** pelo nome ou filtros

## 🛠️ Tecnologias Utilizadas

- **React Native** com Expo
- **TypeScript** para tipagem estática
- **SQLite** com expo-sqlite para armazenamento local
- **Expo Router** para navegação
- **Context API** para gerenciamento de estado de autenticação

## 📱 Estrutura do Projeto

```
├── app/                    # Rotas do Expo Router
│   ├── (tabs)/            # Navegação por tabs
│   │   ├── index.tsx      # Tela inicial
│   │   ├── search.tsx     # Busca de serviços
│   │   ├── profile.tsx    # Perfil e gerenciamento
│   │   ├── payments.tsx   # Pagamentos (placeholder)
│   │   └── reviews.tsx    # Avaliações (placeholder)
│   ├── auth.tsx           # Tela de autenticação
│   └── _layout.tsx        # Layout principal
├── components/            # Componentes reutilizáveis
├── contexts/              # Contextos React
│   └── AuthContext.tsx    # Contexto de autenticação
├── services/              # Serviços de negócio
│   ├── database.ts        # Configuração do SQLite
│   ├── userService.ts     # Serviços de usuário
│   ├── serviceService.ts  # Serviços de serviços
│   └── scheduleService.ts # Serviços de agenda
├── screens/               # Telas da aplicação
│   ├── AuthScreen.tsx     # Tela de autenticação
│   ├── LoginScreen.tsx    # Tela de login
│   └── RegisterScreen.tsx # Tela de cadastro
└── database/              # Scripts SQL
    ├── schema.sql         # Schema do banco
    └── seed.sql           # Dados iniciais
```

## 🗄️ Banco de Dados

O projeto utiliza SQLite com as seguintes tabelas:

- **users**: Usuários (clientes e prestadores)
- **service_categories**: Categorias de serviços
- **services**: Serviços oferecidos
- **available_schedules**: Horários disponíveis
- **appointments**: Agendamentos
- **reviews**: Avaliações (estrutura preparada)

## 🚀 Como Executar

1. **Instalar dependências:**
   ```bash
   npm install
   ```

2. **Executar o projeto:**
   ```bash
   npm start
   ```

3. **Escolher a plataforma:**
   - Pressione `a` para Android
   - Pressione `i` para iOS
   - Pressione `w` para Web

## 📋 Validações Implementadas

### Usuários
- Email único e formato válido
- Senha com mínimo 6 caracteres, incluindo letra e número
- Telefone no formato brasileiro
- Nome obrigatório
- Tipo de usuário válido

### Serviços
- Título e descrição obrigatórios
- Preço válido (0 < preço < 999999.99)
- Tipo de preço válido
- Cidade obrigatória
- Prestador existente

### Agenda
- Dia da semana válido (0-6)
- Horários no formato HH:MM
- Horário de início anterior ao fim
- Verificação de conflitos

## 🎯 Próximos Passos

Para completar o MVP, as seguintes funcionalidades podem ser implementadas:

1. **Sistema de agendamento** completo
2. **Notificações** de agendamentos
3. **Sistema de avaliações** e comentários
4. **Integração com pagamentos**
5. **Upload de imagens** para serviços
6. **Geolocalização** para busca por proximidade
7. **Chat** entre cliente e prestador

## 📝 Notas Técnicas

- O banco de dados é inicializado automaticamente na primeira execução
- Dados de exemplo são inseridos automaticamente
- Validações são feitas tanto no frontend quanto no backend
- A estrutura está preparada para expansão futura
- Código organizado seguindo boas práticas de desenvolvimento