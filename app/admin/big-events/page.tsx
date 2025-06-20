"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Plus, Edit, Trash2, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DashboardLayout } from "@/components/layout/sidebar"
import { supabase } from "@/lib/supabase"
import { getCurrentUser } from "@/lib/auth"
import { CalendarDays } from "lucide-react"

interface BigEvent {
  id: string
  name: string
  description: string | null
  start_date: string
  end_date: string
  status: "draft" | "active" | "completed" | "cancelled"
  created_at: string
}

export default function BigEventsPage() {
  const [events, setEvents] = useState<BigEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingEvent, setEditingEvent] = useState<BigEvent | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    start_date: "",
    end_date: "",
    status: "draft" as const,
  })

  useEffect(() => {
    loadEvents()
  }, [])

  const loadEvents = async () => {
    const { data, error } = await supabase.from("big_events").select("*").order("created_at", { ascending: false })

    if (data) {
      setEvents(data)
    }
    setLoading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const user = await getCurrentUser()
      if (!user) {
        console.error("No authenticated user found")
        return
      }

      if (editingEvent) {
        // Update existing event
        const { error } = await supabase.from("big_events").update(formData).eq("id", editingEvent.id)

        if (error) {
          console.error("Error updating event:", error)
          return
        }

        await loadEvents()
        resetForm()
      } else {
        // Create new event
        const { error } = await supabase.from("big_events").insert({
          ...formData,
          created_by: user.id,
        })

        if (error) {
          console.error("Error creating event:", error)
          return
        }

        await loadEvents()
        resetForm()
      }
    } catch (error) {
      console.error("Error in form submission:", error)
    }
  }

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      start_date: "",
      end_date: "",
      status: "draft",
    })
    setEditingEvent(null)
    setDialogOpen(false)
  }

  const handleEdit = (event: BigEvent) => {
    setEditingEvent(event)
    setFormData({
      name: event.name,
      description: event.description || "",
      start_date: event.start_date,
      end_date: event.end_date,
      status: event.status,
    })
    setDialogOpen(true)
  }

  const handleDelete = async (eventId: string) => {
    if (confirm("Are you sure you want to delete this event?")) {
      const { error } = await supabase.from("big_events").delete().eq("id", eventId)

      if (!error) {
        loadEvents()
      }
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800"
      case "completed":
        return "bg-blue-100 text-blue-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (loading) {
    return (
      <DashboardLayout userRole="admin">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout userRole="admin">
      <div className="space-y-6">
        <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Big Events</h2>
            <p className="text-muted-foreground">Manage conferences, summits, and major events</p>
          </div>

          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setEditingEvent(null)} className="w-full md:w-auto">
                <Plus className="mr-2 h-4 w-4" />
                Create Event
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] mx-4">
              <DialogHeader>
                <DialogTitle>{editingEvent ? "Edit Event" : "Create New Event"}</DialogTitle>
                <DialogDescription>
                  {editingEvent ? "Update the event details below." : "Fill in the details to create a new big event."}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit}>
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Event Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="start_date">Start Date</Label>
                      <Input
                        id="start_date"
                        type="date"
                        value={formData.start_date}
                        onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="end_date">End Date</Label>
                      <Input
                        id="end_date"
                        type="date"
                        value={formData.end_date}
                        onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value: any) => setFormData({ ...formData, status: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter className="flex-col space-y-2 md:flex-row md:space-y-0">
                  <Button type="button" variant="outline" onClick={resetForm} className="w-full md:w-auto">
                    Cancel
                  </Button>
                  <Button type="submit" className="w-full md:w-auto">
                    {editingEvent ? "Update Event" : "Create Event"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => (
            <Card key={event.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="min-w-0 flex-1">
                    <CardTitle className="text-lg truncate">{event.name}</CardTitle>
                    <CardDescription className="mt-1">
                      {new Date(event.start_date).toLocaleDateString()} -{" "}
                      {new Date(event.end_date).toLocaleDateString()}
                    </CardDescription>
                  </div>
                  <Badge className={`${getStatusColor(event.status)} ml-2 flex-shrink-0`}>{event.status}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                  {event.description || "No description provided"}
                </p>

                <div className="flex justify-end space-x-2">
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4" />
                    <span className="sr-only">View</span>
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleEdit(event)}>
                    <Edit className="h-4 w-4" />
                    <span className="sr-only">Edit</span>
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleDelete(event.id)}>
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Delete</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {events.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <CalendarDays className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No events yet</h3>
              <p className="text-muted-foreground text-center mb-4">Get started by creating your first big event</p>
              <Button onClick={() => setDialogOpen(true)} className="w-full md:w-auto">
                <Plus className="mr-2 h-4 w-4" />
                Create Event
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}
