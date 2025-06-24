"use client"

import { useMemo } from "react"
import type { Appointment } from "./scheduling-dashboard"

interface MonthViewProps {
  currentDate: Date
  appointments: Appointment[]
  facilities: string[]
}

export function MonthView({ currentDate, appointments, facilities }: MonthViewProps) {
  const monthData = useMemo(() => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()

    // Get first day of month and calculate start of calendar grid
    const firstDay = new Date(year, month, 1)
    const startDate = new Date(firstDay)
    const dayOfWeek = firstDay.getDay()
    startDate.setDate(firstDay.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1))

    // Generate 42 days (6 weeks)
    const days = []
    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate)
      date.setDate(startDate.getDate() + i)
      days.push(date)
    }

    return days
  }, [currentDate])

  const getAppointmentsForDate = (date: Date) => {
    const dayStart = new Date(date)
    dayStart.setHours(0, 0, 0, 0)
    const dayEnd = new Date(date)
    dayEnd.setHours(23, 59, 59, 999)

    return appointments.filter((apt) => {
      const aptStart = new Date(apt.startTime)
      const aptEnd = new Date(apt.endTime)
      return aptStart <= dayEnd && aptEnd >= dayStart
    })
  }

  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === currentDate.getMonth()
  }

  const isToday = (date: Date) => {
    const today = new Date()
    return date.toDateString() === today.toDateString()
  }

  const getAppointmentCounts = (appointments: Appointment[]) => {
    const counts: { [key: string]: number } = {}
    appointments.forEach((apt) => {
      const key = apt.type || "Other"
      counts[key] = (counts[key] || 0) + 1
    })
    return counts
  }

  return (
    <div className="flex flex-col h-full">
      {/* Days of Week Header */}
      <div className="grid grid-cols-7 border-b bg-gray-50">
        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
          <div key={day} className="p-3 text-center font-medium text-sm border-r last:border-r-0">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="flex-1 grid grid-cols-7 grid-rows-6">
        {monthData.map((date, index) => {
          const dayAppointments = getAppointmentsForDate(date)
          const appointmentCounts = getAppointmentCounts(dayAppointments)
          const isCurrentMonthDay = isCurrentMonth(date)
          const isTodayDate = isToday(date)

          return (
            <div
              key={index}
              className={`border-r border-b last:border-r-0 p-2 min-h-[120px] ${
                !isCurrentMonthDay ? "bg-gray-50 text-gray-400" : "bg-white"
              } ${isTodayDate ? "bg-blue-50" : ""}`}
            >
              <div className={`text-sm font-medium mb-2 ${isTodayDate ? "text-blue-600" : ""}`}>{date.getDate()}</div>

              <div className="space-y-1">
                {Object.entries(appointmentCounts)
                  .slice(0, 3)
                  .map(([type, count]) => {
                    const appointment = dayAppointments.find((apt) => apt.type === type)
                    if (!appointment) return null

                    return (
                      <div
                        key={type}
                        className={`text-xs px-2 py-1 rounded text-white font-medium ${appointment.color}`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="truncate">{type}</span>
                          <span className="ml-1 bg-black bg-opacity-20 px-1 rounded text-xs">{count}</span>
                        </div>
                      </div>
                    )
                  })}

                {Object.keys(appointmentCounts).length > 3 && (
                  <div className="text-xs text-gray-600 font-medium">
                    +{Object.keys(appointmentCounts).length - 3} more...
                  </div>
                )}

                {dayAppointments.length > 0 && (
                  <div className="text-xs text-gray-500 mt-1">
                    {dayAppointments.slice(0, 2).map((apt) => (
                      <div key={apt.id} className="truncate">
                        {apt.facility} ({apt.provider})
                      </div>
                    ))}
                    {dayAppointments.length > 2 && (
                      <div className="text-blue-600 cursor-pointer hover:underline">More...</div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
