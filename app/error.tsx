"use client"

import { useEffect } from "react"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("App error:", error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="max-w-md text-center">
        <h1 className="text-3xl font-bold text-foreground mb-4">Something went wrong</h1>
        <p className="text-muted-foreground mb-6">
          An error occurred while loading the application. Please try again or contact support if the problem persists.
        </p>
        <div className="flex gap-4 justify-center">
          <button
            onClick={() => reset()}
            className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition"
          >
            Try Again
          </button>
          <a href="/" className="px-6 py-2 border border-border rounded-lg hover:bg-accent transition">
            Go Home
          </a>
        </div>
      </div>
    </div>
  )
}
