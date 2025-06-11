import { NextResponse } from "next/server"
import Redis from "ioredis"

const redis = new Redis(process.env.REDIS_URL || "redis://localhost:6379")

export async function POST() {
  try {
    // Trigger Celery task
    const taskId = `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    await redis.lpush(
      "celery",
      JSON.stringify({
        id: taskId,
        task: "celery_app.tasks.fetch_website_data",
        args: [],
        kwargs: {},
        retries: 0,
        eta: null,
        expires: null,
      }),
    )

    return NextResponse.json({
      task_id: taskId,
      status: "PENDING",
      message: "Data fetch task queued successfully",
    })
  } catch (error) {
    console.error("Task API Error:", error)
    return NextResponse.json({ error: "Failed to queue task" }, { status: 500 })
  }
}
