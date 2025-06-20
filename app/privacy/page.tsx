import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DashboardLayout } from "@/components/layout/sidebar"

export default function PrivacyPolicyPage() {
  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Privacy Policy</h1>
          <p className="text-muted-foreground">Last updated: January 2024</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Introduction</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              The Computer Society of Sri Lanka (CSSL) is committed to protecting your privacy and personal information.
              This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use
              our Judging Portal platform.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Information We Collect</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Personal Information</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                <li>Name, email address, and contact information</li>
                <li>Professional affiliation and expertise areas</li>
                <li>University or organization details</li>
                <li>Competition submissions and project details</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Usage Information</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                <li>Login times and platform usage patterns</li>
                <li>Judging activities and scoring data</li>
                <li>System logs and technical information</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>How We Use Your Information</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc list-inside space-y-2 text-sm">
              <li>To provide and maintain the judging portal services</li>
              <li>To facilitate competition management and judging processes</li>
              <li>To communicate important updates and notifications</li>
              <li>To generate reports and analytics for event organizers</li>
              <li>To improve our platform and user experience</li>
              <li>To comply with legal obligations and regulations</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Information Sharing</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              We do not sell, trade, or rent your personal information to third parties. We may share your information
              only in the following circumstances:
            </p>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>With event organizers for competition management purposes</li>
              <li>With judges and contestants as necessary for the judging process</li>
              <li>When required by law or legal process</li>
              <li>To protect the rights and safety of CSSL and platform users</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Data Security</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">
              We implement appropriate technical and organizational security measures to protect your personal
              information against unauthorized access, alteration, disclosure, or destruction. However, no method of
              transmission over the internet is 100% secure, and we cannot guarantee absolute security.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Your Rights</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>Access and review your personal information</li>
              <li>Request corrections to inaccurate information</li>
              <li>Request deletion of your personal information</li>
              <li>Withdraw consent for data processing</li>
              <li>File complaints with relevant data protection authorities</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm">
              If you have questions about this Privacy Policy or our data practices, please contact us:
            </p>
            <div className="text-sm space-y-1">
              <p>
                <strong>Computer Society of Sri Lanka (CSSL)</strong>
              </p>
              <p>Email: privacy@cssl.lk</p>
              <p>Phone: +94 11 234 5678</p>
              <p>Address: 123 Galle Road, Colombo 03, Sri Lanka</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
