"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Send, Bot, User, AlertCircle, CheckCircle } from "lucide-react"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  provider?: string
  timestamp: Date
}

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [provider, setProvider] = useState("openai") // Default to OpenAI
  const [isLoading, setIsLoading] = useState(false)
  const [availableProviders, setAvailableProviders] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)

  // Check available providers on component mount
  useEffect(() => {
    checkAvailableProviders()
  }, [])

  const checkAvailableProviders = async () => {
    try {
      const response = await fetch("/api/providers")
      if (response.ok) {
        const data = await response.json()
        setAvailableProviders(data.providers || [])

        // Set default provider based on availability
        if (data.providers && data.providers.length > 0) {
          // Prefer real AI providers over mock
          if (data.providers.includes("openai")) {
            setProvider("openai")
          } else if (data.providers.includes("anthropic")) {
            setProvider("anthropic")
          } else if (data.providers.includes("google")) {
            setProvider("google")
          } else {
            setProvider(data.providers[0])
          }
        }
      }
    } catch (error) {
      console.error("Error checking providers:", error)
      setAvailableProviders(["mock"])
      setProvider("mock")
    }
  }

  const sendMessage = async () => {
    if (!input.trim()) return

    setError(null)
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: input,
          provider,
          history: messages,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to get response")
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.response,
        provider: data.provider,
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, assistantMessage])
    } catch (error) {
      console.error("Error sending message:", error)
      setError(error.message)

      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: `Sorry, I encountered an error: ${error.message}`,
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const getProviderDisplayName = (providerName: string) => {
    switch (providerName) {
      case "openai":
        return "OpenAI GPT"
      case "anthropic":
        return "Claude"
      case "google":
        return "Gemini"
      case "mock":
        return "Mock AI (Demo)"
      default:
        return providerName
    }
  }

  const getProviderBadgeVariant = (providerName: string) => {
    if (providerName === "mock") return "outline"
    return "default"
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bot className="h-5 w-5" />
          AI Assistant Chat
        </CardTitle>
        <div className="flex gap-2 items-center">
          <Select value={provider} onValueChange={setProvider} disabled={availableProviders.length === 0}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {availableProviders.includes("openai") && <SelectItem value="openai">OpenAI GPT-4</SelectItem>}
              {availableProviders.includes("anthropic") && <SelectItem value="anthropic">Claude 3</SelectItem>}
              {availableProviders.includes("google") && <SelectItem value="google">Google Gemini</SelectItem>}
              {availableProviders.includes("mock") && <SelectItem value="mock">Mock AI (Demo)</SelectItem>}
              {availableProviders.length === 0 && (
                <SelectItem value="none" disabled>
                  No providers available
                </SelectItem>
              )}
            </SelectContent>
          </Select>

          <Badge variant={getProviderBadgeVariant(provider)}>
            {provider !== "mock" && <CheckCircle className="h-3 w-3 mr-1" />}
            {getProviderDisplayName(provider)}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {availableProviders.length > 0 && !availableProviders.some((p) => p !== "mock") && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Only mock AI is available. Add your API keys to use real AI providers:
              <ul className="mt-2 list-disc list-inside text-sm">
                <li>OPENAI_API_KEY for OpenAI GPT</li>
                <li>ANTHROPIC_API_KEY for Claude</li>
                <li>GOOGLE_API_KEY for Gemini</li>
              </ul>
            </AlertDescription>
          </Alert>
        )}

        <ScrollArea className="h-96 w-full border rounded-md p-4">
          <div className="space-y-4">
            {messages.length === 0 && (
              <div className="text-center text-muted-foreground py-8">
                Start a conversation with your AI assistant
                {provider !== "mock" && (
                  <div className="text-sm mt-2">
                    Using {getProviderDisplayName(provider)} - Real AI responses enabled!
                  </div>
                )}
              </div>
            )}

            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div className={`flex gap-2 max-w-[80%] ${message.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                  <div className="flex-shrink-0">
                    {message.role === "user" ? <User className="h-6 w-6 mt-1" /> : <Bot className="h-6 w-6 mt-1" />}
                  </div>

                  <div
                    className={`rounded-lg p-3 ${
                      message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"
                    }`}
                  >
                    <div className="whitespace-pre-wrap">{message.content}</div>
                    <div className="flex items-center gap-2 mt-2 text-xs opacity-70">
                      <span>{message.timestamp.toLocaleTimeString()}</span>
                      {message.provider && (
                        <Badge variant="outline" className="text-xs">
                          {getProviderDisplayName(message.provider)}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-3 justify-start">
                <Bot className="h-6 w-6 mt-1" />
                <div className="bg-muted rounded-lg p-3">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-current rounded-full animate-bounce" />
                    <div
                      className="w-2 h-2 bg-current rounded-full animate-bounce"
                      style={{ animationDelay: "0.1s" }}
                    />
                    <div
                      className="w-2 h-2 bg-current rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            onKeyPress={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
            disabled={isLoading}
          />
          <Button onClick={sendMessage} disabled={isLoading || !input.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
