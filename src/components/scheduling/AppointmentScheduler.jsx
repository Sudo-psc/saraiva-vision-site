import { useState, useEffect } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useNinsaudeScheduling } from '@/hooks/useNinsaudeScheduling';
import { usePhoneMask } from '@/hooks/usePhoneMask';
import { Clock, Calendar as CalendarIcon, User, Mail, Phone, FileText, CheckCircle2, Loader2 } from 'lucide-react';

const CONSULTATION_REASONS = [
  { value: 'consulta-rotina', label: 'Consulta de Rotina' },
  { value: 'primeira-consulta', label: 'Primeira Consulta' },
  { value: 'retorno', label: 'Retorno' },
  { value: 'exame-vista', label: 'Exame de Vista' },
  { value: 'urgencia', label: 'Urgência Oftalmológica' },
  { value: 'cirurgia-pre', label: 'Pré-Operatório' },
  { value: 'cirurgia-pos', label: 'Pós-Operatório' },
  { value: 'outro', label: 'Outro' },
];

export default function AppointmentScheduler() {
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [appointmentData, setAppointmentData] = useState(null);

  const [formData, setFormData] = useState({
    patientName: '',
    patientEmail: '',
    reason: '',
    notes: '',
    lgpdConsent: false,
  });

  const phone = usePhoneMask();
  const { toast } = useToast();
  const { loading, fetchAvailableSlots, createAppointment } = useNinsaudeScheduling();

  useEffect(() => {
    if (selectedDate) {
      loadAvailableSlots(selectedDate);
    }
  }, [selectedDate]);

  const loadAvailableSlots = async (date) => {
    try {
      const slots = await fetchAvailableSlots(date);
      setAvailableSlots(slots);
      setSelectedTime(null);
    } catch (err) {
      toast({
        title: 'Erro ao carregar horários',
        description: err.message,
        variant: 'destructive',
      });
    }
  };

  const handleDateSelect = (date) => {
    setSelectedDate(date);
  };

  const handleTimeSelect = (time) => {
    setSelectedTime(time);
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const validateForm = () => {
    if (!formData.patientName.trim()) {
      toast({
        title: 'Nome obrigatório',
        description: 'Por favor, informe seu nome completo.',
        variant: 'destructive',
      });
      return false;
    }

    if (!formData.patientEmail.trim() || !formData.patientEmail.includes('@')) {
      toast({
        title: 'E-mail inválido',
        description: 'Por favor, informe um e-mail válido.',
        variant: 'destructive',
      });
      return false;
    }

    if (phone.getRawValue().length < 10) {
      toast({
        title: 'Telefone inválido',
        description: 'Por favor, informe um telefone válido.',
        variant: 'destructive',
      });
      return false;
    }

    if (!formData.reason) {
      toast({
        title: 'Motivo obrigatório',
        description: 'Por favor, selecione o motivo da consulta.',
        variant: 'destructive',
      });
      return false;
    }

    if (!formData.lgpdConsent) {
      toast({
        title: 'Consentimento necessário',
        description: 'É necessário aceitar os termos de uso de dados para prosseguir.',
        variant: 'destructive',
      });
      return false;
    }

    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!selectedDate || !selectedTime) {
      toast({
        title: 'Selecione data e horário',
        description: 'Por favor, selecione uma data e horário disponível.',
        variant: 'destructive',
      });
      return;
    }

    if (!validateForm()) {
      return;
    }

    setShowConfirmModal(true);
  };

  const confirmAppointment = async () => {
    try {
      const appointmentPayload = {
        ...formData,
        patientPhone: phone.getRawValue(),
        date: selectedDate.toISOString().split('T')[0],
        time: selectedTime,
      };

      const result = await createAppointment(appointmentPayload);
      
      setAppointmentData(result);
      setShowConfirmModal(false);
      setShowSuccessModal(true);

      await loadAvailableSlots(selectedDate);

      toast({
        title: 'Agendamento confirmado!',
        description: 'Sua consulta foi agendada com sucesso.',
      });
    } catch (err) {
      toast({
        title: 'Erro ao agendar',
        description: err.message,
        variant: 'destructive',
      });
    }
  };

  const resetForm = () => {
    setFormData({
      patientName: '',
      patientEmail: '',
      reason: '',
      notes: '',
      lgpdConsent: false,
    });
    phone.setValue('');
    setSelectedDate(null);
    setSelectedTime(null);
    setShowSuccessModal(false);
  };

  const whatsappNumber = '5533988776655';
  const whatsappMessage = appointmentData 
    ? `Olá! Gostaria de confirmar meu agendamento para ${new Date(appointmentData.date).toLocaleDateString('pt-BR')} às ${appointmentData.time}.`
    : '';

  return (
    <div className="min-h-screen bg-gradient-to-br from-bg-primary via-bg-secondary to-primary-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary-700 mb-3">
            Agendamento Online
          </h1>
          <p className="text-text-secondary text-lg">
            Agende sua consulta oftalmológica de forma rápida e segura
          </p>
        </div>

        <form onSubmit={handleSubmit} className="grid lg:grid-cols-2 gap-6">
          <Card className="shadow-glass bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-primary-700">
                <CalendarIcon className="w-5 h-5" />
                Selecione Data e Horário
              </CardTitle>
              <CardDescription>
                Escolha a data e horário mais convenientes para sua consulta
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex justify-center">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={handleDateSelect}
                  disabled={(date) => date < new Date() || date.getDay() === 0}
                  className="rounded-md border border-border-light"
                />
              </div>

              {selectedDate && (
                <div className="space-y-3">
                  <Label className="text-primary-700 font-semibold flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Horários Disponíveis
                  </Label>
                  
                  {loading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin text-primary-500" />
                      <span className="ml-2 text-text-secondary">Carregando horários...</span>
                    </div>
                  ) : availableSlots.length > 0 ? (
                    <div className="grid grid-cols-3 gap-2">
                      {availableSlots.map((slot) => (
                        <Button
                          key={slot.time}
                          type="button"
                          variant={selectedTime === slot.time ? 'default' : 'outline'}
                          className={`${
                            selectedTime === slot.time
                              ? 'bg-primary-600 text-white hover:bg-primary-700'
                              : 'border-border-light hover:border-primary-400'
                          }`}
                          onClick={() => handleTimeSelect(slot.time)}
                        >
                          {slot.time}
                        </Button>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center py-8 text-text-muted">
                      Nenhum horário disponível para esta data
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-glass bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-primary-700">
                <User className="w-5 h-5" />
                Seus Dados
              </CardTitle>
              <CardDescription>
                Preencha suas informações para confirmar o agendamento
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-primary-700">
                  Nome Completo *
                </Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Seu nome completo"
                  value={formData.patientName}
                  onChange={(e) => handleInputChange('patientName', e.target.value)}
                  className="border-border-light focus:border-primary-500"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-primary-700 flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  E-mail *
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={formData.patientEmail}
                  onChange={(e) => handleInputChange('patientEmail', e.target.value)}
                  className="border-border-light focus:border-primary-500"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="text-primary-700 flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  Telefone/WhatsApp *
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="(00) 00000-0000"
                  value={phone.value}
                  onChange={phone.onChange}
                  className="border-border-light focus:border-primary-500"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="reason" className="text-primary-700 flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Motivo da Consulta *
                </Label>
                <Select value={formData.reason} onValueChange={(value) => handleInputChange('reason', value)}>
                  <SelectTrigger className="border-border-light focus:border-primary-500">
                    <SelectValue placeholder="Selecione o motivo" />
                  </SelectTrigger>
                  <SelectContent>
                    {CONSULTATION_REASONS.map((reason) => (
                      <SelectItem key={reason.value} value={reason.value}>
                        {reason.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes" className="text-primary-700">
                  Observações (opcional)
                </Label>
                <Input
                  id="notes"
                  type="text"
                  placeholder="Informações adicionais"
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  className="border-border-light focus:border-primary-500"
                />
              </div>

              <div className="flex items-start space-x-3 pt-4 border-t border-border-light">
                <Checkbox
                  id="lgpd"
                  checked={formData.lgpdConsent}
                  onCheckedChange={(checked) => handleInputChange('lgpdConsent', checked)}
                  className="mt-1"
                />
                <div className="space-y-1">
                  <Label htmlFor="lgpd" className="text-sm font-medium text-text-primary cursor-pointer">
                    Concordo com a coleta e uso dos meus dados *
                  </Label>
                  <p className="text-xs text-text-muted">
                    Seus dados serão utilizados apenas para fins de agendamento e atendimento médico, 
                    conforme nossa{' '}
                    <a 
                      href="/politica-privacidade" 
                      target="_blank" 
                      className="text-primary-600 hover:text-primary-700 underline"
                    >
                      Política de Privacidade
                    </a>
                    .
                  </p>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-6 text-lg"
                disabled={loading || !selectedDate || !selectedTime}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Processando...
                  </>
                ) : (
                  'Confirmar Agendamento'
                )}
              </Button>
            </CardContent>
          </Card>
        </form>

        <div className="mt-8 text-center space-y-4">
          <div className="flex flex-wrap justify-center gap-4 text-sm text-text-secondary">
            <a href="/servicos" className="hover:text-primary-600 underline">
              Nossos Serviços
            </a>
            <a href="/contato" className="hover:text-primary-600 underline">
              Contato
            </a>
            <a href="/faq" className="hover:text-primary-600 underline">
              Perguntas Frequentes
            </a>
          </div>
        </div>
      </div>

      <Dialog open={showConfirmModal} onOpenChange={setShowConfirmModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-primary-700">Confirmar Agendamento</DialogTitle>
            <DialogDescription>
              Revise os dados do seu agendamento antes de confirmar
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-text-secondary">Data:</span>
                <span className="font-semibold text-text-primary">
                  {selectedDate?.toLocaleDateString('pt-BR')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">Horário:</span>
                <span className="font-semibold text-text-primary">{selectedTime}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">Paciente:</span>
                <span className="font-semibold text-text-primary">{formData.patientName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">Telefone:</span>
                <span className="font-semibold text-text-primary">{phone.value}</span>
              </div>
            </div>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setShowConfirmModal(false)}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              onClick={confirmAppointment}
              disabled={loading}
              className="flex-1 bg-primary-600 hover:bg-primary-700"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Confirmando...
                </>
              ) : (
                'Confirmar'
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex justify-center mb-4">
              <CheckCircle2 className="w-16 h-16 text-success-DEFAULT" />
            </div>
            <DialogTitle className="text-center text-primary-700">
              Agendamento Confirmado!
            </DialogTitle>
            <DialogDescription className="text-center">
              Sua consulta foi agendada com sucesso
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {appointmentData && (
              <div className="bg-primary-50 rounded-lg p-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-text-secondary">Data:</span>
                  <span className="font-semibold text-primary-700">
                    {new Date(appointmentData.date).toLocaleDateString('pt-BR')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Horário:</span>
                  <span className="font-semibold text-primary-700">{appointmentData.time}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Protocolo:</span>
                  <span className="font-semibold text-primary-700">{appointmentData.id}</span>
                </div>
              </div>
            )}
            <div className="text-sm text-text-secondary space-y-2">
              <p className="font-semibold text-text-primary">Instruções importantes:</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Chegue com 15 minutos de antecedência</li>
                <li>Traga documento com foto e carteirinha do convênio</li>
                <li>Em caso de dúvidas, entre em contato conosco</li>
              </ul>
            </div>
            <Button
              className="w-full bg-success-DEFAULT hover:bg-success-dark"
              onClick={() => window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`, '_blank')}
            >
              Confirmar via WhatsApp
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={resetForm}
            >
              Fazer Novo Agendamento
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
