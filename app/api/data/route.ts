import { NextResponse } from "next/server"
import { Pool } from "pg"

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

export async function GET() {
  try {
    const client = await pool.connect()

    const result = await client.query(`
      SELECT id, url, data, scraped_at 
      FROM scraped_data 
      ORDER BY scraped_at DESC 
      LIMIT 50
    `)

    client.release()

    return NextResponse.json({
      scraped_data: result.rows,
      total: result.rows.length,
    })
  } catch (error) {
    console.error("Data API Error:", error)
    return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 })
  }
}
