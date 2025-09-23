'use client'

import { useState } from 'react'
import { format, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay } from 'date-fns'

interface CalendarProps {
  onSelectDate: (date: Date) => void
}

export default function Calendar({ onSelectDate }: CalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)

  const handleDateClick = (day: Date) => {
    setSelectedDate(day)
    onSelectDate(day)
  }

  const renderHeader = () => {
    return (
      <div className="flex justify-between items-center mb-4">
        <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>&lt;</button>
        <h2 className="text-xl font-bold">{format(currentMonth, 'MMMM yyyy')}</h2>
        <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>&gt;</button>
      </div>
    )
  }

  const renderDays = () => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    return (
      <div className="grid grid-cols-7 gap-2">
        {days.map((day) => (
          <div key={day} className="text-center font-bold">{day}</div>
        ))}
      </div>
    )
  }

  const renderCells = () => {
    const monthStart = startOfMonth(currentMonth)
    const monthEnd = endOfMonth(monthStart)
    const startDate = startOfWeek(monthStart)
    const endDate = endOfWeek(monthEnd)

    const days = eachDayOfInterval({ start: startDate, end: endDate })

    return (
      <div className="grid grid-cols-7 gap-2">
        {days.map((day) => (
          <div
            key={day.toString()}
            className={`p-2 text-center cursor-pointer rounded-full ${!isSameMonth(day, monthStart) ? 'text-gray-400' : isSameDay(day, selectedDate || new Date(0)) ? 'bg-blue-500 text-white' : ''}`}
            onClick={() => handleDateClick(day)}
          >
            {format(day, 'd')}
          </div>
        ))}
      </div>
    )
  }

  return (
    <div>
      {renderHeader()}
      {renderDays()}
      {renderCells()}
    </div>
  )
}
