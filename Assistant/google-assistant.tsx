import { generateText, streamText } from "ai"
import { createGoogleGenerativeAI } from "@ai-sdk/google"

export class GoogleAssistant {
  private model: string
  private google: any

  constructor(model = "models/gemini-1.5-flash") {
    this.model = model

    // Validate API key
    if (!process.env.GOOGLE_API_KEY) {
      throw new Error("GOOGLE_API_KEY environment variable is required")
    }

    // Create Google instance with API key
    this.google = createGoogleGenerativeAI({
      apiKey: process.env.GOOGLE_API_KEY,
    })
  }

  async generateResponse(prompt: string, systemPrompt?: string): Promise<string> {
    try {
      const { text } = await generateText({
        model: this.google(this.model),
        prompt,
        system: systemPrompt || "You are a helpful AI assistant.",
        maxTokens: 1000,
      })

      return text
    } catch (error) {
      console.error("Google Assistant Error:", error)

      if (error.message?.includes("API key")) {
        throw new Error("Invalid Google API key. Please check your GOOGLE_API_KEY environment variable.")
      } else if (error.message?.includes("quota")) {
        throw new Error("Google API quota exceeded. Please check your billing.")
      }

      throw new Error(`Google API error: ${error.message}`)
    }
  }

  async streamResponse(prompt: string, systemPrompt?: string) {
    try {
      return streamText({
        model: this.google(this.model),
        prompt,
        system: systemPrompt || "You are a helpful AI assistant.",
        maxTokens: 1000,
      })
    } catch (error) {
      console.error("Google Stream Error:", error)
      throw new Error(`Google streaming error: ${error.message}`)
    }
  }
}
