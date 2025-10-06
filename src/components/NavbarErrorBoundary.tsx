'use client';

/**
 * Error Boundary específico para o Navbar
 * Previne que erros #306 quebrem toda a aplicação
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';
import Link from 'next/link';
import { Menu, Home, Phone } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

// Fallback simples do Navbar
const NavbarFallback: React.FC = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white shadow-md">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo Fallback */}
          <Link href="/" className="text-xl font-bold text-cyan-600">
            Saraiva Vision
          </Link>

          {/* Navigation Fallback */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/" className="text-gray-700 hover:text-cyan-600 transition-colors">
              Início
            </Link>
            <Link href="/servicos" className="text-gray-700 hover:text-cyan-600 transition-colors">
              Serviços
            </Link>
            <Link href="/sobre" className="text-gray-700 hover:text-cyan-600 transition-colors">
              Sobre
            </Link>
            <Link href="/contato" className="text-gray-700 hover:text-cyan-600 transition-colors">
              Contato
            </Link>
            <Link href="/podcast" className="text-gray-700 hover:text-cyan-600 transition-colors">
              Podcast
            </Link>
          </nav>

          {/* Actions Fallback */}
          <div className="flex items-center gap-3">
            <a
              href="https://wa.me/5511999999999"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-cyan-600 text-white px-4 py-2 rounded-lg hover:bg-cyan-700 transition-colors flex items-center gap-2"
            >
              <Phone size={16} />
              <span className="hidden sm:inline">Agendar</span>
            </a>
          </div>

          {/* Mobile Menu Fallback */}
          <button className="md:hidden p-2 text-gray-600">
            <Menu size={24} />
          </button>
        </div>
      </div>
    </header>
  );
};

class NavbarErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    // Atualiza o state para mostrar a UI de fallback
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log detalhado do erro para debugging
    console.error('🚨 NavbarErrorBoundary caught error:', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      isMinifiedError: error.message.includes('Minified React error'),
      errorCode: error.message.match(/#(\d+)/)?.[1] || 'unknown',
      location: window.location.href
    });

    // Detalhes específicos para erro #306
    if (error.message.includes('Minified React error #306') ||
        error.message.includes('Element type is invalid')) {
      console.error('🔍 Navbar Error #306 Debug:', {
        message: 'Element type is invalid - likely undefined component in Navbar',
        possibleCauses: [
          'Import/export mismatch in child components',
          'Circular dependency in imports',
          'Component not properly exported',
          'Async component loading failed',
          'React Router vs Next.js routing conflict'
        ],
        recommendation: 'Using fallback navbar, check component imports',
        stackTrace: error.stack
      });
    }

    // Salvar no sessionStorage para análise
    try {
      const errorDetails = {
        component: 'Navbar',
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        timestamp: new Date().toISOString(),
        url: window.location.href,
        userAgent: navigator.userAgent,
        isNavbarError: true
      };
      sessionStorage.setItem('navbarError', JSON.stringify(errorDetails));
    } catch (e) {
      console.warn('Failed to save navbar error details:', e);
    }

    // Salvar estado do erro
    this.setState({ error, errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <>
          {/* Navbar Fallback */}
          <NavbarFallback />

          {/* Error Notice (apenas em desenvolvimento) */}
          {process.env.NODE_ENV === 'development' && (
            <div className="fixed top-20 right-4 z-50 bg-red-50 border border-red-200 rounded-lg p-4 max-w-md shadow-lg">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-5 h-5 bg-red-500 rounded-full mt-0.5"></div>
                <div>
                  <h4 className="font-medium text-red-800 text-sm">
                    Navbar Error (DEV)
                  </h4>
                  <p className="text-red-700 text-xs mt-1">
                    Error #306 detectado. Usando fallback navbar.
                  </p>
                  <button
                    onClick={() => window.location.reload()}
                    className="text-red-600 text-xs underline mt-2 hover:text-red-800"
                  >
                    Recarregar página
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      );
    }

    return this.props.children;
  }
}

export default NavbarErrorBoundary;