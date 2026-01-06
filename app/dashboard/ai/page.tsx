"use client"

import { useState, useRef, useEffect } from "react"
import { Sidebar } from "@/components/dashboard/sidebar"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { Send, Zap } from "lucide-react"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

export default function AIAssistantPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content:
        "Hello! I'm your AI Health Assistant. I can help you understand your health metrics, provide recommendations based on your data, and answer general health questions. How can I help you today?",
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async () => {
    if (!input.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setLoading(true)

    try {
      // Simulated AI response - in production, this would call an AI API
      const aiResponses: { [key: string]: string } = {
        weight:
          "Based on your recent metrics, your weight has been stable. Keep maintaining your current exercise routine and balanced diet.",
        metrics: "Your health metrics look good overall. Your heart rate and blood pressure are within normal ranges.",
        exercise:
          "I recommend 150 minutes of moderate aerobic activity per week. This can include walking, cycling, or swimming.",
        diet: "A balanced diet with fruits, vegetables, whole grains, and lean proteins is ideal for optimal health.",
        sleep: "Aim for 7-9 hours of quality sleep per night to support your overall health and recovery.",
        stress: "Try relaxation techniques like deep breathing, meditation, or yoga to manage stress effectively.",
        default:
          "That's a great question! Remember to maintain regular check-ups with your healthcare provider for personalized advice.",
      }

      const response =
        aiResponses[
          Object.keys(aiResponses).find((key) => userMessage.content.toLowerCase().includes(key)) || "default"
        ]

      // Add a small delay for better UX
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: response,
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, assistantMessage])
    } catch (error) {
      console.error("Error sending message:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader />
        <main className="flex-1 flex flex-col overflow-hidden">
          <div className="p-6">
            <div>
              <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
                <Zap className="w-8 h-8 text-primary" />
                AI Health Assistant
              </h1>
              <p className="text-muted-foreground mt-2">Get personalized health insights and recommendations</p>
            </div>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-auto px-6 pb-4 space-y-4">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                <Card
                  className={`max-w-md border-border ${
                    message.role === "user"
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-card text-card-foreground"
                  }`}
                >
                  <CardContent className="pt-4">
                    <p className="text-sm">{message.content}</p>
                    <p
                      className={`text-xs mt-2 ${
                        message.role === "user" ? "text-primary-foreground/60" : "text-muted-foreground"
                      }`}
                    >
                      {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </CardContent>
                </Card>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <Card className="bg-card border-border">
                  <CardContent className="pt-4">
                    <Spinner className="w-4 h-4" />
                  </CardContent>
                </Card>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestions */}
          <div className="px-6 py-4 bg-muted/30 border-t border-border">
            <p className="text-xs text-muted-foreground mb-3">Suggested questions:</p>
            <div className="flex flex-wrap gap-2">
              {[
                "How are my metrics?",
                "Exercise recommendations",
                "Sleep advice",
                "Diet tips",
                "Stress management",
              ].map((suggestion) => (
                <Button
                  key={suggestion}
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setInput(suggestion)
                  }}
                  className="bg-transparent hover:bg-primary/10"
                >
                  {suggestion}
                </Button>
              ))}
            </div>
          </div>

          {/* Input Area */}
          <div className="p-6 border-t border-border">
            <div className="flex gap-3">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                placeholder="Ask me about your health..."
                className="bg-card border-border"
              />
              <Button onClick={handleSendMessage} disabled={loading || !input.trim()} className="gap-2">
                <Send size={18} />
              </Button>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
