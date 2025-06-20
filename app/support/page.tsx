import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DashboardLayout } from "@/components/layout/sidebar"
import { Mail, Phone, MapPin, Clock, MessageCircle, FileText, Bug, HelpCircle } from "lucide-react"

export default function SupportPage() {
  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Support Center</h1>
          <p className="text-muted-foreground">Get help with the CSSL Judging Portal</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium">Email Support</p>
                  <p className="text-sm text-muted-foreground">support@cssl.lk</p>
                  <p className="text-xs text-muted-foreground">Response within 24 hours</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium">Phone Support</p>
                  <p className="text-sm text-muted-foreground">+94 11 234 5678</p>
                  <p className="text-xs text-muted-foreground">Mon-Fri, 9:00 AM - 5:00 PM</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium">Office Address</p>
                  <p className="text-sm text-muted-foreground">
                    Computer Society of Sri Lanka
                    <br />
                    123 Galle Road
                    <br />
                    Colombo 03, Sri Lanka
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium">Business Hours</p>
                  <p className="text-sm text-muted-foreground">
                    Monday - Friday: 9:00 AM - 5:00 PM
                    <br />
                    Saturday: 9:00 AM - 1:00 PM
                    <br />
                    Sunday: Closed
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Help */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HelpCircle className="h-5 w-5" />
                Quick Help
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start h-auto p-4">
                <FileText className="mr-3 h-4 w-4" />
                <div className="text-left">
                  <div className="font-medium">User Guide</div>
                  <div className="text-xs text-muted-foreground">Step-by-step instructions</div>
                </div>
              </Button>

              <Button variant="outline" className="w-full justify-start h-auto p-4">
                <MessageCircle className="mr-3 h-4 w-4" />
                <div className="text-left">
                  <div className="font-medium">FAQ</div>
                  <div className="text-xs text-muted-foreground">Frequently asked questions</div>
                </div>
              </Button>

              <Button variant="outline" className="w-full justify-start h-auto p-4">
                <Bug className="mr-3 h-4 w-4" />
                <div className="text-left">
                  <div className="font-medium">Report a Bug</div>
                  <div className="text-xs text-muted-foreground">Technical issues and bugs</div>
                </div>
              </Button>

              <Button variant="outline" className="w-full justify-start h-auto p-4">
                <HelpCircle className="mr-3 h-4 w-4" />
                <div className="text-left">
                  <div className="font-medium">Feature Request</div>
                  <div className="text-xs text-muted-foreground">Suggest new features</div>
                </div>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Support Request Form */}
        <Card>
          <CardHeader>
            <CardTitle>Submit Support Request</CardTitle>
            <p className="text-sm text-muted-foreground">
              Fill out the form below and we'll get back to you as soon as possible.
            </p>
          </CardHeader>
          <CardContent>
            <form className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" placeholder="Enter your full name" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input id="email" type="email" placeholder="Enter your email" />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="role">Your Role</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Administrator</SelectItem>
                      <SelectItem value="judge">Judge</SelectItem>
                      <SelectItem value="contestant">Contestant</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="priority">Priority Level</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Issue Category</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="login">Login Issues</SelectItem>
                    <SelectItem value="judging">Judging Problems</SelectItem>
                    <SelectItem value="registration">Registration Issues</SelectItem>
                    <SelectItem value="technical">Technical Problems</SelectItem>
                    <SelectItem value="account">Account Management</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Input id="subject" placeholder="Brief description of your issue" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Detailed Description</Label>
                <Textarea
                  id="description"
                  placeholder="Please provide detailed information about your issue, including steps to reproduce if applicable..."
                  rows={6}
                />
              </div>

              <Button type="submit" className="w-full">
                Submit Support Request
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Common Issues */}
        <Card>
          <CardHeader>
            <CardTitle>Common Issues & Solutions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="border-l-4 border-blue-500 pl-4">
                <h4 className="font-semibold">Cannot Login to Account</h4>
                <p className="text-sm text-muted-foreground">
                  Ensure you're using the correct email and password. Try resetting your password if needed. Contact
                  support if you continue to have issues.
                </p>
              </div>

              <div className="border-l-4 border-green-500 pl-4">
                <h4 className="font-semibold">Judging Interface Not Loading</h4>
                <p className="text-sm text-muted-foreground">
                  Clear your browser cache and cookies. Try using a different browser or incognito mode. Ensure you have
                  a stable internet connection.
                </p>
              </div>

              <div className="border-l-4 border-orange-500 pl-4">
                <h4 className="font-semibold">Cannot Submit Scores</h4>
                <p className="text-sm text-muted-foreground">
                  Check that all required fields are filled and scores are within valid ranges. Save as draft first,
                  then submit final scores.
                </p>
              </div>

              <div className="border-l-4 border-purple-500 pl-4">
                <h4 className="font-semibold">Missing Competition or Contestants</h4>
                <p className="text-sm text-muted-foreground">
                  Contact the event administrator to ensure you're properly assigned to the competition. Refresh the
                  page to see if data has been updated.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
