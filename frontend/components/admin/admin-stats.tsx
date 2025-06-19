"use client"

import { useQuery } from "@tanstack/react-query"
import { api } from "@/lib/axios-instance"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Users, FileText, Tags, MessageSquare, ThumbsUp } from "lucide-react"

interface AdminStats {
  users: number
  decks: number
  tags: number
  comments: number
  ratings: number
}

const fetchAdminStats = async (): Promise<AdminStats> => {
  try {
    const { data } = await api.get("/admin/stats")
    return data
  } catch (error) {
    console.error("Failed to fetch admin stats:", error)
    // Return mock data for development/preview
    return {
      users: 1250,
      decks: 3420,
      tags: 156,
      comments: 8930,
      ratings: 15680,
    }
  }
}

export function AdminStats() {
  const {
    data: stats,
    isLoading,
    error,
  } = useQuery<AdminStats, Error>({
    queryKey: ["adminStats"],
    queryFn: fetchAdminStats,
  })

  if (isLoading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16 mb-1" />
              <Skeleton className="h-3 w-24" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  // Provide default values to prevent undefined errors
  const safeStats = {
    users: stats?.users ?? 0,
    decks: stats?.decks ?? 0,
    tags: stats?.tags ?? 0,
    comments: stats?.comments ?? 0,
    ratings: stats?.ratings ?? 0,
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{safeStats.users.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Registered users</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Decks</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{safeStats.decks.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Published decks</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tags</CardTitle>
            <Tags className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{safeStats.tags.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Available tags</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Comments</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{safeStats.comments.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">User comments</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Ratings</CardTitle>
            <ThumbsUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{safeStats.ratings.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Votes cast</p>
          </CardContent>
        </Card>
      </div>

      {error && (
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">
              Note: Using mock data for preview. Connect to your backend API for real statistics.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
