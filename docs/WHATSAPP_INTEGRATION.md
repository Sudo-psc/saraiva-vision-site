# WhatsApp Integration Documentation

## Overview

The WhatsApp integration provides a comprehensive floating widget system for Saraiva Vision clinic, enabling patients to easily contact the clinic through their preferred communication channel. The implementation includes business hours detection, professional greeting messages, analytics tracking, and full accessibility compliance.

## Features

### Core Features
- **Floating Widget**: Responsive floating button with customizable positioning
- **Professional Greeting**: Contextual greeting messages with doctor avatar
- **Business Hours Detection**: Visual indicators and after-hours messaging
- **Deep Linking**: Pre-filled messages with clinic information
- **Mobile Optimization**: Native WhatsApp app integration on mobile devices
- **Analytics Tracking**: Google Analytics and PostHog integration
- **Accessibility**: WCAG 2.1 AA compliance with keyboard navigation

### Advanced Features
- **Auto-hide Greeting**: Configurable timing for greeting display
- **Pulse Animation**: Visual feedback during business hours
- **Contextual Messages**: Time-based and page-specific greetings
- **Error Handling**: Graceful fallbacks for service failures
- **Rate Limiting**: Spam protection with IP-based throttling

## Components

### WhatsappWidget
Main widget component with full feature set.

```jsx
import WhatsappWidget from '@/components/WhatsappWidget';

<WhatsappWidget
  phoneNumber="5511999999999"
  messageType="appointment"
  position="bottom-right"
  showGreeting={true}
  greetingDelay={3000}
  customGreeting="Custom greeting message"
  className="custom-class"
/>
```

#### Props
- `phoneNumber` (string): WhatsApp number in international format
- `messageType` (string): Type of message ('default', 'appointment', 'services', 'emergency', 'contact')
- `position` (string): Widget position ('bottom-right', 'bottom-left', 'top-right', 'top-left')
- `showGreeting` (boolean): Whether to show greeting message
- `greetingDelay` (number): Delay before showing greeting (ms)
- `customGreeting` (string): Custom greeting message
- `className` (string): Additional CSS classes

### useWhatsAppWidget Hook
React hook for managing widget state and interactions.

```jsx
import { useWhatsAppWidget } from '@/hooks/useWhatsAppWidget';

const {
  isVisible,
  isGreetingVisible,
  businessHours,
  showWidget,
  hideWidget,
  trackWhatsAppClick
} = useWhatsAppWidget({
  autoShow: true,
  showDelay: 3000,
  trackAnalytics: true
});
```

### WhatsApp Utilities
Utility functions for WhatsApp URL generation and analytics.

```jsx
import {
  generateWhatsAppUrl,
  openWhatsApp,
  getContextualGreeting,
  validateWhatsAppNumber
} from '@/utils/whatsappUtils';

// Generate WhatsApp URL
const url = generateWhatsAppUrl({
  phoneNumber: '5511999999999',
  message: 'Custom message',
  messageType: 'appointment'
});

// Open WhatsApp with tracking
openWhatsApp({
  messageType: 'services'
});

// Get contextual greeting
const greeting = getContextualGreeting({
  page: 'services',
  userAction: 'form_error'
});
```

## Configuration

### WhatsApp Configuration File
Located at `src/config/whatsapp.js`

```javascript
export const whatsappConfig = {
  // Clinic's official WhatsApp number
  phoneNumber: "5511999999999",
  
  // Default messages by type
  messages: {
    default: "Olá! Gostaria de agendar uma consulta...",
    appointment: "Olá! Gostaria de agendar uma consulta...",
    services: "Olá! Tenho interesse em conhecer mais...",
    emergency: "Olá! Preciso de atendimento oftalmológico urgente...",
    contact: "Olá! Gostaria de entrar em contato..."
  },
  
  // Widget appearance
  widget: {
    position: "bottom-right",
    showGreeting: true,
    greetingDelay: 3000,
    greetingAutoHide: 10000,
    pulseAnimation: true,
    showTooltip: true
  },
  
  // Professional greeting
  greeting: {
    title: "Clínica Saraiva Vision",
    message: "Olá! 👋 Precisa de ajuda?...",
    avatar: "/img/drphilipe_perfil.webp",
    showAvatar: true,
    showOnlineStatus: true
  },
  
  // Business hours
  businessHours: {
    enabled: true,
    timezone: "America/Sao_Paulo",
    schedule: {
      monday: { open: "08:00", close: "18:00" },
      tuesday: { open: "08:00", close: "18:00" },
      wednesday: { open: "08:00", close: "18:00" },
      thursday: { open: "08:00", close: "18:00" },
      friday: { open: "08:00", close: "18:00" },
      saturday: { closed: true },
      sunday: { closed: true }
    },
    afterHoursMessage: "Obrigado pelo contato! Nosso horário..."
  },
  
  // Analytics tracking
  analytics: {
    trackClicks: true,
    eventCategory: "engagement",
    eventAction: "whatsapp_click",
    eventLabel: "whatsapp_widget"
  },
  
  // Accessibility
  accessibility: {
    ariaLabel: "Entrar em contato via WhatsApp",
    tooltip: "Fale conosco no WhatsApp",
    closeButtonLabel: "Fechar mensagem",
    keyboardNavigation: true
  }
};
```

## Styling

### CSS Classes
The widget uses Tailwind CSS classes with custom animations defined in `src/styles/whatsapp-widget.css`.

#### Key Classes
- `.whatsapp-widget`: Main widget button
- `.whatsapp-greeting`: Greeting message container
- `.animate-fade-in`: Fade-in animation
- `.animate-pulse-slow`: Slow pulse animation
- `.animate-bounce-in`: Bounce-in animation

#### Responsive Design
- Mobile-first approach with `sm:` breakpoints
- Touch-friendly button sizes (minimum 44px)
- Optimized spacing for different screen sizes

#### Dark Mode Support
- Automatic dark mode detection
- Appropriate color schemes for greeting messages
- High contrast mode support

### Accessibility Features
- WCAG 2.1 AA compliance
- Keyboard navigation support
- Screen reader compatibility
- Focus management
- High contrast mode support
- Reduced motion support

## Business Hours

### Configuration
Business hours are configured in the `whatsappConfig.businessHours` object with timezone support.

### Detection Logic
```javascript
import { isWithinBusinessHours } from '@/config/whatsapp';

const isOpen = isWithinBusinessHours();
// Returns true if within configured business hours
```

### Visual Indicators
- Green status indicator during business hours
- Orange clock icon when closed
- Different button colors based on status
- After-hours message in greeting

## Analytics Integration

### Google Analytics
Tracks WhatsApp interactions with custom events:

```javascript
gtag('event', 'whatsapp_click', {
  event_category: 'engagement',
  event_label: 'whatsapp_widget_appointment',
  custom_parameters: {
    business_hours: true,
    message_type: 'appointment'
  }
});
```

### PostHog Analytics
Captures detailed interaction data:

```javascript
posthog.capture('whatsapp_click', {
  source: 'widget',
  message_type: 'appointment',
  business_hours: true
});
```

## Mobile Optimization

### Native App Integration
- Detects mobile devices using user agent
- Uses `whatsapp://` scheme for native app
- Falls back to web version on desktop

### Responsive Design
- Touch-friendly button sizes
- Optimized positioning for mobile screens
- Gesture-friendly interactions

## Testing

### Unit Tests
- Component rendering and interaction tests
- Utility function validation
- Hook state management tests
- Analytics tracking verification

### Integration Tests
- End-to-end user workflows
- Cross-browser compatibility
- Mobile device testing
- Accessibility compliance testing

### Test Files
- `src/components/__tests__/WhatsappWidget.test.jsx`
- `src/__tests__/whatsappUtils.test.js`
- `src/__tests__/useWhatsAppWidget.test.js`

## Performance Considerations

### Lazy Loading
- Widget loads after initial page render
- Greeting appears with configurable delay
- Analytics scripts load asynchronously

### Bundle Size
- Tree-shakable utility functions
- Minimal external dependencies
- Optimized icon usage

### Caching
- Configuration cached in memory
- Business hours checked periodically
- Analytics events batched when possible

## Security

### Data Privacy
- No personal data stored in widget
- LGPD compliance for Brazilian users
- Minimal data collection

### Input Validation
- Phone number format validation
- Message content sanitization
- XSS prevention measures

## Deployment

### Environment Variables
```bash
# WhatsApp Configuration
WHATSAPP_PHONE_NUMBER=5511999999999
WHATSAPP_BUSINESS_HOURS_ENABLED=true

# Analytics
GOOGLE_ANALYTICS_ID=GA_MEASUREMENT_ID
POSTHOG_KEY=phc_your_posthog_key
```

### Build Configuration
The widget is included in the main application bundle and requires no additional build steps.

## Troubleshooting

### Common Issues

#### Widget Not Appearing
- Check if `isWidgetVisible` state is true
- Verify CSS z-index conflicts
- Ensure proper import paths

#### Analytics Not Tracking
- Verify analytics scripts are loaded
- Check console for JavaScript errors
- Confirm tracking IDs are correct

#### Business Hours Not Working
- Verify timezone configuration
- Check system clock accuracy
- Ensure proper date format in schedule

#### Mobile App Not Opening
- Verify WhatsApp is installed
- Check URL scheme handling
- Test on different devices

### Debug Mode
Enable debug logging by setting:
```javascript
window.whatsappDebug = true;
```

## Requirements Compliance

This implementation satisfies all requirements from Requirement 10:

### 10.1 - Prominent Display ✅
- Fixed positioning with high z-index
- Easily accessible floating button
- Responsive design for all screen sizes

### 10.2 - Deep Linking ✅
- Generates proper WhatsApp URLs
- Pre-fills clinic phone number
- Includes contextual messages

### 10.3 - Professional Greeting ✅
- Configurable greeting messages
- Doctor avatar display
- Business hours context

### 10.4 - Non-Interference ✅
- Proper z-index management
- No scroll blocking
- Accessibility compliance

### 10.5 - Mobile Compatibility ✅
- Native WhatsApp app integration
- Touch-friendly interface
- Responsive positioning

## Future Enhancements

### Planned Features
- Multi-language support
- Advanced scheduling integration
- Custom theme support
- Enhanced analytics dashboard
- A/B testing capabilities

### Performance Optimizations
- Service worker caching
- Progressive loading
- Image optimization
- Bundle splitting

## Support

For technical support or feature requests, please refer to the project documentation or contact the development team.