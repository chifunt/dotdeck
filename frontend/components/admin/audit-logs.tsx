"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { api } from "@/lib/axios-instance"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Search, User, FileText, Shield, Tag } from "lucide-react"
import { useDebounce } from "@/hooks/use-debounce"
import type { Paging } from "@/types"

interface AuditRow {
  id: number
  action: string
  entityType: "user" | "deck" | "tag" | "comment"
  entityId: number
  userId: number
  username: string
  details: string
  ipAddress: string
  userAgent: string
  createdAt: string
}

const fetchAuditLogs = async (params: { limit?: number; offset?: number }): Promise<Paging<AuditRow>> => {
  try {
    const { data } = await api.get("/admin/audit-logs", { params })
    return data
  } catch (error) {
    console.error("Failed to fetch audit logs:", error)
    // Return mock data for development/preview
    return {
      data: [
        {
          id: 1,
          action: "create_deck",
          entityType: "deck",
          entityId: 123,
          userId: 1,
          username: "john_doe",
          details: "Created deck 'My Awesome Config'",
          ipAddress: "192.168.1.100",
          userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          createdAt: "2024-01-20T14:30:00Z",
        },
        {
          id: 2,
          action: "update_user_role",
          entityType: "user",
          entityId: 2,
          userId: 1,
          username: "admin_user",
          details: "Changed user role from 'user' to 'moderator'",
          ipAddress: "192.168.1.101",
          userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
          createdAt: "2024-01-20T13:15:00Z",
        },
        {
          id: 3,
          action: "delete_comment",
          entityType: "comment",
          entityId: 456,
          userId: 2,
          username: "mod_user",
          details: "Deleted inappropriate comment",
          ipAddress: "192.168.1.102",
          userAgent: "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36",
          createdAt: "2024-01-20T12:45:00Z",
        },
      ],
      paging: {
        limit: 50,
        offset: 0,
        total: 3,
      },
    }
  }
}

export function AuditLogs() {
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(0)
  const pageSize = 50

  const debouncedSearchTerm = useDebounce(searchTerm, 500)

  const {
    data: logsData,
    isLoading,
    error,
  } = useQuery<Paging<AuditRow>, Error>({
    queryKey: ["auditLogs", currentPage, debouncedSearchTerm],
    queryFn: () =>
      fetchAuditLogs({
        limit: pageSize,
        offset: currentPage * pageSize,
      }),
  })

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleString()
    } catch {
      return "Unknown"
    }
  }

  const getActionBadgeVariant = (action: string) => {
    if (action.includes("create")) return "default"
    if (action.includes("update") || action.includes("edit")) return "secondary"
    if (action.includes("delete") || action.includes("ban")) return "destructive"
    if (action.includes("approve")) return "default"
    return "outline"
  }

  const getEntityIcon = (entityType: string) => {
    switch (entityType) {
      case "user":
        return <User className="h-4 w-4" />
      case "deck":
        return <FileText className="h-4 w-4" />
      case "tag":
        return <Tag className="h-4 w-4" />
      default:
        return <Shield className="h-4 w-4" />
    }
  }

  // Filter logs based on search term (client-side for now)
  const filteredLogs =
    logsData?.data?.filter(
      (log) =>
        log.username?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        log.details?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        log.action?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()),
    ) || []

  return (
    <Card>
      <CardHeader>
        <CardTitle>Audit Logs</CardTitle>
        <CardDescription>Track all administrative actions and changes</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by username, action, or details..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <Skeleton className="h-4 w-4" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-32" />
              </div>
            ))}
          </div>
        ) : !logsData?.data ? (
          <p className="text-destructive">Failed to load audit logs.</p>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Action</TableHead>
                  <TableHead>Entity</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Details</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>IP Address</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>
                      <Badge variant={getActionBadgeVariant(log.action)}>{log.action}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getEntityIcon(log.entityType)}
                        <span className="text-sm">{log.entityType}</span>
                        <span className="text-xs text-muted-foreground">#{log.entityId}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{log.username}</div>
                      <div className="text-xs text-muted-foreground">ID: {log.userId}</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm max-w-md truncate" title={log.details}>
                        {log.details}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">{formatDate(log.createdAt)}</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm font-mono">{log.ipAddress}</div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {logsData && (
          <div className="flex justify-between items-center text-sm text-muted-foreground">
            <span>
              Showing {filteredLogs.length} of {logsData.paging?.total || 0} log entries
            </span>
            {logsData.paging && logsData.paging.total > pageSize && (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                  disabled={currentPage === 0}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={(currentPage + 1) * pageSize >= logsData.paging.total}
                >
                  Next
                </Button>
              </div>
            )}
          </div>
        )}

        {error && (
          <div className="text-sm text-muted-foreground mt-4">
            Note: Using mock data for preview. Connect to your backend API for real audit log data.
          </div>
        )}
      </CardContent>
    </Card>
  )
}
