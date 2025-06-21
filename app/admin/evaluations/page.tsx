"use client"

import { useState, useEffect } from "react"
import { Trophy, User, Check, X, Clock, Award } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DashboardLayout } from "@/components/layout/sidebar"
import { useAuth } from "@/lib/auth"
import { competitionsApi, evaluationsApi } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

export default function EvaluationsPage() {
  const { user } = useAuth()
  const [competitions, setCompetitions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCompetition, setSelectedCompetition] = useState<any>(null)
  const [evaluationData, setEvaluationData] = useState<any[]>([])
  const { toast } = useToast()

  useEffect(() => {
    loadCompetitions()
  }, [])

  const loadCompetitions = async () => {
    try {
      setLoading(true)
      const data = await competitionsApi.getAll()
      setCompetitions(data)
      if (data.length > 0) {
        setSelectedCompetition(data[0])
        await loadEvaluationData(data[0].id)
      }
    } catch (error) {
      console.error("Error loading competitions:", error)
      toast({
        title: "Error",
        description: "Failed to load competitions.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const loadEvaluationData = async (competitionId: string) => {
    try {
      setLoading(true);
      const data = await evaluationsApi.getEvaluationProgress(competitionId);
      setEvaluationData(data);
    } catch (error) {
      console.error("Error loading evaluation data:", error);
      toast({
        title: "Error",
        description: "Failed to load evaluation progress.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCompetitionChange = async (competition: any) => {
    setSelectedCompetition(competition)
    await loadEvaluationData(competition.id)
  }

  if (loading) {
    return (
      <DashboardLayout userRole="admin" user={user}>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout userRole="admin" user={user}>
      <div className="space-y-6">
        <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Evaluations Tracking</h2>
            <p className="text-muted-foreground">Monitor judging progress and completion status</p>
          </div>
        </div>

        {/* Competition Selector */}
        <Card>
          <CardHeader>
            <CardTitle>Select Competition</CardTitle>
            <CardDescription>Choose a competition to view evaluation progress</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {competitions.map((competition) => (
                <Button
                  key={competition.id}
                  variant={selectedCompetition?.id === competition.id ? "default" : "outline"}
                  onClick={() => handleCompetitionChange(competition)}
                >
                  {competition.name}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {selectedCompetition && (
          <>
            {/* Stats Cards */}
            <div className="grid gap-4 grid-cols-1 md:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Contestants</CardTitle>
                  <User className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-primary">
                    {evaluationData.length}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Completed Evaluations</CardTitle>
                  <Check className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {evaluationData.filter(e => e.evaluation_status === 'completed').length}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending Evaluations</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-yellow-600">
                    {evaluationData.filter(e => e.evaluation_status === 'pending').length}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Average Score</CardTitle>
                  <Award className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-primary">
                    {evaluationData.length > 0 
                      ? (evaluationData.reduce((sum, e) => sum + (e.average_score || 0), 0) / evaluationData.length).toFixed(1)
                      : '0'}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Evaluations Table */}
            <Card>
              <CardHeader>
                <CardTitle>Evaluation Progress</CardTitle>
                <CardDescription>
                  {selectedCompetition.name} - {selectedCompetition.status.toUpperCase()}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Contestant</TableHead>
                      <TableHead>Project</TableHead>
                      <TableHead className="text-center">Judges Assigned</TableHead>
                      <TableHead className="text-center">Evaluations Completed</TableHead>
                      <TableHead className="text-center">Average Score</TableHead>
                      <TableHead className="text-center">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {evaluationData.map((entry) => (
                      <TableRow key={entry.contestant_id}>
                        <TableCell className="font-medium">{entry.contestant_name}</TableCell>
                        <TableCell>{entry.project_title || "N/A"}</TableCell>
                        <TableCell className="text-center">{entry.judges_assigned}</TableCell>
                        <TableCell className="text-center">{entry.evaluations_completed}</TableCell>
                        <TableCell className="text-center">
                          {entry.average_score ? entry.average_score.toFixed(1) : "N/A"}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge 
                            variant={
                              entry.evaluation_status === 'completed' ? 'default' : 
                              entry.evaluation_status === 'pending' ? 'secondary' : 'outline'
                            }
                          >
                            {entry.evaluation_status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </>
        )}

        {competitions.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Trophy className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No competitions yet</h3>
              <p className="text-muted-foreground text-center mb-4">
                Create competitions to start tracking evaluations
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}