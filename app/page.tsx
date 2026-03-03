import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="text-2xl font-bold text-primary">HealthcareAI</div>
          <div className="flex gap-4">
            <Link href="/auth/login">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link href="/auth/sign-up">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="pt-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <h1 className="text-5xl md:text-6xl font-bold text-foreground leading-tight">
              Your Intelligent Health Companion
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
              AI-powered health insights, medical records management, and predictive analytics all in one place. Track
              your health, schedule appointments, and get intelligent recommendations.
            </p>
            <div className="flex gap-4">
              <Link href="/auth/sign-up">
                <Button size="lg" className="bg-primary hover:bg-primary/90">
                  Start Free Trial
                </Button>
              </Link>
              <Button size="lg" variant="outline">
                Learn More
              </Button>
            </div>
          </div>
          <div className="hidden md:block">
            <div className="bg-gradient-to-br from-primary/20 to-accent/20 rounded-2xl p-12 h-96 flex items-center justify-center">
              <div className="text-center">
                <div className="text-6xl mb-4">🏥</div>
                <p className="text-muted-foreground">Healthcare AI Dashboard</p>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="mt-24 grid md:grid-cols-3 gap-8">
          <div className="bg-card border border-border rounded-lg p-8">
            <div className="text-4xl mb-4">📊</div>
            <h3 className="text-xl font-semibold mb-2">Health Metrics</h3>
            <p className="text-muted-foreground">
              Track vital signs, weight, blood pressure, and more with real-time analytics.
            </p>
          </div>
          <div className="bg-card border border-border rounded-lg p-8">
            <div className="text-4xl mb-4">🤖</div>
            <h3 className="text-xl font-semibold mb-2">AI Predictions</h3>
            <p className="text-muted-foreground">Get intelligent health recommendations powered by neural networks.</p>
          </div>
          <div className="bg-card border border-border rounded-lg p-8">
            <div className="text-4xl mb-4">📋</div>
            <h3 className="text-xl font-semibold mb-2">Medical Records</h3>
            <p className="text-muted-foreground">
              Securely manage and organize all your medical documents in one place.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
