"use client"

import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"
import { UserManagement } from "@/components/admin/user-management"
import { DeckModeration } from "@/components/admin/deck-moderation"
import { TagManagement } from "@/components/admin/tag-management"
import { AuditLogs } from "@/components/admin/audit-logs"
import { AdminStats } from "@/components/admin/admin-stats"
import { Users, FileText, Tags, Activity, BarChart3 } from "lucide-react"

export default function AdminPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("stats")

  useEffect(() => {
    if (!isLoading && (!user || (user.role !== "admin" && user.role !== "moderator"))) {
      toast.error("Access denied. You are not authorized to view this page.")
      router.push("/")
    }
  }, [user, isLoading, router])

  if (isLoading || !user || (user.role !== "admin" && user.role !== "moderator")) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <p>Loading or checking authorization...</p>
      </div>
    )
  }

  const isAdmin = user.role === "admin"
  const isModerator = user.role === "moderator"

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <BarChart3 className="h-6 w-6" />
            {isAdmin ? "Admin Panel" : "Moderator Panel"}
          </CardTitle>
          <CardDescription>Welcome, {user.username}! Manage users, content, and platform settings.</CardDescription>
        </CardHeader>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="stats" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Stats
          </TabsTrigger>
          {isAdmin && (
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Users
            </TabsTrigger>
          )}
          <TabsTrigger value="decks" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Decks
          </TabsTrigger>
          {isAdmin && (
            <TabsTrigger value="tags" className="flex items-center gap-2">
              <Tags className="h-4 w-4" />
              Tags
            </TabsTrigger>
          )}
          {isAdmin && (
            <TabsTrigger value="logs" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Audit Logs
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="stats">
          <AdminStats />
        </TabsContent>

        {isAdmin && (
          <TabsContent value="users">
            <UserManagement />
          </TabsContent>
        )}

        <TabsContent value="decks">
          <DeckModeration />
        </TabsContent>

        {isAdmin && (
          <TabsContent value="tags">
            <TagManagement />
          </TabsContent>
        )}

        {isAdmin && (
          <TabsContent value="logs">
            <AuditLogs />
          </TabsContent>
        )}
      </Tabs>
    </div>
  )
}
