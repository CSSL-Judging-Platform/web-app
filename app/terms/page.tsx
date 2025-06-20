import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DashboardLayout } from "@/components/layout/sidebar"

export default function TermsOfServicePage() {
  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Terms of Service</h1>
          <p className="text-muted-foreground">Last updated: January 2024</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Agreement to Terms</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">
              By accessing and using the CSSL Judging Portal, you agree to be bound by these Terms of Service and all
              applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from
              using this platform.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Platform Description</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">
              The CSSL Judging Portal is a web-based platform designed to facilitate the management and judging of
              competitions, conferences, and academic events organized by the Computer Society of Sri Lanka (CSSL).
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>User Responsibilities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">All Users</h4>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>Provide accurate and complete information</li>
                  <li>Maintain the confidentiality of login credentials</li>
                  <li>Use the platform only for authorized purposes</li>
                  <li>Respect intellectual property rights</li>
                  <li>Comply with all applicable laws and regulations</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Judges</h4>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>Provide fair and unbiased evaluations</li>
                  <li>Maintain confidentiality of submissions</li>
                  <li>Complete judging assignments within specified timeframes</li>
                  <li>Disclose any conflicts of interest</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Contestants</h4>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>Submit original work and properly cite sources</li>
                  <li>Meet all competition requirements and deadlines</li>
                  <li>Accept judging decisions gracefully</li>
                  <li>Represent their institutions professionally</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Prohibited Activities</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>Attempting to gain unauthorized access to the platform</li>
              <li>Interfering with platform security or functionality</li>
              <li>Submitting false, misleading, or plagiarized content</li>
              <li>Harassing, threatening, or discriminating against other users</li>
              <li>Using the platform for commercial purposes without permission</li>
              <li>Violating any applicable laws or regulations</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Intellectual Property</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm">
              The platform and its content are owned by CSSL and protected by copyright and other intellectual property
              laws. Users retain ownership of their submissions but grant CSSL limited rights to use submissions for
              competition and promotional purposes.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Privacy and Data Protection</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">
              Your privacy is important to us. Please review our Privacy Policy to understand how we collect, use, and
              protect your personal information. By using this platform, you consent to our data practices as described
              in the Privacy Policy.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Platform Availability</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">
              While we strive to maintain platform availability, CSSL does not guarantee uninterrupted access. We
              reserve the right to modify, suspend, or discontinue the platform at any time with reasonable notice.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Limitation of Liability</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">
              CSSL shall not be liable for any indirect, incidental, special, or consequential damages arising from your
              use of the platform. Our total liability shall not exceed the fees paid for platform access, if any.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Governing Law</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">
              These Terms of Service are governed by the laws of Sri Lanka. Any disputes shall be resolved in the courts
              of Colombo, Sri Lanka.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm">For questions about these Terms of Service, please contact:</p>
            <div className="text-sm space-y-1">
              <p>
                <strong>Computer Society of Sri Lanka (CSSL)</strong>
              </p>
              <p>Email: legal@cssl.lk</p>
              <p>Phone: +94 11 234 5678</p>
              <p>Address: 123 Galle Road, Colombo 03, Sri Lanka</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
