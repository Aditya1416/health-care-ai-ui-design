export const dynamic = "force-dynamic"

export default function NotFound() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">404 - Page Not Found</h1>
        <p className="text-foreground/60 mb-8">The page you're looking for doesn't exist.</p>
        <a
          href="/"
          className="inline-block px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition"
        >
          Go Home
        </a>
      </div>
    </div>
  )
}
