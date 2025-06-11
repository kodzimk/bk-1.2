"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { RefreshCw, Database, Clock, Globe } from "lucide-react"

interface ScrapedData {
  id: number
  url: string
  data: any
  scraped_at: string
}

interface TaskStatus {
  task_id: string
  status: string
  result?: any
}

export default function DataDashboard() {
  const [scrapedData, setScrapedData] = useState<ScrapedData[]>([])
  const [taskStatus, setTaskStatus] = useState<TaskStatus[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const fetchData = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/data")
      const data = await response.json()
      setScrapedData(data.scraped_data || [])
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const triggerDataFetch = async () => {
    try {
      const response = await fetch("/api/tasks/fetch-data", {
        method: "POST",
      })
      const result = await response.json()
      setTaskStatus((prev) => [...prev, result])
    } catch (error) {
      console.error("Error triggering task:", error)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Data Dashboard</h2>
        <div className="flex gap-2">
          <Button onClick={fetchData} disabled={isLoading} variant="outline">
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button onClick={triggerDataFetch}>
            <Database className="h-4 w-4 mr-2" />
            Fetch Data Now
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Recent Scraped Data
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-64">
              {scrapedData.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  No data available. Run the fetch task to collect data.
                </div>
              ) : (
                <div className="space-y-3">
                  {scrapedData.slice(0, 10).map((item) => (
                    <div key={item.id} className="border rounded-lg p-3">
                      <div className="flex justify-between items-start mb-2">
                        <div className="text-sm font-medium truncate flex-1">{item.url}</div>
                        <Badge variant="outline" className="ml-2">
                          {new Date(item.scraped_at).toLocaleDateString()}
                        </Badge>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Data size: {JSON.stringify(item.data).length} characters
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Task Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-64">
              {taskStatus.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  No recent tasks. Trigger a task to see status updates.
                </div>
              ) : (
                <div className="space-y-3">
                  {taskStatus
                    .slice(-10)
                    .reverse()
                    .map((task, index) => (
                      <div key={index} className="border rounded-lg p-3">
                        <div className="flex justify-between items-center mb-2">
                          <div className="text-sm font-medium">Task ID: {task.task_id.slice(0, 8)}...</div>
                          <Badge variant={task.status === "SUCCESS" ? "default" : "secondary"}>{task.status}</Badge>
                        </div>
                        {task.result && (
                          <div className="text-xs text-muted-foreground">
                            {JSON.stringify(task.result).slice(0, 100)}...
                          </div>
                        )}
                      </div>
                    ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
