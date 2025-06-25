"use client"

import { useState, useEffect } from "react"
import { Calendar, CalendarDays } from "lucide-react"
import { format } from "date-fns"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import type { Appointment } from "./scheduling-dashboard"

interface AppointmentModalProps {
  isOpen: boolean
  onClose: () => void
  appointment?: Appointment | null
  facilities: string[]
  onSave: (appointmentData: Partial<Appointment>) => void
}

const appointmentTypes = [
  { value: "X-Ray Tech", color: "bg-green-400" },
  { value: "MA", color: "bg-orange-400" },
  { value: "Doctor", color: "bg-blue-400" },
  { value: "Emergency", color: "bg-red-500" },
  { value: "Consultation", color: "bg-purple-400" },
  { value: "Surgery", color: "bg-indigo-400" },
]

export function AppointmentModal({
  isOpen,
  onClose,
  appointment,
  facilities,
  onSave,
}: AppointmentModalProps) {
  const [title, setTitle] = useState("")
  const [provider, setProvider] = useState("")
  const [facility, setFacility] = useState("")
  const [startDate, setStartDate] = useState<Date | undefined>(new Date())
  const [endDate, setEndDate] = useState<Date | undefined>(new Date())
  const [startTime, setStartTime] = useState("09:00")
  const [endTime, setEndTime] = useState("17:00")
  const [type, setType] = useState("")
  const [color, setColor] = useState("bg-blue-400")

  // Pre-populate form when editing an appointment
  useEffect(() => {
    if (appointment) {
      setTitle(appointment.title)
      setProvider(appointment.provider)
      setFacility(appointment.facility)
      setType(appointment.type)
      setColor(appointment.color)
      
      const start = new Date(appointment.startTime)
      const end = new Date(appointment.endTime)
      
      setStartDate(start)
      setEndDate(end)
      setStartTime(format(start, "HH:mm"))
      setEndTime(format(end, "HH:mm"))
    } else {
      // Reset form for new appointment
      setTitle("")
      setProvider("")
      setFacility("")
      setStartDate(new Date())
      setEndDate(new Date())
      setStartTime("09:00")
      setEndTime("17:00")
      setType("")
      setColor("bg-blue-400")
    }
  }, [appointment, isOpen])

  const handleSave = () => {
    if (!startDate || !endDate) return

    const [startHour, startMinute] = startTime.split(":").map(Number)
    const [endHour, endMinute] = endTime.split(":").map(Number)

    const startDateTime = new Date(startDate)
    startDateTime.setHours(startHour, startMinute, 0, 0)

    const endDateTime = new Date(endDate)
    endDateTime.setHours(endHour, endMinute, 0, 0)

    const appointmentData: Partial<Appointment> = {
      id: appointment?.id || `new-${Date.now()}`,
      title,
      provider,
      facility,
      startTime: startDateTime,
      endTime: endDateTime,
      type,
      color,
    }

    onSave(appointmentData)
    onClose()
  }

  const handleTypeChange = (selectedType: string) => {
    setType(selectedType)
    const typeConfig = appointmentTypes.find(t => t.value === selectedType)
    if (typeConfig) {
      setColor(typeConfig.color)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {appointment ? "Edit Appointment" : "Create New Appointment"}
          </DialogTitle>
          <DialogDescription>
            {appointment 
              ? "Update the appointment details below."
              : "Fill in the details to create a new appointment."
            }
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="title" className="text-right">
              Title
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="col-span-3"
              placeholder="Appointment title"
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="provider" className="text-right">
              Provider
            </Label>
            <Input
              id="provider"
              value={provider}
              onChange={(e) => setProvider(e.target.value)}
              className="col-span-3"
              placeholder="Provider name"
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="facility" className="text-right">
              Facility
            </Label>
            <Select value={facility} onValueChange={setFacility}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select facility" />
              </SelectTrigger>
              <SelectContent>
                {facilities.map((f) => (
                  <SelectItem key={f} value={f}>
                    {f}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="type" className="text-right">
              Type
            </Label>
            <Select value={type} onValueChange={handleTypeChange}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select appointment type" />
              </SelectTrigger>
              <SelectContent>
                {appointmentTypes.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded ${t.color}`} />
                      {t.value}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Start Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="col-span-3 justify-start text-left font-normal"
                >
                  <CalendarDays className="mr-2 h-4 w-4" />
                  {startDate ? format(startDate, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <CalendarComponent
                  mode="single"
                  selected={startDate}
                  onSelect={setStartDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="startTime" className="text-right">
              Start Time
            </Label>
            <Input
              id="startTime"
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="col-span-3"
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">End Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="col-span-3 justify-start text-left font-normal"
                >
                  <CalendarDays className="mr-2 h-4 w-4" />
                  {endDate ? format(endDate, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <CalendarComponent
                  mode="single"
                  selected={endDate}
                  onSelect={setEndDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="endTime" className="text-right">
              End Time
            </Label>
            <Input
              id="endTime"
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="col-span-3"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            {appointment ? "Update" : "Create"} Appointment
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}