import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import {
  Search,
  Home,
  Calendar,
  Stethoscope,
  Eye,
  FileText,
  Headphones,
  User,
  HelpCircle,
  ArrowLeft,
  Bug,
  ExternalLink,
  Mail,
  MapPin,
  Phone
} from 'lucide-react';
import { Button } from '../components/ui/button.jsx';
import { Input } from '../components/ui/input.jsx';
import { Textarea } from '../components/ui/textarea.jsx';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card.jsx';
import { Alert, AlertDescription } from '../components/ui/Alert.jsx';
import { toast } from '../components/ui/use-toast.js';

import NotFoundContent from '../components/NotFound/NotFoundContent.jsx';
import SearchBar from '../components/NotFound/SearchBar.jsx';
import QuickLinks from '../components/NotFound/QuickLinks.jsx';
import BugReportForm from '../components/NotFound/BugReportForm.jsx';
import ErrorTracking from '../components/NotFound/ErrorTracking.jsx';

const NotFoundPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [showBugReport, setShowBugReport] = useState(false);
  const [trackingData, setTrackingData] = useState(null);

  useEffect(() => {
    // Initialize error tracking for 404 page
    const trackingInfo = {
      timestamp: new Date().toISOString(),
      attemptedUrl: location.pathname + location.search,
      referrer: document.referrer || 'direct',
      userAgent: navigator.userAgent,
      sessionId: sessionStorage.getItem('sessionId') || 'unknown'
    };

    setTrackingData(trackingInfo);

    // Track 404 error
    try {
      if (typeof gtag !== 'undefined') {
        gtag('event', '404_error', {
          custom_parameter_1: location.pathname,
          custom_parameter_2: document.referrer || 'direct',
          custom_parameter_3: navigator.userAgent
        });
      }
    } catch (error) {
      console.warn('Analytics tracking failed:', error);
    }
  }, [location]);

  const handleSearch = (query) => {
    if (query.trim()) {
      // Redirect to blog with search query
      navigate(`/blog?search=${encodeURIComponent(query.trim())}`);
    }
  };

  const handleGoBack = () => {
    if (window.history.length > 2) {
      navigate(-1);
    } else {
      navigate('/');
    }
  };

  const handleBugReport = async (bugData) => {
    try {
      const payload = {
        ...bugData,
        attemptedUrl: location.pathname,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent
      };

      // Check if screenshot makes payload too large
      const payloadSize = JSON.stringify(payload).length;
      if (payloadSize > 4 * 1024 * 1024) { // 4MB limit with buffer
        toast({
          title: "Screenshot muito grande",
          description: "Por favor, remova o screenshot ou tente uma imagem menor.",
          variant: "destructive"
        });
        return;
      }

      const response = await fetch('/api/bug-report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        toast({
          title: "Problema reportado",
          description: "Obrigado por nos ajudar a melhorar! Analisaremos o problema em breve.",
        });
        setShowBugReport(false);
      } else if (response.status === 413) {
        toast({
          title: "Arquivo muito grande",
          description: "O screenshot é muito grande. Por favor, envie uma imagem menor.",
          variant: "destructive"
        });
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to submit bug report');
      }
    } catch (error) {
      toast({
        title: "Erro ao reportar",
        description: error.message || "Não foi possível enviar o report. Por favor, tente novamente.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <div className="container mx-auto px-4 py-8 md:py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto"
        >
          {/* 404 Content */}
          <NotFoundContent />

          {/* Search Bar */}
          <div className="mt-8">
            <SearchBar
              onSearch={handleSearch}
              placeholder="Buscar conteúdo no site..."
            />
          </div>

          {/* Quick Links */}
          <div className="mt-8">
            <QuickLinks />
          </div>

          {/* Action Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={handleGoBack}
              variant="outline"
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar
            </Button>

            <Button
              onClick={() => navigate('/')}
              className="flex items-center gap-2"
            >
              <Home className="w-4 h-4" />
              Página Inicial
            </Button>

            <Button
              onClick={() => setShowBugReport(!showBugReport)}
              variant="secondary"
              className="flex items-center gap-2"
            >
              <Bug className="w-4 h-4" />
              Reportar Problema
            </Button>
          </div>

          {/* Bug Report Form */}
          {showBugReport && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-8"
            >
              <BugReportForm
                onSubmit={handleBugReport}
                attemptedUrl={location.pathname}
                onCancel={() => setShowBugReport(false)}
              />
            </motion.div>
          )}

          {/* Additional Help */}
          <Card className="mt-8 bg-white/80 backdrop-blur-sm border-blue-100">
            <CardHeader>
              <CardTitle className="text-center text-lg text-blue-900">
                Precisa de ajuda?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4 text-center">
                <div className="space-y-2">
                  <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <Phone className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900">Telefone</h3>
                  <p className="text-sm text-gray-600">
                    <a href="tel:+55333821-3000" className="hover:text-blue-600 transition-colors">
                      (33) 3821-3000
                    </a>
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <Mail className="w-6 h-6 text-green-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900">Email</h3>
                  <p className="text-sm text-gray-600">
                    <a href="mailto:contato@saraivavision.com.br" className="hover:text-blue-600 transition-colors">
                      contato@saraivavision.com.br
                    </a>
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="mx-auto w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                    <MapPin className="w-6 h-6 text-purple-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900">Endereço</h3>
                  <p className="text-sm text-gray-600">
                    Rua Capitão Domingos, 255<br/>
                    Centro - Caratinga, MG
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Error Tracking Component */}
      <ErrorTracking data={trackingData} />
    </div>
  );
};

export default NotFoundPage;