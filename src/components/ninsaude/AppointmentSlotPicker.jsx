/**
 * Appointment Slot Picker Component
 * Calendar view for selecting appointment slots with professional filtering
 * @module components/ninsaude/AppointmentSlotPicker
 */

import React, { useState, useEffect, useMemo } from 'react';
import { format, addDays, startOfDay, isBefore, isToday, isSameDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar, Clock, User, ChevronLeft, ChevronRight, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

/**
 * AppointmentSlotPicker - Component for slot selection with calendar view
 * @param {Object} props
 * @param {Array} props.availableSlots - Array of available appointment slots
 * @param {Function} props.onSlotSelect - Callback when a slot is selected
 * @param {Object} props.selectedSlot - Currently selected slot
 * @param {Boolean} props.isLoading - Loading state during slot fetch
 * @param {Array} props.professionals - List of available professionals
 * @param {String} props.selectedProfessional - Currently selected professional ID
 * @param {Function} props.onProfessionalChange - Callback when professional is changed
 * @param {Number} props.daysAhead - Number of days to display (default: 7)
 */
const AppointmentSlotPicker = ({
  availableSlots = [],
  onSlotSelect,
  selectedSlot = null,
  isLoading = false,
  professionals = [],
  selectedProfessional = null,
  onProfessionalChange,
  daysAhead = 7,
  className
}) => {
  const [currentWeekStart, setCurrentWeekStart] = useState(0);
  const [selectedDate, setSelectedDate] = useState(null);

  // Generate dates for the calendar view
  const dates = useMemo(() => {
    const today = startOfDay(new Date());
    return Array.from({ length: daysAhead }, (_, i) => addDays(today, i + currentWeekStart));
  }, [currentWeekStart, daysAhead]);

  // Filter slots by selected professional and date
  const filteredSlots = useMemo(() => {
    let slots = availableSlots;

    if (selectedProfessional) {
      slots = slots.filter(slot => slot.professionalId === selectedProfessional);
    }

    if (selectedDate) {
      slots = slots.filter(slot => {
        const slotDate = new Date(slot.datetime);
        return isSameDay(slotDate, selectedDate);
      });
    }

    return slots;
  }, [availableSlots, selectedProfessional, selectedDate]);

  // Group slots by date
  const slotsByDate = useMemo(() => {
    const grouped = {};

    availableSlots.forEach(slot => {
      const slotDate = startOfDay(new Date(slot.datetime));
      const dateKey = format(slotDate, 'yyyy-MM-dd');

      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }

      if (!selectedProfessional || slot.professionalId === selectedProfessional) {
        grouped[dateKey].push(slot);
      }
    });

    return grouped;
  }, [availableSlots, selectedProfessional]);

  // Handle date selection
  const handleDateClick = (date) => {
    setSelectedDate(date);
  };

  // Handle slot selection
  const handleSlotClick = (slot) => {
    if (onSlotSelect && !slot.disabled) {
      onSlotSelect(slot);
    }
  };

  // Navigate week
  const handlePreviousWeek = () => {
    if (currentWeekStart > 0) {
      setCurrentWeekStart(prev => Math.max(0, prev - daysAhead));
    }
  };

  const handleNextWeek = () => {
    setCurrentWeekStart(prev => prev + daysAhead);
  };

  // Get slots count for a date
  const getSlotsCountForDate = (date) => {
    const dateKey = format(date, 'yyyy-MM-dd');
    return slotsByDate[dateKey]?.length || 0;
  };

  // Check if date is in the past
  const isDateInPast = (date) => {
    return isBefore(date, startOfDay(new Date())) && !isToday(date);
  };

  return (
    <div className={cn('space-y-6', className)} data-testid="appointment-slot-picker">
      {/* Professional Filter */}
      {professionals.length > 1 && (
        <div className="space-y-2">
          <Label htmlFor="professional-filter" className="text-sm font-medium text-gray-700">
            Filtrar por Profissional
          </Label>
          <select
            id="professional-filter"
            value={selectedProfessional || ''}
            onChange={(e) => onProfessionalChange?.(e.target.value || null)}
            className="w-full h-10 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            aria-label="Selecionar profissional"
          >
            <option value="">Todos os profissionais</option>
            {professionals.map(prof => (
              <option key={prof.id} value={prof.id}>
                {prof.name} - {prof.specialty}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Calendar Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={handlePreviousWeek}
          disabled={currentWeekStart === 0}
          aria-label="Semana anterior"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div className="flex items-center space-x-2 text-sm font-medium text-gray-700">
          <Calendar className="h-4 w-4" />
          <span>
            {format(dates[0], 'dd MMM', { locale: ptBR })} - {format(dates[dates.length - 1], 'dd MMM yyyy', { locale: ptBR })}
          </span>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleNextWeek}
          aria-label="Próxima semana"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex flex-col items-center justify-center py-12 space-y-3">
          <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
          <p className="text-sm text-gray-600">Carregando horários disponíveis...</p>
        </div>
      )}

      {/* Calendar Grid */}
      {!isLoading && (
        <div className="space-y-4">
          {/* Date Headers */}
          <div className="grid grid-cols-2 md:grid-cols-7 gap-2">
            {dates.map((date, idx) => {
              const slotsCount = getSlotsCountForDate(date);
              const isPast = isDateInPast(date);
              const isSelected = selectedDate && isSameDay(date, selectedDate);

              return (
                <button
                  key={idx}
                  onClick={() => !isPast && slotsCount > 0 && handleDateClick(date)}
                  disabled={isPast || slotsCount === 0}
                  className={cn(
                    'p-3 rounded-lg border-2 transition-all duration-200',
                    'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
                    isSelected && 'border-blue-600 bg-blue-50',
                    !isSelected && slotsCount > 0 && !isPast && 'border-gray-200 hover:border-blue-400 hover:bg-blue-50',
                    (isPast || slotsCount === 0) && 'border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed'
                  )}
                  aria-label={`${format(date, 'dd MMMM yyyy', { locale: ptBR })}, ${slotsCount} horários disponíveis`}
                  aria-pressed={isSelected}
                >
                  <div className="text-center">
                    <div className="text-xs text-gray-500 uppercase">
                      {format(date, 'EEE', { locale: ptBR })}
                    </div>
                    <div className={cn(
                      'text-lg font-bold mt-1',
                      isSelected ? 'text-blue-600' : 'text-gray-900'
                    )}>
                      {format(date, 'dd', { locale: ptBR })}
                    </div>
                    <div className={cn(
                      'text-xs mt-1',
                      slotsCount > 0 && !isPast ? 'text-green-600 font-medium' : 'text-gray-400'
                    )}>
                      {slotsCount > 0 ? `${slotsCount} vagas` : 'Sem vagas'}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Time Slots Grid */}
          {selectedDate && filteredSlots.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-gray-700 flex items-center space-x-2">
                <Clock className="h-4 w-4" />
                <span>Horários Disponíveis - {format(selectedDate, "dd 'de' MMMM", { locale: ptBR })}</span>
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                {filteredSlots.map((slot, idx) => {
                  const slotTime = new Date(slot.datetime);
                  const isSelected = selectedSlot?.id === slot.id;
                  const isPast = isBefore(slotTime, new Date());

                  return (
                    <button
                      key={slot.id || idx}
                      onClick={() => handleSlotClick(slot)}
                      disabled={slot.disabled || isPast}
                      className={cn(
                        'p-3 rounded-lg border-2 transition-all duration-200',
                        'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
                        isSelected && 'border-blue-600 bg-blue-600 text-white',
                        !isSelected && !slot.disabled && !isPast && 'border-gray-200 hover:border-blue-400 hover:bg-blue-50',
                        (slot.disabled || isPast) && 'border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed'
                      )}
                      aria-label={`${format(slotTime, 'HH:mm')} - ${slot.professionalName || 'Profissional não especificado'}`}
                      aria-pressed={isSelected}
                    >
                      <div className="text-center">
                        <div className={cn(
                          'text-base font-bold',
                          isSelected ? 'text-white' : 'text-gray-900'
                        )}>
                          {format(slotTime, 'HH:mm')}
                        </div>
                        {slot.professionalName && (
                          <div className={cn(
                            'text-xs mt-1 flex items-center justify-center space-x-1',
                            isSelected ? 'text-blue-100' : 'text-gray-600'
                          )}>
                            <User className="h-3 w-3" />
                            <span className="truncate">{slot.professionalName}</span>
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Empty State */}
          {!selectedDate && filteredSlots.length === 0 && !isLoading && (
            <div className="flex flex-col items-center justify-center py-12 space-y-3 text-center">
              <Calendar className="h-12 w-12 text-gray-300" />
              <div>
                <p className="text-sm font-medium text-gray-700">Selecione uma data</p>
                <p className="text-xs text-gray-500 mt-1">Escolha um dia no calendário para ver os horários disponíveis</p>
              </div>
            </div>
          )}

          {/* No Slots for Selected Date */}
          {selectedDate && filteredSlots.length === 0 && !isLoading && (
            <div className="flex flex-col items-center justify-center py-12 space-y-3 text-center">
              <AlertCircle className="h-12 w-12 text-orange-400" />
              <div>
                <p className="text-sm font-medium text-gray-700">Nenhum horário disponível</p>
                <p className="text-xs text-gray-500 mt-1">
                  Não há horários disponíveis para {format(selectedDate, "dd 'de' MMMM", { locale: ptBR })}.
                  Tente outra data.
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Selected Slot Summary */}
      {selectedSlot && !isLoading && (
        <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <div className="h-10 w-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <Calendar className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">Horário Selecionado</p>
              <p className="text-xs text-gray-600 mt-0.5">
                {format(new Date(selectedSlot.datetime), "dd 'de' MMMM 'às' HH:mm", { locale: ptBR })}
                {selectedSlot.professionalName && ` - ${selectedSlot.professionalName}`}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Accessibility Instructions */}
      <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        {isLoading && 'Carregando horários disponíveis'}
        {!isLoading && selectedDate && `${filteredSlots.length} horários disponíveis para ${format(selectedDate, 'dd MMMM yyyy', { locale: ptBR })}`}
        {!isLoading && selectedSlot && `Horário selecionado: ${format(new Date(selectedSlot.datetime), 'dd MMMM HH:mm', { locale: ptBR })}`}
      </div>
    </div>
  );
};

export default AppointmentSlotPicker;
