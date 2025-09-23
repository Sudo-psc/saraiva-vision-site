'use client'

import { useSearchParams } from 'next/navigation'

export default function ConfirmacaoPage() {
  const searchParams = useSearchParams()
  const appointmentId = searchParams.get('id')

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold text-green-500 mb-4">Booking Confirmed!</h1>
      <p>Your appointment has been successfully booked. You will receive a confirmation email shortly.</p>
      {appointmentId && <p>Your appointment ID is: {appointmentId}</p>}
    </div>
  )
}
