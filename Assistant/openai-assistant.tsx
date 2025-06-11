import { generateText, streamText } from "ai"
import { createOpenAI } from "@ai-sdk/openai"

export class OpenAIAssistant {
  private model: string
  private openai: any

  constructor(model = "gpt-4o-mini") {
    this.model = model

    // Validate API key
    if (!process.env.OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY environment variable is required")
    }

    // Create OpenAI instance with API key
    this.openai = createOpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      compatibility: "strict",
    })
  }

  async generateResponse(prompt: string, systemPrompt?: string): Promise<string> {
    try {
      const { text } = await generateText({
        model: this.openai(this.model),
        prompt,
        system: systemPrompt || "You are a helpful AI assistant.",
        maxTokens: 1000,
      })

      return text
    } catch (error) {
      console.error("OpenAI Assistant Error:", error)

      // Provide more specific error messages
      if (error.message?.includes("API key")) {
        throw new Error("Invalid OpenAI API key. Please check your OPENAI_API_KEY environment variable.")
      } else if (error.message?.includes("quota")) {
        throw new Error("OpenAI API quota exceeded. Please check your billing.")
      } else if (error.message?.includes("rate limit")) {
        throw new Error("OpenAI API rate limit exceeded. Please try again later.")
      }

      throw new Error(`OpenAI API error: ${error.message}`)
    }
  }

  async streamResponse(prompt: string, systemPrompt?: string) {
    try {
      return streamText({
        model: this.openai(this.model),
        prompt,
        system: systemPrompt || "You are a helpful AI assistant.",
        maxTokens: 1000,
      })
    } catch (error) {
      console.error("OpenAI Stream Error:", error)
      throw new Error(`OpenAI streaming error: ${error.message}`)
    }
  }
}
