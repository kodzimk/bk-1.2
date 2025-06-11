export class MockAssistant {
  private model: string
  private responses: Record<string, string[]>

  constructor(model = "mock-model") {
    this.model = model

    // Pre-defined responses for different topics
    this.responses = {
      greeting: [
        "Hello! How can I help you today?",
        "Hi there! I'm your AI assistant. What can I do for you?",
        "Greetings! How may I assist you?",
      ],
      question: [
        "That's an interesting question. Based on my knowledge, I would say it depends on several factors.",
        "Great question! There are multiple perspectives to consider here.",
        "I'd be happy to help with that question. Here's what I know about this topic.",
      ],
      default: [
        "I understand what you're asking. Let me provide some information that might help.",
        "Thank you for your message. Here's my response based on what I know.",
        "I've processed your request and here's what I can tell you.",
      ],
    }
  }

  async generateResponse(prompt: string, systemPrompt?: string): Promise<string> {
    // Simulate processing delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Determine response category based on prompt
    let category = "default"
    if (prompt.toLowerCase().includes("hello") || prompt.toLowerCase().includes("hi")) {
      category = "greeting"
    } else if (prompt.includes("?")) {
      category = "question"
    }

    // Select a random response from the appropriate category
    const responses = this.responses[category]
    const randomIndex = Math.floor(Math.random() * responses.length)

    // Add some context from the prompt to make it seem more relevant
    const words = prompt.split(" ")
    const contextWords = words.filter((word) => word.length > 4).slice(0, 3)
    let contextPhrase = ""

    if (contextWords.length > 0) {
      contextPhrase = ` Regarding "${contextWords.join(" ")}", I think this is an important topic.`
    }

    return (
      responses[randomIndex] + contextPhrase + `\n\n(This is a mock response from ${this.model} - no API key required)`
    )
  }

  async streamResponse(prompt: string, systemPrompt?: string) {
    // For simplicity, we'll just use the non-streaming version in the mock
    const response = await this.generateResponse(prompt, systemPrompt)

    return {
      text: Promise.resolve(response),
      textStream: {
        [Symbol.asyncIterator]: (async function* () {
          // Simulate streaming by yielding one character at a time with delays
          for (let i = 0; i < response.length; i++) {
            await new Promise((resolve) => setTimeout(resolve, 20))
            yield response[i]
          }
        })(),
      },
    }
  }
}
