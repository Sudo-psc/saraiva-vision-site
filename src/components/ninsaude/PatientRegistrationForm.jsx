/**
 * Patient Registration Form Component
 * Multi-field form with CPF validation, LGPD consent, and auto-formatting
 * @module components/ninsaude/PatientRegistrationForm
 */

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { AlertCircle, CheckCircle, User, Mail, Phone, MapPin, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';

// CPF validation regex (basic format check)
const CPF_REGEX = /^\d{3}\.\d{3}\.\d{3}-\d{2}$/;

// Validate CPF using Verhoeff algorithm
const validateCPF = (cpf) => {
  const cleanCPF = cpf.replace(/\D/g, '');

  if (cleanCPF.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(cleanCPF)) return false; // All same digits

  // Calculate verification digits
  let sum = 0;
  let remainder;

  for (let i = 1; i <= 9; i++) {
    sum += parseInt(cleanCPF.substring(i - 1, i)) * (11 - i);
  }

  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleanCPF.substring(9, 10))) return false;

  sum = 0;
  for (let i = 1; i <= 10; i++) {
    sum += parseInt(cleanCPF.substring(i - 1, i)) * (12 - i);
  }

  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleanCPF.substring(10, 11))) return false;

  return true;
};

// Zod validation schema
const patientSchema = z.object({
  cpf: z.string()
    .min(1, 'CPF é obrigatório')
    .refine(val => CPF_REGEX.test(val), 'CPF inválido (use o formato 000.000.000-00)')
    .refine(val => validateCPF(val), 'CPF inválido'),
  name: z.string()
    .min(3, 'Nome deve ter pelo menos 3 caracteres')
    .max(100, 'Nome muito longo'),
  birthDate: z.string()
    .min(1, 'Data de nascimento é obrigatória')
    .refine(val => {
      const date = new Date(val);
      const today = new Date();
      const age = today.getFullYear() - date.getFullYear();
      return age >= 0 && age <= 120;
    }, 'Data de nascimento inválida'),
  phone: z.string()
    .min(1, 'Telefone é obrigatório')
    .refine(val => {
      const clean = val.replace(/\D/g, '');
      return clean.length === 10 || clean.length === 11;
    }, 'Telefone inválido (use o formato (00) 00000-0000)'),
  email: z.string()
    .min(1, 'E-mail é obrigatório')
    .email('E-mail inválido'),
  address: z.string()
    .min(5, 'Endereço deve ter pelo menos 5 caracteres')
    .max(200, 'Endereço muito longo'),
  lgpdConsent: z.boolean()
    .refine(val => val === true, 'Você deve aceitar os termos de privacidade')
});

/**
 * Format CPF input with mask 000.000.000-00
 */
const formatCPF = (value) => {
  const numbers = value.replace(/\D/g, '');
  if (numbers.length <= 3) return numbers;
  if (numbers.length <= 6) return `${numbers.slice(0, 3)}.${numbers.slice(3)}`;
  if (numbers.length <= 9) return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6)}`;
  return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6, 9)}-${numbers.slice(9, 11)}`;
};

/**
 * Format phone input with mask (00) 00000-0000
 */
const formatPhone = (value) => {
  const numbers = value.replace(/\D/g, '');
  if (numbers.length <= 2) return numbers;
  if (numbers.length <= 7) return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
  if (numbers.length <= 11) {
    const hasNineDigits = numbers.length === 11;
    return hasNineDigits
      ? `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`
      : `(${numbers.slice(0, 2)}) ${numbers.slice(2, 6)}-${numbers.slice(6, 10)}`;
  }
  return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
};

const PatientRegistrationForm = ({
  onSubmit,
  initialData = {},
  isLoading = false,
  className
}) => {
  const [cpfValidationStatus, setCpfValidationStatus] = useState(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isValid, touchedFields }
  } = useForm({
    resolver: zodResolver(patientSchema),
    mode: 'onBlur',
    defaultValues: {
      cpf: initialData.cpf || '',
      name: initialData.name || '',
      birthDate: initialData.birthDate || '',
      phone: initialData.phone || '',
      email: initialData.email || '',
      address: initialData.address || '',
      lgpdConsent: initialData.lgpdConsent || false
    }
  });

  const cpfValue = watch('cpf');
  const lgpdConsent = watch('lgpdConsent');

  // Real-time CPF validation with visual feedback
  useEffect(() => {
    if (cpfValue && cpfValue.length === 14) {
      const isValid = validateCPF(cpfValue);
      setCpfValidationStatus(isValid ? 'valid' : 'invalid');
    } else {
      setCpfValidationStatus(null);
    }
  }, [cpfValue]);

  // Handle CPF input with auto-formatting
  const handleCPFChange = (e) => {
    const formatted = formatCPF(e.target.value);
    setValue('cpf', formatted, { shouldValidate: touchedFields.cpf });
  };

  // Handle phone input with auto-formatting
  const handlePhoneChange = (e) => {
    const formatted = formatPhone(e.target.value);
    setValue('phone', formatted, { shouldValidate: touchedFields.phone });
  };

  const onFormSubmit = (data) => {
    if (onSubmit) {
      onSubmit(data);
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onFormSubmit)}
      className={cn('space-y-6', className)}
      data-testid="patient-registration-form"
    >
      {/* CPF Field */}
      <div className="space-y-2">
        <Label htmlFor="cpf" className="text-sm font-medium text-gray-700">
          CPF *
        </Label>
        <div className="relative">
          <Input
            id="cpf"
            {...register('cpf')}
            onChange={handleCPFChange}
            placeholder="000.000.000-00"
            maxLength={14}
            className={cn(
              'pr-10',
              errors.cpf && 'border-red-500 focus-visible:ring-red-500',
              cpfValidationStatus === 'valid' && 'border-green-500 focus-visible:ring-green-500'
            )}
            aria-invalid={errors.cpf ? 'true' : 'false'}
            aria-describedby={errors.cpf ? 'cpf-error' : undefined}
          />
          {cpfValidationStatus && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              {cpfValidationStatus === 'valid' ? (
                <CheckCircle className="h-5 w-5 text-green-500" aria-label="CPF válido" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-500" aria-label="CPF inválido" />
              )}
            </div>
          )}
        </div>
        {errors.cpf && (
          <p id="cpf-error" className="text-sm text-red-600" role="alert">
            {errors.cpf.message}
          </p>
        )}
      </div>

      {/* Name Field */}
      <div className="space-y-2">
        <Label htmlFor="name" className="text-sm font-medium text-gray-700">
          Nome Completo *
        </Label>
        <div className="relative">
          <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input
            id="name"
            {...register('name')}
            placeholder="Seu nome completo"
            className={cn(
              'pl-10',
              errors.name && 'border-red-500 focus-visible:ring-red-500'
            )}
            aria-invalid={errors.name ? 'true' : 'false'}
            aria-describedby={errors.name ? 'name-error' : undefined}
          />
        </div>
        {errors.name && (
          <p id="name-error" className="text-sm text-red-600" role="alert">
            {errors.name.message}
          </p>
        )}
      </div>

      {/* Birth Date Field */}
      <div className="space-y-2">
        <Label htmlFor="birthDate" className="text-sm font-medium text-gray-700">
          Data de Nascimento *
        </Label>
        <Input
          id="birthDate"
          type="date"
          {...register('birthDate')}
          className={cn(
            errors.birthDate && 'border-red-500 focus-visible:ring-red-500'
          )}
          aria-invalid={errors.birthDate ? 'true' : 'false'}
          aria-describedby={errors.birthDate ? 'birthDate-error' : undefined}
        />
        {errors.birthDate && (
          <p id="birthDate-error" className="text-sm text-red-600" role="alert">
            {errors.birthDate.message}
          </p>
        )}
      </div>

      {/* Phone Field */}
      <div className="space-y-2">
        <Label htmlFor="phone" className="text-sm font-medium text-gray-700">
          Telefone *
        </Label>
        <div className="relative">
          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input
            id="phone"
            {...register('phone')}
            onChange={handlePhoneChange}
            placeholder="(00) 00000-0000"
            maxLength={15}
            className={cn(
              'pl-10',
              errors.phone && 'border-red-500 focus-visible:ring-red-500'
            )}
            aria-invalid={errors.phone ? 'true' : 'false'}
            aria-describedby={errors.phone ? 'phone-error' : undefined}
          />
        </div>
        {errors.phone && (
          <p id="phone-error" className="text-sm text-red-600" role="alert">
            {errors.phone.message}
          </p>
        )}
      </div>

      {/* Email Field */}
      <div className="space-y-2">
        <Label htmlFor="email" className="text-sm font-medium text-gray-700">
          E-mail *
        </Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input
            id="email"
            type="email"
            {...register('email')}
            placeholder="seu@email.com"
            className={cn(
              'pl-10',
              errors.email && 'border-red-500 focus-visible:ring-red-500'
            )}
            aria-invalid={errors.email ? 'true' : 'false'}
            aria-describedby={errors.email ? 'email-error' : undefined}
          />
        </div>
        {errors.email && (
          <p id="email-error" className="text-sm text-red-600" role="alert">
            {errors.email.message}
          </p>
        )}
      </div>

      {/* Address Field */}
      <div className="space-y-2">
        <Label htmlFor="address" className="text-sm font-medium text-gray-700">
          Endereço *
        </Label>
        <div className="relative">
          <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
          <Input
            id="address"
            {...register('address')}
            placeholder="Rua, número, bairro, cidade"
            className={cn(
              'pl-10',
              errors.address && 'border-red-500 focus-visible:ring-red-500'
            )}
            aria-invalid={errors.address ? 'true' : 'false'}
            aria-describedby={errors.address ? 'address-error' : undefined}
          />
        </div>
        {errors.address && (
          <p id="address-error" className="text-sm text-red-600" role="alert">
            {errors.address.message}
          </p>
        )}
      </div>

      {/* LGPD Consent Checkbox */}
      <div className="space-y-4 border-t pt-4">
        <div className="flex items-start space-x-3">
          <Checkbox
            id="lgpdConsent"
            checked={lgpdConsent}
            onCheckedChange={(checked) => setValue('lgpdConsent', checked, { shouldValidate: true })}
            className={cn(
              'mt-0.5',
              errors.lgpdConsent && 'border-red-500'
            )}
            aria-invalid={errors.lgpdConsent ? 'true' : 'false'}
            aria-describedby={errors.lgpdConsent ? 'lgpdConsent-error' : 'lgpdConsent-description'}
          />
          <div className="flex-1">
            <Label
              htmlFor="lgpdConsent"
              className="text-sm font-normal text-gray-700 cursor-pointer"
            >
              <div className="flex items-center space-x-2 mb-1">
                <Shield className="h-4 w-4 text-blue-600" />
                <span className="font-medium">Consentimento LGPD *</span>
              </div>
              <p id="lgpdConsent-description" className="text-xs text-gray-600 leading-relaxed">
                Autorizo o uso dos meus dados pessoais para agendamento de consulta e contato relacionado ao atendimento médico,
                conforme a Lei Geral de Proteção de Dados (LGPD - Lei 13.709/2018).
                {' '}
                <a
                  href="/privacidade"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 underline"
                >
                  Ler política de privacidade
                </a>
              </p>
            </Label>
            {errors.lgpdConsent && (
              <p id="lgpdConsent-error" className="text-sm text-red-600 mt-1" role="alert">
                {errors.lgpdConsent.message}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div className="pt-4">
        <Button
          type="submit"
          variant="medical"
          size="lg"
          className="w-full"
          disabled={!isValid || !lgpdConsent || isLoading}
          aria-label={isLoading ? 'Enviando dados...' : 'Confirmar cadastro'}
        >
          {isLoading ? (
            <div className="flex items-center space-x-2">
              <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Enviando...</span>
            </div>
          ) : (
            'Confirmar Cadastro'
          )}
        </Button>
      </div>

      {/* Required Fields Notice */}
      <p className="text-xs text-gray-500 text-center">
        * Campos obrigatórios
      </p>
    </form>
  );
};

export default PatientRegistrationForm;
