# AppointmentBooking Component

## Quick Start

```tsx
import AppointmentBooking from '@/components/AppointmentBooking';

export default function Page() {
  return <AppointmentBooking />;
}
```

## Features

✅ TypeScript with Zod validation  
✅ WCAG 2.1 AA accessible  
✅ LGPD compliant  
✅ Mobile responsive  
✅ Error handling  
✅ Loading states  

## Documentation

- **Full Guide**: `/docs/APPOINTMENT_BOOKING_MIGRATION.md`
- **Summary**: `/docs/APPOINTMENT_SUMMARY.md`
- **Types**: `/types/appointment.ts`
- **Validation**: `/lib/validations/appointment.ts`

## Required API Routes

- `GET /api/appointments/availability?days=14`
- `POST /api/appointments`

See documentation for API specifications.
