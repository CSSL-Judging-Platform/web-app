"use client"

import { useState, useEffect } from "react"
import { Calendar, Users, Trophy, Eye, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { DashboardLayout } from "@/components/layout/sidebar"
import { getCurrentUser } from "@/lib/auth"
import { mockData } from "@/lib/mock-data"

interface Event {
  id: string
  name: string
  description: string
  start_date: string
  end_date: string
  status: "active" | "upcoming" | "completed"
  big_event_name: string
  location?: string
  registration_deadline?: string
  max_participants?: number
  current_participants: number
  is_registered: boolean
}

export default function ContestantEventsPage() {
  const [user, setUser] = useState<any>(null)
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)

  useEffect(() => {
    loadEvents()
  }, [])

  const loadEvents = async () => {
    try {
      const currentUser = await getCurrentUser()
      setUser(currentUser)

      // Filter only active events for contestants
      const activeEvents = mockData.bigEvents
        .filter((event) => event.status === "active")
        .flatMap((bigEvent) => {
          const competitions = mockData.competitions.filter(
            (comp) => comp.big_event_id === bigEvent.id && comp.status === "active",
          )

          return competitions.map((comp) => ({
            id: comp.id,
            name: comp.name,
            description: comp.description,
            start_date: comp.start_date,
            end_date: comp.end_date,
            status: "active" as const,
            big_event_name: bigEvent.name,
            location: "University Campus",
            registration_deadline: "2024-03-10",
            max_participants: 50,
            current_participants: comp.contestants_count,
            is_registered: mockData.contestants.some(
              (c) => c.competition_id === comp.id && c.contestant_email === currentUser?.email,
            ),
          }))
        })

      setEvents(activeEvents)
    } catch (error) {
      console.error("Error loading events:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (eventId: string) => {
    try {
      console.log("Registering for event:", eventId)
      // Mock registration
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Update local state
      setEvents((prev) =>
        prev.map((event) =>
          event.id === eventId
            ? { ...event, is_registered: true, current_participants: event.current_participants + 1 }
            : event,
        ),
      )

      alert("Successfully registered for the competition!")
    } catch (error) {
      console.error("Error registering:", error)
      alert("Failed to register. Please try again.")
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      case "upcoming":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
      case "completed":
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
    }
  }

  if (loading) {
    return (
      <DashboardLayout userRole="contestant" user={user}>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout userRole="contestant" user={user}>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Available Competitions</h2>
          <p className="text-muted-foreground">Discover and register for active competitions</p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Available Competitions</CardTitle>
              <Trophy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{events.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">My Registrations</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{events.filter((e) => e.is_registered).length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Participants</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">
                {events.reduce((sum, event) => sum + event.current_participants, 0)}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Events Grid */}
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => (
            <Card key={event.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="min-w-0 flex-1">
                    <CardTitle className="text-lg">{event.name}</CardTitle>
                    <CardDescription className="mt-1">{event.big_event_name}</CardDescription>
                  </div>
                  <div className="flex flex-col items-end space-y-1">
                    <Badge className={`${getStatusColor(event.status)} flex-shrink-0`}>{event.status}</Badge>
                    {event.is_registered && (
                      <Badge variant="outline" className="text-xs">
                        Registered
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground line-clamp-2">{event.description}</p>

                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center">
                    <Calendar className="mr-2 h-4 w-4" />
                    {new Date(event.start_date).toLocaleDateString()}
                  </div>
                  <div className="flex items-center">
                    <MapPin className="mr-2 h-4 w-4" />
                    {event.location}
                  </div>
                  <div className="flex items-center">
                    <Users className="mr-2 h-4 w-4" />
                    {event.current_participants} / {event.max_participants} participants
                  </div>
                </div>

                <div className="flex justify-between items-center pt-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" onClick={() => setSelectedEvent(event)}>
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px] mx-4">
                      <DialogHeader>
                        <DialogTitle>{selectedEvent?.name}</DialogTitle>
                        <DialogDescription>{selectedEvent?.big_event_name}</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-medium mb-2">Description</h4>
                          <p className="text-sm text-muted-foreground">{selectedEvent?.description}</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <h4 className="font-medium">Start Date</h4>
                            <p className="text-muted-foreground">
                              {selectedEvent && new Date(selectedEvent.start_date).toLocaleDateString()}
                            </p>
                          </div>
                          <div>
                            <h4 className="font-medium">End Date</h4>
                            <p className="text-muted-foreground">
                              {selectedEvent && new Date(selectedEvent.end_date).toLocaleDateString()}
                            </p>
                          </div>
                          <div>
                            <h4 className="font-medium">Location</h4>
                            <p className="text-muted-foreground">{selectedEvent?.location}</p>
                          </div>
                          <div>
                            <h4 className="font-medium">Registration Deadline</h4>
                            <p className="text-muted-foreground">
                              {selectedEvent?.registration_deadline &&
                                new Date(selectedEvent.registration_deadline).toLocaleDateString()}
                            </p>
                          </div>
                        </div>

                        <div>
                          <h4 className="font-medium mb-2">Participation</h4>
                          <div className="flex items-center justify-between text-sm">
                            <span>Current Participants</span>
                            <span>
                              {selectedEvent?.current_participants} / {selectedEvent?.max_participants}
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                            <div
                              className="bg-primary h-2 rounded-full"
                              style={{
                                width: `${
                                  selectedEvent
                                    ? (selectedEvent.current_participants / (selectedEvent.max_participants || 1)) * 100
                                    : 0
                                }%`,
                              }}
                            ></div>
                          </div>
                        </div>

                        {selectedEvent && !selectedEvent.is_registered && (
                          <Button
                            onClick={() => handleRegister(selectedEvent.id)}
                            className="w-full"
                            disabled={selectedEvent.current_participants >= (selectedEvent.max_participants || 0)}
                          >
                            {selectedEvent.current_participants >= (selectedEvent.max_participants || 0)
                              ? "Competition Full"
                              : "Register Now"}
                          </Button>
                        )}

                        {selectedEvent?.is_registered && (
                          <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                            <p className="text-green-700 dark:text-green-300 font-medium">
                              ✓ You are registered for this competition
                            </p>
                          </div>
                        )}
                      </div>
                    </DialogContent>
                  </Dialog>

                  {!event.is_registered ? (
                    <Button
                      size="sm"
                      onClick={() => handleRegister(event.id)}
                      disabled={event.current_participants >= (event.max_participants || 0)}
                    >
                      {event.current_participants >= (event.max_participants || 0) ? "Full" : "Register"}
                    </Button>
                  ) : (
                    <Badge variant="default" className="px-3 py-1">
                      Registered
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {events.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Trophy className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No active competitions</h3>
              <p className="text-muted-foreground text-center">
                There are no active competitions available for registration at the moment. Check back later!
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}
