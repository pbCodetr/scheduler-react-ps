"use client"
import { SchedulingDashboard } from "@/components/scheduling-dashboard"

// Sample data structure for appointments with automatic date spanning
const sampleAppointments = [
  {
    id: "1",
    title: "X-Ray Tech",
    provider: "Dr. Smith",
    facility: "paras hospital",
    startTime: new Date("2025-06-25T11:00:00"),
    endTime: new Date("2025-06-27T17:00:00"),
    type: "X-Ray Tech",
    color: "bg-green-400",
  },
  {
    id: "2",
    title: "MA",
    provider: "jeswin-3",
    facility: "jeswin-test - OnCall",
    startTime: new Date("2025-06-24T08:30:00"),
    endTime: new Date("2025-06-24T12:00:00"),
    type: "MA",
    color: "bg-orange-400",
  },
  {
    id: "3",
    title: "Atish",
    provider: "Atish",
    facility: "paras hospital - OnCall",
    startTime: new Date("2025-06-24T14:00:00"),
    endTime: new Date("2025-06-25T10:00:00"),
    type: "Atish",
    color: "bg-red-400",
  },
  {
    id: "4",
    title: "X-Ray Tech",
    provider: "Om Randhawa",
    facility: "Kappu Hospital",
    startTime: new Date("2025-06-26T09:00:00"),
    endTime: new Date("2025-06-28T15:00:00"),
    type: "X-Ray Tech",
    color: "bg-green-400",
  },
  {
    id: "5",
    title: "Doctor Atish Kumar",
    provider: "Doctor Atish Kumar",
    facility: "Kappu Hospital - OnCall",
    startTime: new Date("2025-06-23T10:00:00"),
    endTime: new Date("2025-06-23T14:00:00"),
    type: "MA",
    color: "bg-green-300",
  },
  {
    id: "6",
    title: "Emergency Call",
    provider: "Dr. Emergency",
    facility: "paras hospital",
    startTime: new Date("2025-06-25T13:30:00"),
    endTime: new Date("2025-06-25T16:00:00"),
    type: "Emergency",
    color: "bg-red-500",
  },
]

const facilities = [
  "paras hospital",
  "paras hospital - OnCall",
  "Kappu Hospital",
  "Kappu Hospital - OnCall",
  "jeswin-test - OnCall",
  "Delhi AIIMS - OnCall",
  "sneh hospital - OnCall",
]

// Define facility groups for reordering
const facilityGroups = [
  {
    id: "paras-group",
    name: "Paras Hospital",
    facilities: ["paras hospital", "paras hospital - OnCall"],
    color: "hsl(200, 70%, 95%)",
  },
  {
    id: "kappu-group",
    name: "Kappu Hospital",
    facilities: ["Kappu Hospital", "Kappu Hospital - OnCall"],
    color: "hsl(120, 70%, 95%)",
  },
  {
    id: "other-group",
    name: "Other Facilities",
    facilities: ["jeswin-test - OnCall", "Delhi AIIMS - OnCall", "sneh hospital - OnCall"],
    color: "hsl(60, 70%, 95%)",
  },
]

export default function Page() {
  return (
    <div className="min-h-screen bg-gray-50">
      <SchedulingDashboard appointments={sampleAppointments} facilities={facilities} facilityGroups={facilityGroups} />
    </div>
  )
}
