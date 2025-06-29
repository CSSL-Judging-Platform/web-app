"use client"

import { useState, useEffect } from "react"
import { Save, Star, MessageSquare, ArrowLeft, ArrowRight, Trophy, CheckCircle, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { DashboardLayout } from "@/components/layout/sidebar"
import { getCurrentUser } from "@/lib/auth"
import { mockData } from "@/lib/mock-data"
import { useSearchParams } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { judgesApi } from "@/lib/api"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { supabase } from "@/lib/supabase"

interface JudgingCriteria {
  id: string
  name: string
  description: string
  max_points: number
  weight: number
}

interface Contestant {
  id: string
  contestant_name: string
  contestant_email: string
  registration_number: string
  project_title?: string
  project_description?: string
}

interface Score {
  criteria_id: string
  score: number
  feedback: string
}

export default function JudgingPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState("")
  const [selectedContestant, setSelectedContestant] = useState("")
  const [currentContestantIndex, setCurrentContestantIndex] = useState(0)
  const [events, setEvents] = useState<any[]>([])
  const [contestants, setContestants] = useState<Contestant[]>([])
  const [criteria, setCriteria] = useState<JudgingCriteria[]>([])
  const [scores, setScores] = useState<Score[]>([])
  const [isDraft, setIsDraft] = useState(true)
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})
  const [showScoresDialog, setShowScoresDialog] = useState(false)
  const [currentScores, setCurrentScores] = useState<Score[]>([])

  const searchParams = useSearchParams()
  const { toast } = useToast()

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    if (selectedEvent) {
      loadEventData()
    }
  }, [selectedEvent])

  useEffect(() => {
    if (selectedContestant) {
      loadContestantScores()
    }
  }, [selectedContestant])

  const loadData = async () => {
    try {
      const currentUser = await getCurrentUser();
      setUser(currentUser);

      if (!currentUser?.id) {
        throw new Error("User not authenticated");
      }

      // Get judge's assigned competitions
      const assignedCompetitions = await judgesApi.getJudgeAssignments(currentUser.id);
      setEvents(assignedCompetitions);

      // Check if event is specified in URL params
      const eventParam = searchParams.get("event");
      if (eventParam && assignedCompetitions.find((e: any) => e.id === eventParam)) {
        setSelectedEvent(eventParam);
      }
    } catch (error) {
      console.error("Error loading data:", error);
      toast({
        title: "Error",
        description: "Failed to load judging data.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadEventData = async () => {
    try {
      if (!selectedEvent) return;

      // Load contestants and criteria in parallel
      const [eventContestants, eventCriteria] = await Promise.all([
        judgesApi.getContestants(selectedEvent),
        judgesApi.getJudgingCriteria(selectedEvent)
      ]);

      setContestants(eventContestants);
      setCriteria(eventCriteria);

      if (eventContestants.length > 0) {
        setSelectedContestant(eventContestants[0].id);
        setCurrentContestantIndex(0);
      }

      toast({
        title: "Competition Loaded",
        description: `Loaded ${eventContestants.length} contestants and ${eventCriteria.length} criteria.`,
      });
    } catch (error) {
      console.error("Error loading event data:", error);
      toast({
        title: "Error",
        description: "Failed to load competition data.",
        variant: "destructive",
      });
    }
  };

  const viewDetailedScores = () => {
    setCurrentScores(scores)
    setShowScoresDialog(true)
  }



  const loadContestantScores = async () => {
    try {
      if (!selectedContestant || !user?.id) return;

      // First get the judge ID from profile ID
      const { data: judge, error: judgeError } = await supabase
        .from('judges')
        .select('id')
        .eq('profile_id', user.id)
        .single();

      if (judgeError) throw judgeError;

      // Get existing scores or initialize empty ones
      const { data: existingScores, error } = await supabase
        .from('scores')
        .select('*')
        .eq('judge_id', judge.id)
        .eq('contestant_id', selectedContestant);

      if (error) throw error;

      if (existingScores && existingScores.length > 0) {
        // Map the scores to match our interface
        const formattedScores = existingScores.map(score => ({
          criteria_id: score.criteria_id,
          score: score.score,
          feedback: score.feedback || ""
        }));
        
        setScores(formattedScores);
        setIsDraft(existingScores[0]?.is_draft ?? true);
      } else {
        // Initialize empty scores for all criteria
        const initialScores: Score[] = criteria.map((criterion) => ({
          criteria_id: criterion.id,
          score: 0,
          feedback: "",
        }));
        setScores(initialScores);
        setIsDraft(true);
      }
      
      setValidationErrors({});
    } catch (error) {
      console.error("Error loading scores:", error);
      toast({
        title: "Error",
        description: "Failed to load scores for contestant.",
        variant: "destructive",
      });
    }
  };

  const validateScores = () => {
    const errors: Record<string, string> = {}
    let isValid = true

    scores.forEach((score) => {
      const criterion = criteria.find((c) => c.id === score.criteria_id)
      if (criterion) {
        if (score.score < 0) {
          errors[score.criteria_id] = "Score cannot be negative"
          isValid = false
        } else if (score.score > criterion.max_points) {
          errors[score.criteria_id] = `Score cannot exceed ${criterion.max_points} points`
          isValid = false
        } else if (isNaN(score.score)) {
          errors[score.criteria_id] = "Please enter a valid number"
          isValid = false
        }
      }
    })

    setValidationErrors(errors)
    return isValid
  }

  const updateScore = (criteriaId: string, score: number) => {
    setScores((prev) => prev.map((s) => (s.criteria_id === criteriaId ? { ...s, score } : s)))
    // Clear validation error for this field
    if (validationErrors[criteriaId]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[criteriaId]
        return newErrors
      })
    }
  }

  const updateFeedback = (criteriaId: string, feedback: string) => {
    setScores((prev) => prev.map((s) => (s.criteria_id === criteriaId ? { ...s, feedback } : s)))
  }

  const handleSave = async (asDraft = true) => {
    if (!asDraft && !validateScores()) {
      toast({
        title: "Validation Error",
        description: "Please fix the validation errors before submitting.",
        variant: "destructive",
      });
      return;
    }

    if (!user?.id || !selectedContestant) {
      toast({
        title: "Error",
        description: "Missing required information to save scores.",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      await judgesApi.saveScores({
        judgeId: user.id,
        contestantId: selectedContestant,
        scores: scores,
        isDraft: asDraft
      });

      // Log the activity
      await judgesApi.logJudgingActivity({
        judgeId: user.id,
        contestantId: selectedContestant,
        actionType: asDraft ? 'save_draft' : 'submit_scores'
      });

      setIsDraft(asDraft);
      toast({
        title: asDraft ? "Draft Saved" : "Scores Submitted",
        description: asDraft 
          ? "Scores saved as draft successfully!" 
          : "Final scores submitted successfully!",
      });
    } catch (error) {
      console.error("Error saving scores:", error);
      toast({
        title: "Error",
        description: "Failed to save scores. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const navigateContestant = (direction: "prev" | "next") => {
    const newIndex =
      direction === "next"
        ? Math.min(currentContestantIndex + 1, contestants.length - 1)
        : Math.max(currentContestantIndex - 1, 0)

    setCurrentContestantIndex(newIndex)
    setSelectedContestant(contestants[newIndex].id)

    toast({
      title: "Contestant Changed",
      description: `Now judging: ${contestants[newIndex].contestant_name}`,
    })
  }

  const getTotalScore = () => {
    return scores.reduce((total, score) => total + score.score, 0)
  }

  const getMaxTotalScore = () => {
    return criteria.reduce((total, criterion) => total + criterion.max_points, 0)
  }

  const getScorePercentage = () => {
    const total = getTotalScore()
    const max = getMaxTotalScore()
    return max > 0 ? (total / max) * 100 : 0
  }

  const currentContestant = contestants.find((c) => c.id === selectedContestant)

  if (loading) {
    return (
      <DashboardLayout userRole="judge" user={user}>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout userRole="judge" user={user}>
      <div className="space-y-6">
        <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Judging Interface</h2>
            <p className="text-muted-foreground">Evaluate contestants and provide detailed feedback</p>
          </div>

          <Select value={selectedEvent} onValueChange={setSelectedEvent}>
            <SelectTrigger className="w-full md:w-[250px]">
              <SelectValue placeholder="Select competition to judge" />
            </SelectTrigger>
            <SelectContent>
              {events.map((event) => (
                <SelectItem key={event.id} value={event.id}>
                  {event.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedEvent && contestants.length > 0 && (
          <>
            {/* Contestant Navigation */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Trophy className="h-5 w-5" />
                      {currentContestant?.contestant_name}
                    </CardTitle>
                    <CardDescription>
                      {currentContestant?.registration_number} • {currentContestant?.contestant_email}
                    </CardDescription>
                  </div>
                  <Badge variant={isDraft ? "outline" : "default"}>{isDraft ? "Draft" : "Submitted"}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {currentContestant?.additional_info?.project_title && (
                    <div>
                      <Label className="text-sm font-medium">Project Title</Label>
                      <p className="text-sm text-muted-foreground">{currentContestant.additional_info.project_title}</p>
                    </div>
                  )}

                  {currentContestant?.additional_info?.project_description && (
                    <div>
                      <Label className="text-sm font-medium">Project Description</Label>
                      <p className="text-sm text-muted-foreground">
                        {currentContestant.additional_info.project_description}
                      </p>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigateContestant("prev")}
                        disabled={currentContestantIndex === 0}
                      >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Previous
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigateContestant("next")}
                        disabled={currentContestantIndex === contestants.length - 1}
                      >
                        Next
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {currentContestantIndex + 1} of {contestants.length} contestants
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Scoring Interface - Mobile Optimized */}
            <div className="grid gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2">
                {criteria.length > 5 ? (
                  // Use tabs for many criteria (better mobile UX)
                  <Tabs defaultValue={criteria[0]?.id} className="w-full">
                    <TabsList className="grid w-full grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-1 h-auto p-1">
                      {criteria.map((criterion, index) => (
                        <TabsTrigger
                          key={criterion.id}
                          value={criterion.id}
                          className="text-xs p-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                        >
                          {index + 1}. {criterion.name.split(" ")[0]}
                        </TabsTrigger>
                      ))}
                    </TabsList>
                    {criteria.map((criterion) => {
                      const score = scores.find((s) => s.criteria_id === criterion.id)
                      const hasError = validationErrors[criterion.id]
                      return (
                        <TabsContent key={criterion.id} value={criterion.id} className="mt-4">
                          <Card>
                            <CardHeader>
                              <CardTitle className="flex items-center justify-between">
                                <span>{criterion.name}</span>
                                <Badge variant="secondary">{criterion.max_points} pts max</Badge>
                              </CardTitle>
                              <CardDescription>{criterion.description}</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                              {hasError && (
                                <Alert variant="destructive">
                                  <AlertCircle className="h-4 w-4" />
                                  <AlertDescription>{hasError}</AlertDescription>
                                </Alert>
                              )}

                              <div className="space-y-2">
                                <Label htmlFor={`score-${criterion.id}`}>
                                  Score (0 - {criterion.max_points} points)
                                </Label>
                                <Input
                                  id={`score-${criterion.id}`}
                                  type="number"
                                  min="0"
                                  max={criterion.max_points}
                                  value={score?.score || 0}
                                  onChange={(e) => {
                                    if (!isDraft) return; // Prevent changes if not draft
                                    const value = Number(e.target.value)
                                    if (value > criterion.max_points) {
                                      toast({
                                        title: "Invalid Score",
                                        description: `Score cannot exceed ${criterion.max_points} points`,
                                        variant: "destructive",
                                      })
                                      return
                                    }
                                    updateScore(criterion.id, value)
                                  }}
                                  onBlur={(e) => {
                                    if (!isDraft) return;
                                    const value = Number(e.target.value)
                                    if (value > criterion.max_points) {
                                      updateScore(criterion.id, criterion.max_points)
                                    }
                                  }}
                                  disabled={!isDraft} // Add this line
                                  className={`w-full ${validationErrors[criterion.id] ? "border-red-500" : ""}`}
                                />
                              </div>

                              <div className="space-y-2">
                                <Label htmlFor={`feedback-${criterion.id}`}>Feedback & Comments</Label>
                                <Textarea
                                  id={`feedback-${criterion.id}`}
                                  placeholder="Provide detailed feedback for this criterion..."
                                  value={score?.feedback || ""}
                                  onChange={(e) => updateFeedback(criterion.id, e.target.value)}
                                  disabled={!isDraft}
                                  rows={4}
                                />
                              </div>

                              <div className="flex items-center space-x-2">
                                <Star className="h-4 w-4 text-yellow-500" />
                                <span className="text-sm text-muted-foreground">
                                  {score?.score || 0} / {criterion.max_points} points
                                </span>
                              </div>
                            </CardContent>
                          </Card>
                        </TabsContent>
                      )
                    })}
                  </Tabs>
                ) : (
                  // Use cards for fewer criteria
                  <div className="space-y-6">
                    {criteria.map((criterion) => {
                      const score = scores.find((s) => s.criteria_id === criterion.id)
                      const hasError = validationErrors[criterion.id]
                      return (
                        <Card key={criterion.id}>
                          <CardHeader>
                            <CardTitle className="flex items-center justify-between">
                              <span>{criterion.name}</span>
                              <Badge variant="secondary">{criterion.max_points} pts max</Badge>
                            </CardTitle>
                            <CardDescription>{criterion.description}</CardDescription>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            {hasError && (
                              <Alert variant="destructive">
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription>{hasError}</AlertDescription>
                              </Alert>
                            )}

                            <div className="space-y-2">
                              <Label htmlFor={`score-${criterion.id}`}>Score (0 - {criterion.max_points} points)</Label>
                              <Input
                                id={`score-${criterion.id}`}
                                type="number"
                                min="0"
                                max={criterion.max_points}
                                value={score?.score || 0}
                                onChange={(e) => {
                                  if (!isDraft) return; // Prevent changes if not draft
                                  const value = Number(e.target.value)
                                  if (value > criterion.max_points) {
                                    toast({
                                      title: "Invalid Score",
                                      description: `Score cannot exceed ${criterion.max_points} points`,
                                      variant: "destructive",
                                    })
                                    return
                                  }
                                  updateScore(criterion.id, value)
                                }}
                                onBlur={(e) => {
                                  if (!isDraft) return;
                                  const value = Number(e.target.value)
                                  if (value > criterion.max_points) {
                                    updateScore(criterion.id, criterion.max_points)
                                  }
                                }}
                                disabled={!isDraft} // Add this line
                                className={`w-full ${validationErrors[criterion.id] ? "border-red-500" : ""}`}
                              />
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor={`feedback-${criterion.id}`}>Feedback & Comments</Label>
                              <Textarea
                                id={`feedback-${criterion.id}`}
                                placeholder="Provide detailed feedback for this criterion..."
                                value={score?.feedback || ""}
                                onChange={(e) => updateFeedback(criterion.id, e.target.value)}
                                disabled={!isDraft}
                                rows={3}
                              />
                            </div>

                            <div className="flex items-center space-x-2">
                              <Star className="h-4 w-4 text-yellow-500" />
                              <span className="text-sm text-muted-foreground">
                                {score?.score || 0} / {criterion.max_points} points
                              </span>
                            </div>
                          </CardContent>
                        </Card>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* Score Summary - Sticky on desktop */}
              <div className="space-y-6 lg:sticky lg:top-6 lg:h-fit">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Trophy className="h-5 w-5" />
                      Score Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-primary">
                        {getTotalScore()} / {getMaxTotalScore()}
                      </div>
                      <div className="text-sm text-muted-foreground">Total Points</div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Overall Score</span>
                        <span>{getScorePercentage().toFixed(1)}%</span>
                      </div>
                      <Progress value={getScorePercentage()} className="h-2" />
                    </div>

                    <Separator />

                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {criteria.map((criterion) => {
                        const score = scores.find((s) => s.criteria_id === criterion.id)
                        return (
                          <div key={criterion.id} className="flex justify-between text-sm">
                            <span className="truncate">{criterion.name}</span>
                            <span className="ml-2">
                              {score?.score || 0}/{criterion.max_points}
                            </span>
                          </div>
                        )
                      })}
                    </div>

                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="w-full text-sm text-muted-foreground"
                      onClick={viewDetailedScores}
                    >
                      View Detailed Scores
                    </Button>

                    <Separator />

                    <div className="space-y-2">
                      {isDraft ? (
                        <>
                          <Button 
                            onClick={() => handleSave(true)} 
                            disabled={saving} 
                            className="w-full" 
                            variant="outline"
                          >
                            <Save className="mr-2 h-4 w-4" />
                            {saving ? "Saving..." : "Update Draft"}
                          </Button>
                          <Button 
                            onClick={() => handleSave(false)} 
                            disabled={saving} 
                            className="w-full"
                          >
                            <CheckCircle className="mr-2 h-4 w-4" />
                            {saving ? "Submitting..." : "Submit Final Scores"}
                          </Button>
                        </>
                      ) : (
                        <div className="text-center p-3 bg-green-50 rounded-md">
                          <div className="flex items-center justify-center gap-2 text-green-700">
                            <CheckCircle className="h-4 w-4" />
                            <span>Scores Submitted</span>
                          </div>
                          <p className="text-xs text-green-600 mt-1">
                            Final scores have been submitted for this contestant
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Judging Guidelines</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-xs text-muted-foreground">
                    <p>• Be fair and consistent across all contestants</p>
                    <p>• Provide constructive feedback for improvement</p>
                    <p>• Consider the criteria description when scoring</p>
                    <p>• Save drafts frequently to avoid losing work</p>
                    <p>• Submit final scores only when completely satisfied</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </>
        )}

        {selectedEvent && contestants.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Trophy className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No contestants to judge</h3>
              <p className="text-muted-foreground text-center">
                There are no contestants assigned to this competition yet.
              </p>
            </CardContent>
          </Card>
        )}

        {!selectedEvent && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Select a competition to start judging</h3>
              <p className="text-muted-foreground text-center">
                Choose a competition from the dropdown above to begin evaluating contestants.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
      <Dialog open={showScoresDialog} onOpenChange={setShowScoresDialog}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>
              Detailed Scores for {currentContestant?.contestant_name}
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="h-[60vh] pr-4">
            <div className="space-y-6">
              {criteria.map((criterion) => {
                const score = currentScores.find(s => s.criteria_id === criterion.id)
                return (
                  <Card key={criterion.id}>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span>{criterion.name}</span>
                        <Badge variant="secondary">
                          {score?.score || 0} / {criterion.max_points} pts
                        </Badge>
                      </CardTitle>
                      <CardDescription>{criterion.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Star className="h-4 w-4 text-yellow-500" />
                          <span className="text-sm font-medium">Score Breakdown</span>
                        </div>
                        <div className="pl-6 space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Points Awarded</span>
                            <span className="font-medium">{score?.score || 0}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Maximum Points</span>
                            <span>{criterion.max_points}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Percentage</span>
                            <span>
                              {criterion.max_points > 0 
                                ? Math.round(((score?.score || 0) / criterion.max_points) * 100)
                                : 0}%
                            </span>
                          </div>
                        </div>

                        {score?.feedback && (
                          <>
                            <div className="flex items-center gap-2 mt-4">
                              <MessageSquare className="h-4 w-4 text-blue-500" />
                              <span className="text-sm font-medium">Judge's Feedback</span>
                            </div>
                            <div className="pl-6">
                              <p className="text-sm text-muted-foreground">
                                {score.feedback}
                              </p>
                            </div>
                          </>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  )
}
