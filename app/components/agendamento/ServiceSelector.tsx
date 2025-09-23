'use client'

import { useEffect, useState } from 'react'

interface Service {
  id: string
  name: string
  description: string
  duration: number
  price: number
}

interface ServiceSelectorProps {
  onSelectService: (serviceId: string) => void
}

export default function ServiceSelector({ onSelectService }: ServiceSelectorProps) {
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchServices() {
      try {
        const response = await fetch('/api/services')
        const data = await response.json()
        setServices(data.services)
      } catch (error) {
        console.error('Failed to fetch services:', error)
      }
      setLoading(false)
    }

    fetchServices()
  }, [])

  if (loading) {
    return <div>Loading services...</div>
  }

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Select a Service</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {services.map((service) => (
          <div
            key={service.id}
            className="p-4 border rounded-lg cursor-pointer hover:bg-gray-100"
            onClick={() => onSelectService(service.id)}
          >
            <h3 className="font-bold">{service.name}</h3>
            <p>{service.description}</p>
            <p>{service.duration} minutes - ${service.price}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
