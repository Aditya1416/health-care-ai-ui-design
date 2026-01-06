import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function CheckEmailPage() {
  return (
    <main className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Confirm Your Email</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-foreground">We've sent a confirmation link to your email address.</p>
          <p className="text-sm text-muted-foreground">
            Please check your email and click the link to confirm your account.
          </p>
          <Link href="/" className="text-primary hover:underline">
            Return to home
          </Link>
        </CardContent>
      </Card>
    </main>
  )
}
