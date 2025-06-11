import { generateText, streamText } from "ai"
import { createAnthropic } from "@ai-sdk/anthropic"

export class AnthropicAssistant {
  private model: string
  private anthropic: any

  constructor(model = "claude-3-haiku-20240307") {
    this.model = model

    // Validate API key
    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error("ANTHROPIC_API_KEY environment variable is required")
    }

    // Create Anthropic instance with API key
    this.anthropic = createAnthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    })
  }

  async generateResponse(prompt: string, systemPrompt?: string): Promise<string> {
    try {
      const { text } = await generateText({
        model: this.anthropic(this.model),
        prompt,
        system: systemPrompt || "You are a helpful AI assistant.",
        maxTokens: 1000,
      })

      return text
    } catch (error) {
      console.error("Anthropic Assistant Error:", error)

      if (error.message?.includes("API key")) {
        throw new Error("Invalid Anthropic API key. Please check your ANTHROPIC_API_KEY environment variable.")
      } else if (error.message?.includes("quota")) {
        throw new Error("Anthropic API quota exceeded. Please check your billing.")
      }

      throw new Error(`Anthropic API error: ${error.message}`)
    }
  }

  async streamResponse(prompt: string, systemPrompt?: string) {
    try {
      return streamText({
        model: this.anthropic(this.model),
        prompt,
        system: systemPrompt || "You are a helpful AI assistant.",
        maxTokens: 1000,
      })
    } catch (error) {
      console.error("Anthropic Stream Error:", error)
      throw new Error(`Anthropic streaming error: ${error.message}`)
    }
  }
}
