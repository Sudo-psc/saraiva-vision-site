'use client'

import { useState } from 'react'

interface BookingFormProps {
  onSubmit: (formData: { name: string; email: string }) => void
}

export default function BookingForm({ onSubmit }: BookingFormProps) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({ name, email })
  }

  return (
    <form onSubmit={handleSubmit}>
      <h2 className="text-xl font-bold mb-4">Enter Your Details</h2>
      <div className="mb-4">
        <label htmlFor="name" className="block mb-2">Name</label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full p-2 border rounded-lg"
          required
        />
      </div>
      <div className="mb-4">
        <label htmlFor="email" className="block mb-2">Email</label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-2 border rounded-lg"
          required
        />
      </div>
      <button type="submit" className="w-full p-2 bg-blue-500 text-white rounded-lg">Submit</button>
    </form>
  )
}
