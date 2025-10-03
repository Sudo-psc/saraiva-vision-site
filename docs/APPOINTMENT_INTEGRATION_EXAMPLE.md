# Appointment Booking API - Integration Example

## Quick Start for Frontend Developers

### Step 1: Fetch Available Slots

```javascript
async function loadAvailability() {
  try {
    const response = await fetch('/api/appointments/availability?days=14');
    const result = await response.json();
    
    if (result.success) {
      const { availability, schedulingEnabled, contact } = result.data;
      
      // availability = {
      //   "2025-10-06": [
      //     { slot_time: "08:00", is_available: true },
      //     { slot_time: "08:30", is_available: false },
      //     ...
      //   ]
      // }
      
      return availability;
    } else {
      console.error('Failed to load availability:', result.error);
      return {};
    }
  } catch (error) {
    console.error('Network error:', error);
    return {};
  }
}
```

### Step 2: Create Appointment

```javascript
async function createAppointment(formData) {
  try {
    const response = await fetch('/api/appointments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        patient_name: formData.name,
        patient_email: formData.email,
        patient_phone: formData.phone,
        appointment_date: formData.date,        // "2025-10-06"
        appointment_time: formData.time,        // "09:00"
        notes: formData.notes || '',
      }),
    });
    
    const result = await response.json();
    
    if (result.success) {
      // Success! Show confirmation
      const appointmentId = result.data.id;
      const confirmationSent = result.data.confirmationSent;
      
      console.log('Appointment created:', appointmentId);
      return { success: true, appointment: result.data.appointment };
    } else {
      // Handle errors
      switch (result.error.code) {
        case 'SLOT_UNAVAILABLE':
          // Slot was just booked by someone else
          // Refresh availability and ask user to pick another slot
          await loadAvailability();
          return { 
            success: false, 
            error: 'Este horário não está mais disponível. Por favor, escolha outro.' 
          };
          
        case 'RATE_LIMIT':
          // User tried to book too many appointments
          return { 
            success: false, 
            error: 'Muitas tentativas. Aguarde 1 hora antes de tentar novamente.' 
          };
          
        case 'VALIDATION_ERROR':
          // Invalid data (name, email, phone, date, time)
          return { 
            success: false, 
            error: 'Dados inválidos. Verifique os campos e tente novamente.' 
          };
          
        default:
          return { 
            success: false, 
            error: 'Erro ao agendar consulta. Tente novamente.' 
          };
      }
    }
  } catch (error) {
    console.error('Network error:', error);
    return { 
      success: false, 
      error: 'Erro de conexão. Verifique sua internet e tente novamente.' 
    };
  }
}
```

### Step 3: Display Slots UI

```jsx
function AppointmentSlots({ availability, onSelectSlot }) {
  const dates = Object.keys(availability);
  
  return (
    <div className="space-y-6">
      {dates.map(date => (
        <div key={date} className="border rounded-lg p-4">
          <h3 className="font-semibold mb-3">
            {formatDateBR(date)} {/* "Segunda-feira, 06/10/2025" */}
          </h3>
          
          <div className="grid grid-cols-4 gap-2">
            {availability[date].map(slot => (
              <button
                key={slot.slot_time}
                onClick={() => slot.is_available && onSelectSlot(date, slot.slot_time)}
                disabled={!slot.is_available}
                className={`
                  px-3 py-2 rounded text-sm
                  ${slot.is_available 
                    ? 'border border-blue-300 hover:bg-blue-50' 
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'}
                `}
              >
                {slot.slot_time}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
```

### Step 4: Complete Form Example

```jsx
function AppointmentBookingForm() {
  const [step, setStep] = useState(1); // 1: Select Time, 2: Patient Info, 3: Confirmation
  const [availability, setAvailability] = useState({});
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    notes: '',
  });
  
  // Load availability on mount
  useEffect(() => {
    async function load() {
      setLoading(true);
      const slots = await loadAvailability();
      setAvailability(slots);
      setLoading(false);
    }
    load();
  }, []);
  
  // Handle slot selection
  const handleSelectSlot = (date, time) => {
    setSelectedDate(date);
    setSelectedTime(time);
    setStep(2);
    setError('');
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    const result = await createAppointment({
      ...formData,
      date: selectedDate,
      time: selectedTime,
    });
    
    setLoading(false);
    
    if (result.success) {
      setStep(3); // Show confirmation
    } else {
      setError(result.error);
      if (result.error.includes('não está mais disponível')) {
        // Refresh availability and go back to step 1
        const slots = await loadAvailability();
        setAvailability(slots);
        setStep(1);
      }
    }
  };
  
  return (
    <div className="max-w-2xl mx-auto p-6">
      {/* Step Indicators */}
      <div className="flex items-center justify-between mb-6">
        <StepIndicator number={1} active={step >= 1} label="Escolher Horário" />
        <StepIndicator number={2} active={step >= 2} label="Dados Pessoais" />
        <StepIndicator number={3} active={step >= 3} label="Confirmação" />
      </div>
      
      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
          <p className="text-red-700">{error}</p>
        </div>
      )}
      
      {/* Step 1: Select Time Slot */}
      {step === 1 && (
        <AppointmentSlots 
          availability={availability} 
          onSelectSlot={handleSelectSlot}
        />
      )}
      
      {/* Step 2: Patient Information */}
      {step === 2 && (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded p-4 mb-6">
            <p className="font-semibold text-blue-800">Horário selecionado:</p>
            <p className="text-blue-700">
              {formatDateBR(selectedDate)} às {selectedTime}
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Nome completo *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full px-3 py-2 border rounded"
              required
              minLength={2}
              maxLength={100}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Email *</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="w-full px-3 py-2 border rounded"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Telefone *</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
              className="w-full px-3 py-2 border rounded"
              placeholder="(33) 98765-4321"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Observações (opcional)</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              className="w-full px-3 py-2 border rounded"
              rows={3}
              maxLength={1000}
            />
          </div>
          
          <div className="flex justify-between mt-6">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="px-4 py-2 border rounded hover:bg-gray-50"
            >
              Voltar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Agendando...' : 'Agendar Consulta'}
            </button>
          </div>
        </form>
      )}
      
      {/* Step 3: Confirmation */}
      {step === 3 && (
        <div className="text-center">
          <div className="mb-4">
            <svg className="w-16 h-16 mx-auto text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          
          <h2 className="text-2xl font-bold text-green-600 mb-2">
            Consulta agendada com sucesso!
          </h2>
          
          <p className="text-gray-600 mb-6">
            Você receberá um email de confirmação em breve.
          </p>
          
          <div className="bg-green-50 border border-green-200 rounded p-4 mb-6 text-left">
            <h3 className="font-semibold text-green-800 mb-2">Próximos passos:</h3>
            <ul className="text-green-700 space-y-1">
              <li>✓ Confirmação enviada por email</li>
              <li>✓ Lembretes serão enviados antes da consulta</li>
              <li>✓ Chegue 15 minutos antes do horário</li>
              <li>✓ Traga documento com foto</li>
            </ul>
          </div>
          
          <button
            onClick={() => {
              setStep(1);
              setFormData({ name: '', email: '', phone: '', notes: '' });
              setSelectedDate('');
              setSelectedTime('');
            }}
            className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Agendar Nova Consulta
          </button>
        </div>
      )}
    </div>
  );
}

function StepIndicator({ number, active, label }) {
  return (
    <div className="flex items-center">
      <div className={`
        w-8 h-8 rounded-full flex items-center justify-center
        ${active ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'}
      `}>
        {number}
      </div>
      <span className={`ml-2 font-medium ${active ? 'text-blue-600' : 'text-gray-400'}`}>
        {label}
      </span>
    </div>
  );
}

function formatDateBR(dateStr) {
  const date = new Date(dateStr + 'T00:00:00');
  const dayNames = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
  const dayName = dayNames[date.getDay()];
  const formatted = date.toLocaleDateString('pt-BR');
  return `${dayName}, ${formatted}`;
}
```

## Testing the API

### Test 1: Get Availability
```bash
curl "http://localhost:3000/api/appointments/availability?days=7"
```

Expected response:
```json
{
  "success": true,
  "data": {
    "availability": {
      "2025-10-06": [...]
    },
    "schedulingEnabled": true,
    "contact": {...}
  },
  "timestamp": "2025-10-03T..."
}
```

### Test 2: Create Appointment
```bash
curl -X POST http://localhost:3000/api/appointments \
  -H "Content-Type: application/json" \
  -d '{
    "patient_name": "João Silva",
    "patient_email": "joao@example.com",
    "patient_phone": "(33) 98765-4321",
    "appointment_date": "2025-10-06",
    "appointment_time": "09:00",
    "notes": "Primeira consulta"
  }'
```

Expected response:
```json
{
  "success": true,
  "data": {
    "id": "APT-...",
    "appointment": {...},
    "confirmationSent": true
  },
  "timestamp": "2025-10-03T..."
}
```

### Test 3: Validate Errors

**Invalid phone:**
```bash
curl -X POST http://localhost:3000/api/appointments \
  -H "Content-Type: application/json" \
  -d '{"patient_phone": "invalid"}'
```
→ Returns 400 VALIDATION_ERROR

**Weekend date:**
```bash
curl -X POST http://localhost:3000/api/appointments \
  -H "Content-Type: application/json" \
  -d '{
    "patient_name": "Test",
    "patient_email": "test@example.com",
    "patient_phone": "33987654321",
    "appointment_date": "2025-10-05",
    "appointment_time": "09:00"
  }'
```
→ Returns 400 VALIDATION_ERROR (Sunday)

**Already booked slot:**
Book the same slot twice in a row
→ Second request returns 409 SLOT_UNAVAILABLE

**Rate limit:**
Make 6 POST requests rapidly
→ 6th request returns 429 RATE_LIMIT

## Environment Variables

Add to `.env.local`:
```bash
# Email Configuration
RESEND_API_KEY=re_your_api_key_here
CONTACT_TO_EMAIL=philipe_cruz@outlook.com
CONTACT_EMAIL_FROM=contato@saraivavision.com.br

# Rate Limiting (optional)
RATE_LIMIT_MAX=5
RATE_LIMIT_WINDOW=3600000
```

## Production Deployment

1. **Add environment variables** to Vercel dashboard
2. **Deploy** to Vercel (automatic on push to main)
3. **Test** the production API endpoints
4. **Monitor** logs for errors

The API will work immediately with mock data. For database persistence, follow the migration guide in `/docs/API_APPOINTMENTS.md`.

## Support

- Full documentation: `/docs/API_APPOINTMENTS.md`
- API Summary: `/docs/APPOINTMENT_API_SUMMARY.md`
- Component: `src/components/AppointmentBooking.jsx`
