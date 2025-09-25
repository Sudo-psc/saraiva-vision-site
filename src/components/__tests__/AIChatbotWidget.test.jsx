import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import AIChatbotWidget from '../AIChatbotWidget';
import { clinicInfo } from '../../lib/clinicInfo';

// Mock do clinicInfo
jest.mock('../../lib/clinicInfo', () => ({
  clinicInfo: {
    aiChatbotId: '68d52f7bf91669800d0923ac'
  }
}));

// Mock do DOM para simular carregamento de script
const mockScript = {
  src: '',
  async: false,
  setAttribute: jest.fn(),
  onload: null,
  onerror: null,
  parentNode: {
    removeChild: jest.fn()
  }
};

// Mock do document.createElement
const originalCreateElement = document.createElement;
beforeEach(() => {
  document.createElement = jest.fn().mockImplementation((tagName) => {
    if (tagName === 'script') {
      return mockScript;
    }
    return originalCreateElement(tagName);
  });
  
  document.body = {
    appendChild: jest.fn(),
    removeChild: jest.fn()
  };
  
  document.querySelector = jest.fn().mockReturnValue(null);
});

afterEach(() => {
  document.createElement = originalCreateElement;
  jest.clearAllMocks();
});

describe('AIChatbotWidget', () => {
  test('renderiza corretamente quando habilitado', () => {
    render(<AIChatbotWidget enabled={true} />);
    
    expect(screen.getByLabelText('Chatbot de IA da Saraiva Vision')).toBeInTheDocument();
  });

  test('não renderiza quando desabilitado', () => {
    render(<AIChatbotWidget enabled={false} />);
    
    expect(screen.queryByLabelText('Chatbot de IA da Saraiva Vision')).not.toBeInTheDocument();
  });

  test('carrega o script do chatbot corretamente', async () => {
    render(<AIChatbotWidget enabled={true} />);
    
    await waitFor(() => {
      expect(document.createElement).toHaveBeenCalledWith('script');
      expect(mockScript.src).toBe('https://cdn.pulse.is/livechat/loader.js');
      expect(mockScript.setAttribute).toHaveBeenCalledWith('data-live-chat-id', '68d52f7bf91669800d0923ac');
      expect(mockScript.async).toBe(true);
    });
  });

  test('não carrega script se já existe', () => {
    document.querySelector = jest.fn().mockReturnValue(mockScript);
    
    render(<AIChatbotWidget enabled={true} />);
    
    expect(document.createElement).not.toHaveBeenCalledWith('script');
  });

  test('limpa o script no unmount', () => {
    const { unmount } = render(<AIChatbotWidget enabled={true} />);
    
    unmount();
    
    expect(mockScript.parentNode.removeChild).toHaveBeenCalledWith(mockScript);
  });

  test('aplica classes CSS corretas', () => {
    render(<AIChatbotWidget className="custom-class" position="bottom-left" />);
    
    const widget = screen.getByLabelText('Chatbot de IA da Saraiva Vision');
    expect(widget).toHaveClass('ai-chatbot-widget', 'custom-class');
    expect(widget).toHaveAttribute('data-position', 'bottom-left');
  });

  test('mostra mensagem de carregamento inicialmente', () => {
    render(<AIChatbotWidget enabled={true} />);
    
    expect(screen.getByText('Carregando chatbot de IA...')).toBeInTheDocument();
  });
});