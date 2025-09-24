# Chatbot Widget

Um widget de chatbot AI completo e acessível para a Clínica Saraiva Vision, com conformidade CFM e LGPD.

## Características Principais

### 🎨 Design Moderno
- Interface responsiva com glass morphism
- Suporte a temas claro, escuro e automático
- Animações suaves e transições
- Posicionamento flexível (canto inferior direito/esquerdo, centro)

### ♿ Acessibilidade (WCAG 2.1 AA)
- Suporte completo a leitores de tela
- Navegação por teclado
- Anúncios de mensagens para usuários com deficiência visual
- Contraste adequado e texto alternativo
- Suporte a preferências de movimento reduzido

### 🔄 Recursos em Tempo Real
- Conexão WebSocket para comunicação instantânea
- Indicadores de digitação em tempo real
- Status de entrega de mensagens (enviado, entregue, lido)
- Recuperação automática de sessões
- Reconexão automática em caso de perda de conexão

### 🏥 Conformidade Médica (CFM)
- Filtros de segurança médica
- Avisos obrigatórios para conteúdo médico
- Detecção automática de emergências
- Redirecionamento para consulta presencial quando necessário
- Proibição de diagnósticos e prescrições via chat

### 🔒 Proteção de Dados (LGPD)
- Criptografia end-to-end das conversas
- Gerenciamento de consentimento do usuário
- Retenção automática de dados com expiração
- Direitos do usuário (exclusão, portabilidade)
- Auditoria completa de acesso aos dados

## Uso Básico

```jsx
import { ChatbotWidget } from './components/chatbot';

function App() {
  return (
    <div>
      {/* Seu conteúdo */}
      
      <ChatbotWidget
        theme="auto"
        position="bottom-right"
        enableAppointmentBooking={true}
        enableReferralRequests={true}
        enableRealtime={true}
        complianceMode="strict"
        initialMessage="Olá! Como posso ajudá-lo hoje?"
      />
    </div>
  );
}
```

## Propriedades

| Propriedade | Tipo | Padrão | Descrição |
|-------------|------|--------|-----------|
| `theme` | `'auto' \| 'light' \| 'dark'` | `'auto'` | Tema do widget |
| `position` | `'bottom-right' \| 'bottom-left' \| 'center'` | `'bottom-right'` | Posição na tela |
| `enableAppointmentBooking` | `boolean` | `true` | Habilita agendamento de consultas |
| `enableReferralRequests` | `boolean` | `true` | Habilita solicitação de encaminhamentos |
| `enableRealtime` | `boolean` | `true` | Habilita recursos em tempo real |
| `complianceMode` | `'strict' \| 'standard'` | `'strict'` | Modo de conformidade |
| `initialMessage` | `string` | - | Mensagem de boas-vindas personalizada |
| `className` | `string` | `''` | Classes CSS adicionais |

## Componentes Inclusos

### ChatbotWidget
Componente principal do widget de chat.

### ChatMessage
Componente individual de mensagem com suporte a:
- Diferentes tipos de mensagem (usuário, assistente, sistema, erro)
- Botões de ação (agendamento, encaminhamento)
- Avisos médicos e de emergência
- Status de entrega

### RealtimeTypingIndicator
Indicador de digitação em tempo real com animações suaves.

### ConnectionStatus
Mostra o status da conexão WebSocket com opções de reconexão.

### SessionRecovery
Permite recuperar sessões anteriores do usuário.

### ComplianceNotice
Exibe avisos de conformidade CFM e LGPD.

### QuickActions
Botões de ação rápida para WhatsApp, agendamento, localização e emergência.

## Hooks Personalizados

### useChatbotState
Gerencia o estado principal do chatbot:
- Mensagens da conversa
- Estado de carregamento
- Gerenciamento de erros
- Comunicação com API

### useChatbotRealtime
Gerencia recursos em tempo real:
- Conexão WebSocket
- Indicadores de digitação
- Status de mensagens
- Recuperação de sessão

### useChatbotAccessibility
Recursos de acessibilidade:
- Anúncios para leitores de tela
- Gerenciamento de foco
- Navegação por teclado
- Suporte a preferências do usuário

## Serviços

### chatbotWebSocketService
Serviço singleton para gerenciar conexões WebSocket:
- Conexão automática e reconexão
- Heartbeat para manter conexão ativa
- Fila de mensagens para entrega garantida
- Eventos de conexão e desconexão

## Estilos CSS

O widget inclui estilos CSS personalizados em `src/styles/chatbot.css`:
- Efeitos de glass morphism
- Animações suaves
- Suporte a modo escuro
- Responsividade
- Acessibilidade

## Testes

Testes abrangentes incluídos:
- Testes unitários para todos os componentes
- Testes de integração para recursos em tempo real
- Testes de acessibilidade
- Mocks para WebSocket e APIs

Execute os testes:
```bash
npm test src/components/chatbot
```

## Demonstração

Use o componente `ChatbotWidgetDemo` para ver todas as funcionalidades:

```jsx
import { ChatbotWidgetDemo } from './components/chatbot';

function DemoPage() {
  return <ChatbotWidgetDemo />;
}
```

## Configuração do Backend

O widget requer endpoints de API correspondentes:
- `POST /api/chatbot/chat` - Envio de mensagens
- `WS /api/chatbot/websocket` - Conexão WebSocket
- `POST /api/chatbot/session` - Gerenciamento de sessão

## Conformidade e Segurança

### CFM (Conselho Federal de Medicina)
- Todos os conteúdos médicos incluem disclaimers obrigatórios
- Detecção automática de tentativas de diagnóstico
- Redirecionamento para consulta presencial
- Proibição de prescrições via chat

### LGPD (Lei Geral de Proteção de Dados)
- Consentimento explícito para processamento de dados
- Criptografia de dados em trânsito e em repouso
- Direito ao esquecimento (exclusão de dados)
- Portabilidade de dados
- Auditoria completa de acesso

## Suporte a Navegadores

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Contribuição

Para contribuir com o desenvolvimento:

1. Siga as diretrizes de acessibilidade WCAG 2.1 AA
2. Mantenha conformidade com CFM e LGPD
3. Inclua testes para novas funcionalidades
4. Documente mudanças na API

## Licença

Propriedade da Clínica Saraiva Vision. Todos os direitos reservados.