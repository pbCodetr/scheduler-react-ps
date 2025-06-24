"use client"

import type React from "react"

import { useMemo, useState, useCallback } from "react"
import type { Appointment } from "./scheduling-dashboard"

interface DayViewProps {
  currentDate: Date
  appointments: Appointment[]
  facilities: string[]
  onAppointmentUpdate?: (appointmentId: string, newStartTime: Date, newEndTime: Date, newFacility: string) => void
}

export function DayView({ currentDate, appointments, facilities, onAppointmentUpdate }: DayViewProps) {
  const [draggedAppointment, setDraggedAppointment] = useState<string | null>(null)
  const [dragOverCell, setDragOverCell] = useState<{ facility: string; timeSlot: number } | null>(null)

  const dayAppointments = useMemo(() => {
    const dayStart = new Date(currentDate)
    dayStart.setHours(0, 0, 0, 0)
    const dayEnd = new Date(currentDate)
    dayEnd.setHours(23, 59, 59, 999)

    return appointments.filter((apt) => {
      const aptStart = new Date(apt.startTime)
      const aptEnd = new Date(apt.endTime)
      return aptStart <= dayEnd && aptEnd >= dayStart
    })
  }, [currentDate, appointments])

  const getAppointmentsForFacility = useCallback(
    (facility: string) => {
      return dayAppointments.filter((apt) => apt.facility === facility)
    },
    [dayAppointments],
  )

  const calculateHorizontalPosition = useCallback(
    (appointment: Appointment) => {
      const aptStart = new Date(appointment.startTime)
      const aptEnd = new Date(appointment.endTime)

      const dayStart = new Date(currentDate)
      dayStart.setHours(0, 0, 0, 0)
      const dayEnd = new Date(currentDate)
      dayEnd.setHours(23, 59, 59, 999)

      const effectiveStart = aptStart > dayStart ? aptStart : dayStart
      const effectiveEnd = aptEnd < dayEnd ? aptEnd : dayEnd

      const startHour = effectiveStart.getHours() + effectiveStart.getMinutes() / 60
      const endHour = effectiveEnd.getHours() + effectiveEnd.getMinutes() / 60

      const left = (startHour / 24) * 100
      const width = ((endHour - startHour) / 24) * 100

      return {
        left: `${Math.max(0, left)}%`,
        width: `${Math.max(2, width)}%`,
        minWidth: "80px",
      }
    },
    [currentDate],
  )

  const getAppointmentLanes = useCallback((appointments: Appointment[]) => {
    const sortedAppointments = [...appointments].sort(
      (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime(),
    )

    const lanes: Appointment[][] = []

    sortedAppointments.forEach((appointment) => {
      const aptStart = new Date(appointment.startTime)
      const aptEnd = new Date(appointment.endTime)

      let laneIndex = 0
      while (laneIndex < lanes.length) {
        const lane = lanes[laneIndex]
        const hasOverlap = lane.some((existingApt) => {
          const existingStart = new Date(existingApt.startTime)
          const existingEnd = new Date(existingApt.endTime)
          return aptStart < existingEnd && aptEnd > existingStart
        })

        if (!hasOverlap) {
          lane.push(appointment)
          break
        }
        laneIndex++
      }

      if (laneIndex === lanes.length) {
        lanes.push([appointment])
      }
    })

    return lanes
  }, [])

  const handleDragStart = useCallback((e: React.DragEvent, appointmentId: string) => {
    setDraggedAppointment(appointmentId)
    e.dataTransfer.effectAllowed = "move"
    e.dataTransfer.setData("text/plain", appointmentId)
  }, [])

  const getTimeSlotFromPosition = useCallback((e: React.DragEvent, cellElement: HTMLElement) => {
    const rect = cellElement.getBoundingClientRect()
    const x = e.clientX - rect.left
    const cellWidth = rect.width
    const timeRatio = Math.max(0, Math.min(1, x / cellWidth))
    return Math.floor(timeRatio * 24) // 24 hour slots
  }, [])

  const handleDragOver = useCallback(
    (e: React.DragEvent, facility: string) => {
      e.preventDefault()
      e.dataTransfer.dropEffect = "move"
      const timeSlot = getTimeSlotFromPosition(e, e.currentTarget as HTMLElement)
      setDragOverCell({ facility, timeSlot })
    },
    [getTimeSlotFromPosition],
  )

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setDragOverCell(null)
    }
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent, facility: string) => {
      e.preventDefault()
      const appointmentId = e.dataTransfer.getData("text/plain")

      if (appointmentId && onAppointmentUpdate) {
        const appointment = appointments.find((apt) => apt.id === appointmentId)
        if (appointment) {
          const timeSlot = getTimeSlotFromPosition(e, e.currentTarget as HTMLElement)
          const newStartHour = timeSlot
          const newStartMinute = 0

          const originalDuration = new Date(appointment.endTime).getTime() - new Date(appointment.startTime).getTime()

          const newStartTime = new Date(currentDate)
          newStartTime.setHours(newStartHour, newStartMinute, 0, 0)

          const newEndTime = new Date(newStartTime.getTime() + originalDuration)

          onAppointmentUpdate(appointmentId, newStartTime, newEndTime, facility)
        }
      }

      setDraggedAppointment(null)
      setDragOverCell(null)
    },
    [appointments, onAppointmentUpdate, currentDate, getTimeSlotFromPosition],
  )

  const formatTime = useCallback((date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    })
  }, [])

  const formatDate = useCallback((date: Date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }, [])

  const timeMarkers = useMemo(() => {
    return Array.from({ length: 13 }, (_, i) => i * 2) // Every 2 hours
  }, [])

  const hourlySlots = useMemo(() => {
    return Array.from({ length: 24 }, (_, i) => i)
  }, [])

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="border-b bg-gray-50 p-4">
        <h2 className="text-lg font-semibold mb-3">{formatDate(currentDate)}</h2>
        {/* Time markers */}
        <div className="flex text-xs text-gray-500 relative h-6 ml-48">
          {timeMarkers.map((hour) => (
            <div
              key={hour}
              className="absolute text-xs font-medium"
              style={{ left: `${(hour / 24) * 100}%`, transform: "translateX(-50%)" }}
            >
              {hour < 24 ? `${String(hour).padStart(2, "0")}:00` : ""}
            </div>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        <div className="grid grid-cols-[200px_1fr]">
          {/* Facility Column */}
          <div className="border-r bg-gray-50">
            {facilities.map((facility) => {
              const facilityAppointments = getAppointmentsForFacility(facility)
              const appointmentLanes = getAppointmentLanes(facilityAppointments)
              const rowHeight = Math.max(120, appointmentLanes.length * 55)

              return (
                <div
                  key={facility}
                  className="border-b p-3 font-medium text-sm flex items-center"
                  style={{ height: `${rowHeight}px` }}
                >
                  {facility}
                </div>
              )
            })}
          </div>

          {/* Timeline Grid */}
          <div>
            {facilities.map((facility) => {
              const facilityAppointments = getAppointmentsForFacility(facility)
              const appointmentLanes = getAppointmentLanes(facilityAppointments)
              const rowHeight = Math.max(120, appointmentLanes.length * 55)

              return (
                <div
                  key={facility}
                  className="border-b relative bg-white"
                  style={{ height: `${rowHeight}px` }}
                  onDragOver={(e) => handleDragOver(e, facility)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, facility)}
                >
                  {/* Time grid lines */}
                  <div className="absolute inset-0 pointer-events-none">
                    {hourlySlots.map((hour) => (
                      <div
                        key={hour}
                        className="absolute top-0 bottom-0 border-l border-gray-100"
                        style={{ left: `${(hour / 24) * 100}%` }}
                      />
                    ))}
                  </div>

                  {/* Precise drop zone highlighting */}
                  {dragOverCell?.facility === facility && (
                    <div
                      className="absolute top-0 bottom-0 bg-blue-200 opacity-50 pointer-events-none border-l-2 border-r-2 border-blue-400"
                      style={{
                        left: `${(dragOverCell.timeSlot / 24) * 100}%`,
                        width: `${(1 / 24) * 100}%`,
                      }}
                    />
                  )}

                  {/* Appointments */}
                  {appointmentLanes.map((lane, laneIndex) =>
                    lane.map((appointment) => {
                      const style = calculateHorizontalPosition(appointment)
                      const isDragging = draggedAppointment === appointment.id

                      return (
                        <div
                          key={appointment.id}
                          className={`absolute rounded px-3 py-2 text-xs text-white font-medium ${appointment.color} cursor-move hover:opacity-80 transition-all duration-200 ${isDragging ? "opacity-50 shadow-lg scale-105" : ""}`}
                          style={{
                            ...style,
                            top: `${laneIndex * 50 + 10}px`,
                            height: "40px",
                            zIndex: isDragging ? 1000 : 1,
                          }}
                          draggable
                          onDragStart={(e) => handleDragStart(e, appointment.id)}
                        >
                          <div className="font-semibold truncate">{appointment.title}</div>
                          <div className="text-xs opacity-90 truncate">
                            {formatTime(new Date(appointment.startTime))} - {formatTime(new Date(appointment.endTime))}
                          </div>
                        </div>
                      )
                    }),
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
