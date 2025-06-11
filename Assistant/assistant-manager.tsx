import { MockAssistant } from "./mock-assistant"

export type AssistantProvider = "openai" | "anthropic" | "google" | "mock"

export class AssistantManager {
  private assistants: Map<AssistantProvider, any>

  constructor() {
    this.assistants = new Map()

    // Initialize real assistants first (if API keys are available)
    this.initializeRealAssistants()

    // Always add mock as fallback
    this.assistants.set("mock", new MockAssistant("Mock Assistant"))

    console.log("Available AI providers:", Array.from(this.assistants.keys()))
  }

  private initializeRealAssistants() {
    // Try OpenAI first
    try {
      if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.startsWith("sk-")) {
        const { OpenAIAssistant } = require("./openai-assistant")
        this.assistants.set("openai", new OpenAIAssistant())
        console.log("✅ OpenAI assistant initialized")
      } else {
        console.log("⚠️ OpenAI API key not found or invalid format")
      }
    } catch (error) {
      console.warn("❌ OpenAI assistant initialization failed:", error.message)
    }

    // Try Anthropic
    try {
      if (process.env.ANTHROPIC_API_KEY && process.env.ANTHROPIC_API_KEY.startsWith("sk-ant-")) {
        const { AnthropicAssistant } = require("./anthropic-assistant")
        this.assistants.set("anthropic", new AnthropicAssistant())
        console.log("✅ Anthropic assistant initialized")
      } else {
        console.log("⚠️ Anthropic API key not found or invalid format")
      }
    } catch (error) {
      console.warn("❌ Anthropic assistant initialization failed:", error.message)
    }

    // Try Google
    try {
      if (process.env.GOOGLE_API_KEY && process.env.GOOGLE_API_KEY.length > 20) {
        const { GoogleAssistant } = require("./google-assistant")
        this.assistants.set("google", new GoogleAssistant())
        console.log("✅ Google assistant initialized")
      } else {
        console.log("⚠️ Google API key not found or invalid format")
      }
    } catch (error) {
      console.warn("❌ Google assistant initialization failed:", error.message)
    }
  }

  async generateResponse(provider: AssistantProvider, prompt: string, systemPrompt?: string): Promise<string> {
    const assistant = this.assistants.get(provider)
    if (!assistant) {
      const availableProviders = this.getAvailableProviders()
      throw new Error(
        `Assistant provider ${provider} not available. Available providers: ${availableProviders.join(", ") || "none"}`,
      )
    }

    return assistant.generateResponse(prompt, systemPrompt)
  }

  async streamResponse(provider: AssistantProvider, prompt: string, systemPrompt?: string) {
    const assistant = this.assistants.get(provider)
    if (!assistant) {
      const availableProviders = this.getAvailableProviders()
      throw new Error(
        `Assistant provider ${provider} not available. Available providers: ${availableProviders.join(", ") || "none"}`,
      )
    }

    return assistant.streamResponse(prompt, systemPrompt)
  }

  getAvailableProviders(): AssistantProvider[] {
    return Array.from(this.assistants.keys())
  }

  isProviderAvailable(provider: AssistantProvider): boolean {
    return this.assistants.has(provider)
  }

  getPreferredProvider(): AssistantProvider {
    // Return the first real AI provider if available, otherwise mock
    const providers = this.getAvailableProviders()

    if (providers.includes("openai")) return "openai"
    if (providers.includes("anthropic")) return "anthropic"
    if (providers.includes("google")) return "google"

    return "mock"
  }
}
