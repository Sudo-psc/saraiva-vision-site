import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Bug, Send, X, Camera, AlertTriangle, CheckCircle } from 'lucide-react';
import { Button } from '../ui/button.jsx';
import { Input } from '../ui/input.jsx';
import { Textarea } from '../ui/textarea.jsx';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card.jsx';
import { Alert, AlertDescription } from '../ui/Alert.jsx';
import { Label } from '../ui/label.jsx';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select.jsx';

const BugReportForm = ({ onSubmit, attemptedUrl, onCancel }) => {
  const [formData, setFormData] = useState({
    email: '',
    problemType: '',
    description: '',
    attemptedUrl: attemptedUrl || ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [screenshot, setScreenshot] = useState(null);
  const [errors, setErrors] = useState({});

  const problemTypes = [
    { value: 'link-quebrado', label: 'Link Quebrado' },
    { value: 'pagina-nao-encontrada', label: 'Página Não Encontrada' },
    { value: 'erro-carregamento', label: 'Erro de Carregamento' },
    { value: 'problema-navegacao', label: 'Problema de Navegação' },
    { value: 'outro', label: 'Outro' }
  ];

  const validateForm = () => {
    const newErrors = {};

    if (!formData.problemType) {
      newErrors.problemType = 'Selecione o tipo de problema';
    }

    if (!formData.description || formData.description.length < 10) {
      newErrors.description = 'Descreva o problema com pelo menos 10 caracteres';
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const submissionData = {
        ...formData,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        screenshot: screenshot ? screenshot.split(',')[1] : null // Remove data URL prefix
      };

      await onSubmit(submissionData);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleScreenshot = () => {
    // Check if Screen Capture API is available
    if (navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia) {
      navigator.mediaDevices.getDisplayMedia({ video: true })
        .then(stream => {
          const video = document.createElement('video');
          video.srcObject = stream;
          video.play();

          video.onloadedmetadata = () => {
            const canvas = document.createElement('canvas');
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;

            const ctx = canvas.getContext('2d');
            ctx.drawImage(video, 0, 0);

            canvas.toBlob(blob => {
              const reader = new FileReader();
              reader.onloadend = () => {
                setScreenshot(reader.result);
              };
              reader.readAsDataURL(blob);
            }, 'image/jpeg', 0.8);

            stream.getTracks().forEach(track => track.stop());
          };
        })
        .catch(err => {
          console.log('Screenshot capture failed:', err);
        });
    } else {
      // Fallback: open camera on mobile
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.onchange = (e) => {
        const file = e.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onloadend = () => {
            setScreenshot(reader.result);
          };
          reader.readAsDataURL(file);
        }
      };
      input.click();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="bg-white/90 backdrop-blur-sm border-orange-200 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-orange-50 to-red-50 border-b border-orange-200">
          <CardTitle className="flex items-center gap-2 text-orange-800">
            <Bug className="w-5 h-5" />
            Reportar Problema
          </CardTitle>
        </CardHeader>

        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                Seu email (opcional)
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="seu@email.com"
                className={errors.email ? 'border-red-300 focus:border-red-500' : ''}
              />
              {errors.email && (
                <p className="text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            {/* Problem Type */}
            <div className="space-y-2">
              <Label htmlFor="problemType" className="text-sm font-medium text-gray-700">
                Tipo de problema *
              </Label>
              <Select
                value={formData.problemType}
                onValueChange={(value) => handleInputChange('problemType', value)}
              >
                <SelectTrigger className={errors.problemType ? 'border-red-300 focus:border-red-500' : ''}>
                  <SelectValue placeholder="Selecione o tipo de problema" />
                </SelectTrigger>
                <SelectContent>
                  {problemTypes.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.problemType && (
                <p className="text-sm text-red-600">{errors.problemType}</p>
              )}
            </div>

            {/* Attempted URL */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">
                URL que você tentou acessar
              </Label>
              <Input
                value={formData.attemptedUrl}
                disabled
                className="bg-gray-50 text-gray-600"
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-medium text-gray-700">
                Descreva o que aconteceu *
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="O que você estava tentando fazer? O que não funcionou como esperado?"
                rows={4}
                className={errors.description ? 'border-red-300 focus:border-red-500' : ''}
              />
              {errors.description && (
                <p className="text-sm text-red-600">{errors.description}</p>
              )}
            </div>

            {/* Screenshot */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">
                Anexar screenshot (opcional)
              </Label>
              <div className="flex items-center gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleScreenshot}
                  className="flex items-center gap-2"
                >
                  <Camera className="w-4 h-4" />
                  {screenshot ? 'Tirar outra' : 'Tirar screenshot'}
                </Button>
                {screenshot && (
                  <div className="flex items-center gap-2 text-sm text-green-600">
                    <CheckCircle className="w-4 h-4" />
                    Screenshot anexado
                  </div>
                )}
              </div>
              {screenshot && (
                <div className="mt-2 relative inline-block">
                  <img
                    src={screenshot}
                    alt="Screenshot anexado"
                    className="max-w-xs rounded-lg border border-gray-200 shadow-sm"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => setScreenshot(null)}
                    className="absolute -top-2 -right-2 w-6 h-6 rounded-full p-0"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              )}
            </div>

            {/* Info Alert */}
            <Alert className="bg-blue-50 border-cyan-200">
              <AlertTriangle className="w-4 h-4 text-cyan-600" />
              <AlertDescription className="text-cyan-700 text-sm">
                Seu report nos ajuda a identificar e corrigir problemas no site.
                Obrigado por colaborar com a melhoria da nossa plataforma!
              </AlertDescription>
            </Alert>

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t border-gray-200">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Enviando...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Send className="w-4 h-4" />
                    Enviar Report
                  </div>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default BugReportForm;