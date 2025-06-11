import { NextResponse } from "next/server"
import { AssistantManager } from "@/Assistant/assistant-manager"

// Create a singleton instance of AssistantManager
let assistantManager: AssistantManager

export async function GET() {
  try {
    // Initialize the manager if it doesn't exist
    if (!assistantManager) {
      assistantManager = new AssistantManager()
    }

    const availableProviders = assistantManager.getAvailableProviders()

    return NextResponse.json({
      providers: availableProviders,
      total: availableProviders.length,
    })
  } catch (error) {
    console.error("Providers API Error:", error)
    return NextResponse.json(
      {
        providers: ["mock"], // Always include mock as fallback
        error: "Failed to check available providers",
      },
      { status: 500 },
    )
  }
}
