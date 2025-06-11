import ChatInterface from "@/components/chat-interface"
import DataDashboard from "@/components/data-dashboard"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function Home() {
  return (
    <main className="container mx-auto p-4">

      <Tabs defaultValue="chat" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="chat">AI Chat</TabsTrigger>
          <TabsTrigger value="dashboard">Data Dashboard</TabsTrigger>
        </TabsList>

        <TabsContent value="chat" className="mt-6">
          <ChatInterface />
        </TabsContent>

        <TabsContent value="dashboard" className="mt-6">
          <DataDashboard />
        </TabsContent>

      </Tabs>
    </main>
  )
}
