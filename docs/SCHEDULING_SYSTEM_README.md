# Sistema de Agendamento Online - Saraiva Vision

## 📋 Visão Geral

Sistema completo de agendamento online para a Clínica Oftalmológica Saraiva Vision, integrado com a API do Ninsaúde Clinic. Interface moderna, responsiva e acessível construída com React, Next.js e shadcn/ui.

## ✨ Características Principais

### Interface do Usuário
- ✅ Design moderno e responsivo (mobile-first)
- ✅ Calendário interativo com shadcn/ui
- ✅ Seleção de horários em tempo real
- ✅ Formulário completo com validações
- ✅ Máscaras automáticas (telefone)
- ✅ Modais de confirmação e sucesso
- ✅ Feedback visual (loading, toasts, erros)
- ✅ Identidade visual da Saraiva Vision

### Funcionalidades
- ✅ Consulta de horários disponíveis em tempo real
- ✅ Atualização automática após agendamento
- ✅ Validação completa de formulário
- ✅ Conformidade LGPD
- ✅ Integração WhatsApp para confirmação
- ✅ Links rápidos para serviços relacionados
- ✅ Tratamento robusto de erros

### Acessibilidade
- ✅ Semântica HTML correta
- ✅ ARIA labels e roles
- ✅ Navegação por teclado
- ✅ Alto contraste
- ✅ Textos alternativos

## 📁 Estrutura de Arquivos

```
src/
├── components/
│   ├── scheduling/
│   │   └── AppointmentScheduler.jsx       # Componente principal
│   └── ui/                                 # Componentes shadcn/ui
│       ├── calendar.tsx
│       ├── card.tsx
│       ├── button.tsx
│       ├── input.tsx
│       ├── select.tsx
│       ├── dialog.tsx
│       ├── toast.tsx
│       ├── label.tsx
│       ├── checkbox.tsx
│       └── toaster.tsx
├── hooks/
│   ├── useNinsaudeScheduling.js           # Hook de integração API
│   ├── usePhoneMask.js                    # Hook de máscara telefone
│   └── use-toast.ts                       # Hook de toasts shadcn/ui
├── pages/
│   └── AgendamentoOnline.jsx              # Página principal
└── lib/
    └── utils.ts                            # Utilitários (cn helper)

docs/
└── NINSAUDE_INTEGRATION_GUIDE.md          # Documentação técnica completa

components.json                             # Configuração shadcn/ui
```

## 🚀 Instalação

### 1. Instalar Dependências

```bash
cd /home/saraiva-vision-site

# Instalar react-day-picker (necessário para Calendar)
npm install react-day-picker@^8.10.0 --legacy-peer-deps

# Componentes shadcn/ui já instalados:
# - calendar, select, input, button, dialog, toast, label, checkbox, card
```

### 2. Configurar Variáveis de Ambiente

Adicione ao arquivo `.env`:

```env
REACT_APP_NINSAUDE_API_URL=https://api.ninsaude.com/v1
REACT_APP_NINSAUDE_API_KEY=sua_chave_api_ninsaude
```

### 3. Adicionar Rota

**Para React Router (Vite):**

```javascript
// src/main.jsx ou src/App.jsx
import AgendamentoOnline from './pages/AgendamentoOnline';

// Adicionar rota
{
  path: '/agendamento',
  element: <AgendamentoOnline />
}
```

**Para Next.js:**

```javascript
// app/agendamento/page.tsx
import AgendamentoOnline from '@/pages/AgendamentoOnline';

export default AgendamentoOnline;
```

### 4. Adicionar Toaster ao Layout Principal

```javascript
// src/App.jsx ou app/layout.tsx
import { Toaster } from '@/components/ui/toaster';

function App() {
  return (
    <>
      {/* Seu layout */}
      <Toaster />
    </>
  );
}
```

## 🎨 Personalização de Cores

As cores já estão alinhadas com a identidade visual da Saraiva Vision através do `tailwind.config.js`:

```javascript
primary: {
  500: '#1E4D4C',  // Azul petróleo base
  600: '#173F3E',  // Azul petróleo escuro (botões)
  700: '#0F3B3A',  // Azul petróleo muito escuro (títulos)
}
```

## 📱 Uso do Sistema

### Fluxo do Paciente

1. **Seleção de Data**
   - Calendário interativo
   - Domingos desabilitados
   - Datas passadas bloqueadas

2. **Seleção de Horário**
   - Horários carregados automaticamente
   - Apenas slots disponíveis exibidos
   - Atualização em tempo real

3. **Preenchimento do Formulário**
   - Nome completo
   - E-mail
   - Telefone (com máscara automática)
   - Motivo da consulta
   - Observações (opcional)
   - Consentimento LGPD

4. **Confirmação**
   - Revisão dos dados
   - Modal de confirmação
   - Botão para WhatsApp

5. **Sucesso**
   - Modal com detalhes do agendamento
   - Protocolo gerado
   - Instruções de comparecimento
   - Opção de confirmar via WhatsApp

## 🔌 Integração com API Ninsaúde

### Hook useNinsaudeScheduling

```javascript
import { useNinsaudeScheduling } from '@/hooks/useNinsaudeScheduling';

const { 
  loading, 
  error, 
  fetchAvailableSlots, 
  createAppointment, 
  cancelAppointment 
} = useNinsaudeScheduling();

// Buscar horários
const slots = await fetchAvailableSlots(new Date('2025-10-15'));

// Criar agendamento
const result = await createAppointment({
  patientName: 'João Silva',
  patientEmail: 'joao@email.com',
  patientPhone: '33988776655',
  date: '2025-10-15',
  time: '08:00',
  reason: 'consulta-rotina',
  lgpdConsent: true,
});
```

### Endpoints Utilizados

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/schedule/available` | Busca horários disponíveis |
| POST | `/schedule/appointments` | Cria novo agendamento |
| DELETE | `/schedule/appointments/:id` | Cancela agendamento |

Documentação completa: `docs/NINSAUDE_INTEGRATION_GUIDE.md`

## 🛡️ Segurança e LGPD

### Dados Coletados
- Nome completo
- E-mail
- Telefone
- Motivo da consulta
- Observações (opcional)

### Conformidade
- ✅ Checkbox de consentimento obrigatório
- ✅ Link para Política de Privacidade
- ✅ Timestamp do consentimento enviado à API
- ✅ Dados enviados diretamente ao Ninsaúde
- ✅ Sem armazenamento local persistente

## ♿ Acessibilidade (a11y)

- ✅ Navegação por teclado completa
- ✅ ARIA labels em todos os elementos interativos
- ✅ Contraste de cores WCAG AAA
- ✅ Textos alternativos em ícones
- ✅ Feedback sonoro para leitores de tela
- ✅ Focus visível em elementos focáveis
- ✅ Estrutura semântica HTML5

## 📊 Validações Implementadas

### Formulário
| Campo | Validação |
|-------|-----------|
| Nome | Obrigatório, mín. 3 caracteres |
| E-mail | Obrigatório, formato válido |
| Telefone | Obrigatório, mín. 10 dígitos |
| Motivo | Obrigatório |
| LGPD | Obrigatório (checkbox) |

### Agendamento
- Data não pode ser anterior ao dia atual
- Horário deve estar disponível
- Atualização automática após cada agendamento

## 🧪 Testes

### Testar Localmente

```bash
# Modo desenvolvimento
npm run dev

# Acessar
http://localhost:3000/agendamento
```

### Cenários de Teste

1. **Fluxo completo de sucesso**
   - Selecionar data futura
   - Escolher horário disponível
   - Preencher formulário válido
   - Confirmar agendamento

2. **Validações de formulário**
   - Tentar agendar sem preencher campos
   - E-mail inválido
   - Telefone incompleto
   - Sem aceitar LGPD

3. **Erros de API**
   - Simular falha na API
   - Timeout de requisição
   - Horário já ocupado

4. **Responsividade**
   - Mobile (320px - 768px)
   - Tablet (768px - 1024px)
   - Desktop (1024px+)

## 🎯 Próximas Melhorias

- [ ] Cache de horários disponíveis (Redis/LocalStorage)
- [ ] Notificações por e-mail
- [ ] Lembretes automáticos (SMS/WhatsApp)
- [ ] Painel do paciente (gerenciar agendamentos)
- [ ] Integração Google Calendar
- [ ] Sistema de fila de espera
- [ ] Agendamentos recorrentes
- [ ] Multi-idioma (PT/EN/ES)
- [ ] Análise de conversão (Google Analytics)
- [ ] A/B Testing de interface

## 🐛 Solução de Problemas

### Erro: "Cannot find module '@/components/ui/calendar'"

```bash
npx shadcn@latest add calendar
```

### Erro: "date-fns peer dependency"

```bash
npm install react-day-picker@^8.10.0 --legacy-peer-deps
```

### Calendário não renderiza

Verifique se `react-day-picker` está instalado:
```bash
npm list react-day-picker
```

### API retorna erro 401

Verifique a variável de ambiente:
```bash
echo $REACT_APP_NINSAUDE_API_KEY
```

### Toasts não aparecem

Adicione `<Toaster />` ao layout principal:
```javascript
import { Toaster } from '@/components/ui/toaster';
```

## 📞 Suporte

- **Desenvolvedor:** equipe@saraivavision.com.br
- **Documentação Ninsaúde:** https://docs.ninsaude.com
- **Issues:** GitHub Issues do projeto

## 📄 Licença

Propriedade da Clínica Saraiva Vision - Todos os direitos reservados.

---

**Versão:** 1.0.0  
**Última Atualização:** Outubro 2025  
**Desenvolvido com ❤️ para Saraiva Vision**
