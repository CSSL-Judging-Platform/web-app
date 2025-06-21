"use client"

import type React from "react"

import { useState } from "react"
import { Upload, Download, FileSpreadsheet, AlertCircle, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { DashboardLayout } from "@/components/layout/sidebar"
import { useAuth } from "@/lib/auth"
import { contestantsApi, competitionsApi } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { useEffect } from "react"

interface Competition {
  id: string
  name: string
}

export default function BulkUploadPage() {
  const { user } = useAuth()
  const [competitions, setCompetitions] = useState<Competition[]>([])
  const [selectedCompetition, setSelectedCompetition] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadResult, setUploadResult] = useState<{
    success: number
    errors: string[]
  } | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    loadCompetitions()
  }, [])

  const loadCompetitions = async () => {
    try {
      const data = await competitionsApi.getAll()
      setCompetitions(data)
    } catch (error) {
      console.error("Error loading competitions:", error)
      toast({
        title: "Error",
        description: "Failed to load competitions.",
        variant: "destructive",
      })
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
      setUploadResult(null)
    }
  }

  const downloadTemplate = () => {
    const csvContent =
      "contestant_name,contestant_email,registration_number,additional_info\nJohn Doe,john@example.com,REG001,Computer Science Student\nJane Smith,jane@example.com,REG002,Engineering Student"

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "contestants_template.csv"
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const parseCSV = (text: string) => {
    const lines = text.split("\n").filter((line) => line.trim())
    if (lines.length === 0) return []

    const headers = lines[0].split(",").map((h) => h.trim().replace(/"/g, ""))
    const data = []

    for (let i = 1; i < lines.length; i++) {
      if (lines[i].trim()) {
        const values = lines[i].split(",").map((v) => v.trim().replace(/"/g, ""))
        const row: any = {}
        headers.forEach((header, index) => {
          row[header] = values[index] || ""
        })
        data.push(row)
      }
    }

    return data
  }

  const handleUpload = async () => {
    if (!file || !selectedCompetition) return

    setUploading(true)
    setUploadProgress(0)
    setUploadResult(null)

    try {
      const text = await file.text()
      const contestants = parseCSV(text)

      let successCount = 0
      const errors: string[] = []

      const contestantData = contestants.map((contestant, index) => {
        setUploadProgress(((index + 1) / contestants.length) * 100)

        return {
          competition_id: selectedCompetition,
          contestant_name: contestant.contestant_name || "",
          contestant_email: contestant.contestant_email || "",
          registration_number: contestant.registration_number || `REG${Date.now()}_${index}`,
          additional_info: contestant.additional_info ? { info: contestant.additional_info } : {},
          status: "registered" as const,
        }
      })

      try {
        await contestantsApi.bulkCreate(contestantData)
        successCount = contestantData.length

        toast({
          title: "Success",
          description: `Successfully uploaded ${successCount} contestants.`,
        })
      } catch (error: any) {
        errors.push(`Bulk upload failed: ${error.message}`)
      }

      setUploadResult({ success: successCount, errors })
    } catch (error) {
      console.error("CSV parsing error:", error)
      setUploadResult({
        success: 0,
        errors: [`Failed to parse CSV file: ${error instanceof Error ? error.message : "Unknown error"}`],
      })
    } finally {
      setUploading(false)
    }
  }

  return (
    <DashboardLayout userRole="admin" user={user}>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Bulk Upload</h2>
          <p className="text-muted-foreground">Upload contestants in bulk using CSV files</p>
        </div>

        <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="h-5 w-5" />
                Download Template
              </CardTitle>
              <CardDescription>Get the CSV template with the correct format for uploading contestants</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={downloadTemplate} variant="outline" className="w-full">
                <FileSpreadsheet className="mr-2 h-4 w-4" />
                Download CSV Template
              </Button>

              <div className="mt-4 text-sm text-muted-foreground">
                <p className="font-medium mb-2">Template includes:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>contestant_name (required)</li>
                  <li>contestant_email (required)</li>
                  <li>registration_number (optional)</li>
                  <li>additional_info (optional)</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Upload Contestants
              </CardTitle>
              <CardDescription>Select a competition and upload your CSV file with contestant data</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="competition">Select Competition</Label>
                <Select value={selectedCompetition} onValueChange={setSelectedCompetition}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a competition" />
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

              <div className="space-y-2">
                <Label htmlFor="file">CSV File</Label>
                <Input id="file" type="file" accept=".csv" onChange={handleFileChange} />
              </div>

              {uploading && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Uploading...</span>
                    <span>{Math.round(uploadProgress)}%</span>
                  </div>
                  <Progress value={uploadProgress} />
                </div>
              )}

              <Button onClick={handleUpload} disabled={!file || !selectedCompetition || uploading} className="w-full">
                {uploading ? "Uploading..." : "Upload Contestants"}
              </Button>
            </CardContent>
          </Card>
        </div>

        {uploadResult && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {uploadResult.success > 0 ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-red-600" />
                )}
                Upload Results
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {uploadResult.success > 0 && (
                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>Successfully uploaded {uploadResult.success} contestants</AlertDescription>
                  </Alert>
                )}

                {uploadResult.errors.length > 0 && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      <div>
                        <p className="font-medium mb-2">{uploadResult.errors.length} errors occurred:</p>
                        <div className="max-h-32 overflow-y-auto">
                          <ul className="list-disc list-inside space-y-1 text-sm">
                            {uploadResult.errors.slice(0, 5).map((error, index) => (
                              <li key={index} className="break-words">
                                {error}
                              </li>
                            ))}
                            {uploadResult.errors.length > 5 && (
                              <li>... and {uploadResult.errors.length - 5} more errors</li>
                            )}
                          </ul>
                        </div>
                      </div>
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Upload Guidelines</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm text-muted-foreground">
              <div>
                <h4 className="font-medium text-foreground">File Requirements:</h4>
                <ul className="list-disc list-inside mt-1 space-y-1">
                  <li>File must be in CSV format</li>
                  <li>Maximum file size: 10MB</li>
                  <li>Maximum 1000 contestants per upload</li>
                </ul>
              </div>

              <div>
                <h4 className="font-medium text-foreground">Data Validation:</h4>
                <ul className="list-disc list-inside mt-1 space-y-1">
                  <li>Contestant name and email are required</li>
                  <li>Email addresses must be unique within the competition</li>
                  <li>Registration numbers should be unique if provided</li>
                </ul>
              </div>

              <div>
                <h4 className="font-medium text-foreground">Error Handling:</h4>
                <ul className="list-disc list-inside mt-1 space-y-1">
                  <li>Invalid rows will be skipped and reported</li>
                  <li>Valid rows will still be processed if some rows fail</li>
                  <li>Duplicate emails will be rejected</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
