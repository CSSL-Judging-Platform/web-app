"use client"

import { useState, useEffect } from "react"
import { Download, FileText, Table, Trophy, Star, ArrowUpDown } from "lucide-react"
import { DashboardLayout } from "@/components/layout/sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table as ShadTable, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { getCurrentUser } from "@/lib/auth"
import { adminApi, competitionsApi } from "@/lib/api"
import { exportToExcel, exportToPDF } from "@/lib/export-utils"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"

interface JudgeResult {
  judge_id: string
  judge_name: string
  scores: {
    [contestant_id: string]: {
      score: number
      criteria_count: number
      max_possible: number
    }
  }
  average_score: number
}

interface ContestantResult {
  id: string
  name: string
  registration_number: string
  average_score: number
}

export default function ResultsPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [selectedCompetition, setSelectedCompetition] = useState("")
  const [competitions, setCompetitions] = useState<any[]>([])
  const [judgeResults, setJudgeResults] = useState<JudgeResult[]>([])
  const [contestantResults, setContestantResults] = useState<ContestantResult[]>([])
  const [maxPossibleScore, setMaxPossibleScore] = useState(0)
  const [searchTerm, setSearchTerm] = useState("")
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' }>({ 
    key: 'judge_name', 
    direction: 'asc' 
  })
  const [criteriaWiseResults, setCriteriaWiseResults] = useState<CriteriaWiseResult[]>([])
    const [exportingCriteriaWise, setExportingCriteriaWise] = useState(false)

  const { toast } = useToast()

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    if (selectedCompetition) {
      loadCompetitionResults()
    }
  }, [selectedCompetition])

  const loadData = async () => {
    try {
      const currentUser = await getCurrentUser()
      setUser(currentUser)

      if (!currentUser?.id) {
        throw new Error("User not authenticated")
      }

      // Get all competitions
      const allCompetitions = await competitionsApi.getAll()
      setCompetitions(allCompetitions)

      if (allCompetitions.length > 0) {
        setSelectedCompetition(allCompetitions[0].id)
      }
    } catch (error) {
      console.error("Error loading data:", error)
      toast({
        title: "Error",
        description: "Failed to load competition data.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const loadCompetitionResults = async () => {
    try {
      if (!selectedCompetition) return

      const results = await adminApi.getCompetitionResults(selectedCompetition)
      setJudgeResults(results.judges)
      setContestantResults(results.contestants)
      setMaxPossibleScore(results.max_possible)

      const criteriaResults = await adminApi.getCriteriaWiseResults(selectedCompetition)
        setCriteriaWiseResults(criteriaResults)
    } catch (error) {
      console.error("Error loading competition results:", error)
      toast({
        title: "Error",
        description: "Failed to load competition results.",
        variant: "destructive",
      })
    }
  }

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc'
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc'
    }
    setSortConfig({ key, direction })
  }

  const sortedJudgeResults = [...judgeResults].sort((a, b) => {
    if (sortConfig.key === 'judge_name') {
      return sortConfig.direction === 'asc' 
        ? a.judge_name.localeCompare(b.judge_name)
        : b.judge_name.localeCompare(a.judge_name)
    } else {
      return sortConfig.direction === 'asc' 
        ? a.average_score - b.average_score
        : b.average_score - a.average_score
    }
  })

  const filteredJudgeResults = sortedJudgeResults.filter(judge => 
    judge.judge_name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Update your export handlers in the component
    const handleExportExcel = () => {
    if (!selectedCompetition) return

    const competition = competitions.find(c => c.id === selectedCompetition)
    const fileName = `${competition?.name || 'Competition'} Results`

    // Sort contestants by average score (descending) for ranking
    const sortedContestants = [...contestantResults].sort((a, b) => b.average_score - a.average_score)

    // Prepare data - contestants as rows, judges as columns
    const data = sortedContestants.map((contestant, index) => {
        const row: any = {
        'Rank': index + 1,
        'Contestant': contestant.name,
        'Average Score': contestant.average_score.toFixed(2),
        'Percentage': `${((contestant.average_score / maxPossibleScore) * 100).toFixed(2)}%`
        }

        // Add judge scores
        judgeResults.forEach(judge => {
        row[`Judge ${judge.judge_name}`] = judge.scores[contestant.id]?.score || 'N/A'
        })

        return row
    })

    // Add signature row
    data.push({
        'Contestant': 'Signatures',
        ...Object.fromEntries(judgeResults.map(judge => [`Judge ${judge.judge_name}`, ''])),
        'Average Score': '',
        'Percentage': ''
    })

    exportToExcel(data, fileName)
    toast({
        title: "Export Successful",
        description: "Competition results exported to Excel",
    })
    }

    const handleExportPDF = () => {
    if (!selectedCompetition) return

    const competition = competitions.find(c => c.id === selectedCompetition)
    const fileName = `${competition?.name || 'Competition'} Results`

    // Sort contestants by average score (descending) for ranking
    const sortedContestants = [...contestantResults].sort((a, b) => b.average_score - a.average_score)

    // Prepare headers
    const headers = [
        'Rank',
        'Contestant',
        ...judgeResults.map(j => `Judge ${j.judge_name}`),
        'Average Score',
        'Percentage'
    ]

    // Prepare data
    const data = sortedContestants.map((contestant, index) => [
        index + 1,
        contestant.name,
        ...judgeResults.map(judge => judge.scores[contestant.id]?.score || 'N/A'),
        contestant.average_score.toFixed(2),
        `${((contestant.average_score / maxPossibleScore) * 100).toFixed(2)}%`
    ])

    // Add signature row
    data.push([
        '',
        'Signatures',
        ...Array(judgeResults.length).fill(''),
        '',
        ''
    ])

    exportToPDF({
        title: `${competition?.name} Judging Results`,
        headers,
        data,
        fileName,
        additionalInfo: [
        { label: 'Max Possible Score', value: maxPossibleScore },
        { label: 'Judges Count', value: judgeResults.length },
        { label: 'Contestants Count', value: contestantResults.length }
        ],
        styles: {
        header: {
            fillColor: [44, 62, 80], // Dark blue header
            textColor: 255,
            fontSize: 10,
            fontStyle: 'bold'
        },
        body: {
            textColor: [51, 51, 51],
            fontSize: 9
        },
        alternateRow: {
            fillColor: [245, 245, 245]
        },
        rankColumn: {
            fillColor: [44, 62, 80],
            textColor: 255,
            fontStyle: 'bold'
        },
        averageColumn: {
            fillColor: [241, 196, 15], // Yellow highlight for averages
            textColor: [51, 51, 51]
        }
        }
    })

    toast({
        title: "Export Successful",
        description: "Competition results exported to PDF",
    })
    }

    const handleExportCriteriaWise = async (format: 'excel' | 'pdf') => {
        if (!selectedCompetition || criteriaWiseResults.length === 0) return
        setExportingCriteriaWise(true)

        try {
            const competition = competitions.find(c => c.id === selectedCompetition)
            const fileName = `${competition?.name || 'Competition'} Criteria-wise Results`

            // Get all unique criteria from all judges
            const allCriteria = Array.from(new Set(
            criteriaWiseResults.flatMap(judge => 
                Object.values(judge.criteria).map(c => ({
                id: c.id,
                name: c.name
                }))
            )
            ))

            const headers = [
            'Judge',
            ...allCriteria.map(c => c.name),
            'Total'
            ]

            const data = criteriaWiseResults.map(judge => {
            const row: any = {
                'Judge': judge.judge_name
            }

            let total = 0
            allCriteria.forEach(criterion => {
                const criteriaData = judge.criteria[criterion.id]
                // Handle missing criteria for judge
                if (!criteriaData || !criteriaData.scores) {
                row[criterion.name] = 0
                return
                }
                
                const contestantScores = Object.values(criteriaData.scores)
                const criteriaTotal = contestantScores.reduce((sum, score) => sum + score, 0)
                row[criterion.name] = criteriaTotal
                total += criteriaTotal
            })

            row['Total'] = total
            return row
            })

            if (format === 'excel') {
            exportToExcel(data, fileName)
            } else {
            exportToPDF({
                title: `${competition?.name} Criteria-wise Results`,
                headers,
                data: data.map(row => [
                row['Judge'],
                ...allCriteria.map(c => row[c.name] || 0),
                row['Total']
                ]),
                fileName,
                styles: {
                header: {
                    fillColor: [59, 130, 246],
                    textColor: 255
                },
                totalColumn: {
                    fillColor: [34, 197, 94],
                    textColor: [51, 51, 51],
                    fontStyle: 'bold'
                }
                }
            })
            }

            toast({
            title: "Export Successful",
            description: `Criteria-wise results exported to ${format.toUpperCase()}`,
            })
        } catch (error) {
            console.error("Export error:", error)
            toast({
            title: "Export Failed",
            description: "Failed to export criteria-wise results",
            variant: "destructive",
            })
        } finally {
            setExportingCriteriaWise(false)
        }
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
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Competition Results</h2>
            <p className="text-muted-foreground">View and analyze judging results by judge and contestant</p>
          </div>

          <div className="flex flex-col space-y-2 md:flex-row md:space-y-0 md:space-x-2">
            <Input
              placeholder="Search judges..."
              className="w-full md:w-[200px]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Select value={selectedCompetition} onValueChange={setSelectedCompetition}>
              <SelectTrigger className="w-full md:w-[250px]">
                <SelectValue placeholder="Select competition" />
              </SelectTrigger>
              <SelectContent>
                {competitions.map((competition) => (
                  <SelectItem key={competition.id} value={competition.id}>
                    {competition.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {selectedCompetition && judgeResults.length > 0 ? (
          <>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={handleExportExcel}>
                <Table className="mr-2 h-4 w-4" />
                Export Excel
              </Button>
              <Button variant="outline" onClick={handleExportPDF}>
                <FileText className="mr-2 h-4 w-4" />
                Export PDF
              </Button>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5" />
                  Judging Results Matrix
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  <div className="overflow-x-auto">
                    <ShadTable>
                        <TableHeader>
                            <TableRow>
                            <TableHead 
                                className="sticky left-0 bg-background cursor-pointer hover:bg-accent"
                                onClick={() => handleSort('judge_name')}
                            >
                                <div className="flex items-center gap-1">
                                Judge Name
                                <ArrowUpDown className="h-4 w-4" />
                                </div>
                            </TableHead>
                            {contestantResults.map(contestant => (
                                <TableHead key={contestant.id} className="text-center min-w-[120px]">
                                <div className="flex flex-col">
                                    <span className="font-medium truncate">{contestant.name}</span>
                                </div>
                                </TableHead>
                            ))}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredJudgeResults.map(judge => (
                            <TableRow key={judge.judge_id}>
                                <TableCell className="sticky left-0 bg-background font-medium">
                                {judge.judge_name}
                                </TableCell>
                                {contestantResults.map(contestant => {
                                const score = judge.scores[contestant.id]
                                const percentage = score ? (score.score / score.max_possible) * 100 : 0
                                return (
                                    <TableCell key={contestant.id} className="text-center">
                                    {score ? (
                                        <div className="flex flex-col items-center">
                                        <span className="font-medium">{score.score}</span>
                                        <Progress 
                                            value={percentage} 
                                            className="h-2 w-full max-w-[80px] mt-1" 
                                        />
                                        <span className="text-xs text-muted-foreground">
                                            {percentage.toFixed(1)}%
                                        </span>
                                        </div>
                                    ) : (
                                        <span className="text-muted-foreground">N/A</span>
                                    )}
                                    </TableCell>
                                )
                                })}
                            </TableRow>
                            ))}
                        </TableBody>
                    </ShadTable>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5" />
                  Contestant Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ShadTable>
                    <TableHeader>
                        <TableRow>
                        <TableHead>Rank</TableHead>
                        <TableHead>Contestant</TableHead>
                        <TableHead className="text-right">Average Score</TableHead>
                        <TableHead className="text-right">Max Possible</TableHead>
                        <TableHead className="text-right">Percentage</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {contestantResults
                        .sort((a, b) => b.average_score - a.average_score)
                        .map((contestant, index) => {
                            const percentage = (contestant.average_score / maxPossibleScore) * 100
                            return (
                            <TableRow key={contestant.id}>
                                <TableCell>{index + 1}</TableCell>
                                <TableCell className="font-medium">{contestant.name}</TableCell>
                                <TableCell className="text-right">
                                {contestant.average_score.toFixed(2)}
                                </TableCell>
                                <TableCell className="text-right">{maxPossibleScore}</TableCell>
                                <TableCell className="text-right">
                                <div className="flex items-center justify-end gap-2">
                                    <span>{percentage.toFixed(2)}%</span>
                                    <Progress value={percentage} className="h-2 w-[80px]" />
                                </div>
                                </TableCell>
                            </TableRow>
                            )
                        })}
                    </TableBody>
                </ShadTable>
              </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <CardTitle className="flex items-center gap-2">
                        <Trophy className="h-5 w-5" />
                        Judge Criteria-wise Marks
                    </CardTitle>
                    <div className="flex gap-2">
                        <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleExportCriteriaWise('excel')}
                        disabled={exportingCriteriaWise}
                        >
                        <Table className="mr-2 h-4 w-4" />
                        <span className="hidden sm:inline">Export Excel</span>
                        </Button>
                        <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleExportCriteriaWise('pdf')}
                        disabled={exportingCriteriaWise}
                        >
                        <FileText className="mr-2 h-4 w-4" />
                        <span className="hidden sm:inline">Export PDF</span>
                        </Button>
                    </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="relative overflow-hidden rounded-lg border">
                    <div className="overflow-x-auto">
                        <ShadTable className="min-w-max">
                        <TableHeader className="sticky top-0 bg-background z-10">
                            <TableRow>
                            <TableHead className="sticky left-0 bg-background z-20 min-w-[150px]">
                                Judge
                            </TableHead>
                            {criteriaWiseResults.length > 0 && 
                                Object.entries(criteriaWiseResults[0].criteria).map(([id, criterion]) => (
                                <TableHead 
                                    key={id} 
                                    className="text-center min-w-[100px] max-w-[150px] truncate"
                                    title={criterion.name}
                                >
                                    <div className="flex flex-col">
                                    <span className="truncate">{criterion.name}</span>
                                    <span className="text-xs text-muted-foreground">
                                        (Max: {criterion.max_points})
                                    </span>
                                    </div>
                                </TableHead>
                                ))
                            }
                            <TableHead className="sticky right-0 bg-background z-10 text-right min-w-[100px]">
                                Total
                            </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {criteriaWiseResults.map(judge => {
                            const criteriaList = Object.entries(judge.criteria)
                            const total = criteriaList.reduce((sum, [_, criterion]) => {
                                return sum + Object.values(criterion.scores).reduce((s, score) => s + score, 0)
                            }, 0)

                            return (
                                <TableRow key={judge.judge_id} className="hover:bg-accent/50">
                                <TableCell className="sticky left-0 bg-background font-medium z-10">
                                    {judge.judge_name}
                                </TableCell>
                                {criteriaList.map(([id, criterion]) => {
                                    const criteriaTotal = Object.values(criterion.scores).reduce((sum, score) => sum + score, 0)
                                    const percentage = (criteriaTotal / (criterion.max_points * Object.keys(criterion.scores).length)) * 100 || 0
                                    
                                    return (
                                    <TableCell key={id} className="text-center">
                                        <div className="flex flex-col items-center">
                                        <span className="font-medium">{criteriaTotal}</span>
                                        <Progress 
                                            value={percentage} 
                                            className="h-2 w-full max-w-[80px] mt-1" 
                                        />
                                        <span className="text-xs text-muted-foreground">
                                            {percentage.toFixed(1)}%
                                        </span>
                                        </div>
                                    </TableCell>
                                    )
                                })}
                                <TableCell className="sticky right-0 bg-background font-medium text-right z-10">
                                    {total}
                                </TableCell>
                                </TableRow>
                            )
                            })}
                        </TableBody>
                        </ShadTable>
                    </div>
                    </div>
                    {criteriaWiseResults.length > 0 && (
                    <div className="mt-2 text-sm text-muted-foreground">
                        Scroll horizontally to view all criteria
                    </div>
                    )}
                </CardContent>
            </Card>
          </>
        ) : selectedCompetition ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Trophy className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No results available</h3>
              <p className="text-muted-foreground text-center">
                There are no judging results recorded for this competition yet.
              </p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Trophy className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Select a competition</h3>
              <p className="text-muted-foreground text-center">
                Choose a competition from the dropdown to view results.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}