import { type NextRequest, NextResponse } from "next/server"
import { AssistantManager, type AssistantProvider } from "@/Assistant/assistant-manager"

// Create a singleton instance of AssistantManager
let assistantManager: AssistantManager

export async function POST(request: NextRequest) {
  try {
    // Initialize the manager if it doesn't exist
    if (!assistantManager) {
      assistantManager = new AssistantManager()
    }

    const { message, provider, history } = await request.json()

    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 })
    }

    // Use preferred provider if none specified
    const selectedProvider = (provider || assistantManager.getPreferredProvider()) as AssistantProvider

    // Check if the requested provider is available
    if (!assistantManager.isProviderAvailable(selectedProvider)) {
      const availableProviders = assistantManager.getAvailableProviders()
      return NextResponse.json(
        {
          error: `Provider ${selectedProvider} is not available. Available providers: ${availableProviders.join(", ") || "none"}`,
          availableProviders,
        },
        { status: 400 },
      )
    }

    // Build context from conversation history
    const context =
      history
        ?.slice(-5) // Last 5 messages for context
        ?.map((msg: any) => `${msg.role}: ${msg.content}`)
        ?.join("\n") || ""

    const systemPrompt = `You are a helpful AI assistant. Here's the recent conversation context:
${context}

Please provide a helpful and relevant response to the user's message.`

    const response = await assistantManager.generateResponse(selectedProvider, message, systemPrompt)

    return NextResponse.json({
      response,
      provider: selectedProvider,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Chat API Error:", error)

    // Provide more specific error messages
    let errorMessage = "Failed to process chat request"
    if (error.message?.includes("API key")) {
      errorMessage = "AI service configuration error. Please check your API keys."
    } else if (error.message?.includes("quota")) {
      errorMessage = "API quota exceeded. Please check your billing."
    } else if (error.message?.includes("rate limit")) {
      errorMessage = "API rate limit exceeded. Please try again later."
    } else if (error.message?.includes("not available")) {
      errorMessage = error.message
    }

    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
