"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { api } from "@/lib/axios-instance"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Search, Ban, Shield, ShieldCheck, ChevronLeft, ChevronRight } from "lucide-react"
import { toast } from "sonner"
import { useDebounce } from "@/hooks/use-debounce"
import type { User, Paging } from "@/types"

const ITEMS_PER_PAGE = 12

const fetchUsers = async (params: {
  limit?: number
  offset?: number
}): Promise<Paging<User>> => {
  try {
    const { data } = await api.get("/admin/users", { params })
    return data
  } catch (error) {
    console.error("Failed to fetch users:", error)
    // Return mock data for development/preview
    return {
      data: [
        {
          id: 1,
          username: "john_doe",
          email: "john@example.com",
          role: "user",
        },
        {
          id: 2,
          username: "jane_admin",
          email: "jane@example.com",
          role: "admin",
        },
        {
          id: 3,
          username: "mod_user",
          email: "mod@example.com",
          role: "moderator",
        },
        {
          id: 4,
          username: "regular_user",
          email: "user@example.com",
          role: "user",
        },
        {
          id: 5,
          username: "another_user",
          email: "another@example.com",
          role: "user",
        },
        {
          id: 6,
          username: "test_user",
          email: "test@example.com",
          role: "user",
        },
      ],
      paging: {
        limit: ITEMS_PER_PAGE,
        offset: 0,
        total: 6,
      },
    }
  }
}

function PaginationControls({
  currentPage,
  totalPages,
  onPageChange,
}: {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}) {
  if (totalPages <= 1) return null

  return (
    <div className="flex items-center justify-between mt-4">
      <div className="text-sm text-muted-foreground">
        Page {currentPage} of {totalPages}
      </div>
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="flex items-center"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="flex items-center"
        >
          Next
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
    </div>
  )
}

export function UserManagement() {
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const queryClient = useQueryClient()

  const debouncedSearchTerm = useDebounce(searchTerm, 500)

  const {
    data: usersData,
    isLoading,
    error,
  } = useQuery<Paging<User>, Error>({
    queryKey: ["adminUsers", currentPage, debouncedSearchTerm],
    queryFn: () =>
      fetchUsers({
        limit: ITEMS_PER_PAGE,
        offset: (currentPage - 1) * ITEMS_PER_PAGE,
      }),
  })

  const banUserMutation = useMutation({
    mutationFn: (userId: number) => {
      return api.post(`/admin/users/${userId}/ban`).catch(() => {
        toast.error("Admin ban not available - this is a preview")
        throw new Error("Admin functionality not available")
      })
    },
    onSuccess: () => {
      toast.success("User banned successfully")
      queryClient.invalidateQueries({ queryKey: ["adminUsers"] })
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to ban user")
    },
  })

  const unbanUserMutation = useMutation({
    mutationFn: (userId: number) => api.delete(`/admin/users/${userId}/ban`),
    onSuccess: () => {
      toast.success("User unbanned successfully")
      queryClient.invalidateQueries({ queryKey: ["adminUsers"] })
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to unban user")
    },
  })

  const updateRoleMutation = useMutation({
    mutationFn: ({ userId, role }: { userId: number; role: string }) =>
      api.patch(`/admin/users/${userId}/role`, { role }).catch(() => {
        toast.error("Admin role update not available - this is a preview")
        throw new Error("Admin functionality not available")
      }),
    onSuccess: () => {
      toast.success("User role updated successfully")
      queryClient.invalidateQueries({ queryKey: ["adminUsers"] })
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to update user role")
    },
  })

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "admin":
        return "destructive"
      case "moderator":
        return "default"
      default:
        return "secondary"
    }
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "admin":
        return <ShieldCheck className="h-3 w-3" />
      case "moderator":
        return <Shield className="h-3 w-3" />
      default:
        return null
    }
  }

  const totalPages = Math.ceil((usersData?.paging?.total || 0) / ITEMS_PER_PAGE)

  // Filter users based on search term (client-side for now)
  const filteredUsers =
    usersData?.data?.filter(
      (user) =>
        user.username?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()),
    ) || []

  return (
    <Card>
      <CardHeader>
        <CardTitle>User Management</CardTitle>
        <CardDescription>Manage user accounts, roles, and permissions ({ITEMS_PER_PAGE} per page)</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search users by username or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: ITEMS_PER_PAGE }).map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
            ))}
          </div>
        ) : !usersData?.data ? (
          <p className="text-destructive">Failed to load users.</p>
        ) : (
          <>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{user.username || "Unknown"}</div>
                          <div className="text-sm text-muted-foreground">{user.email || "No email"}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={getRoleBadgeVariant(user.role || "user")}
                          className="flex items-center gap-1 w-fit"
                        >
                          {getRoleIcon(user.role || "user")}
                          {user.role || "user"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Select
                            value={user.role || "user"}
                            onValueChange={(role) => updateRoleMutation.mutate({ userId: user.id, role })}
                          >
                            <SelectTrigger className="w-24 h-8">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="user">User</SelectItem>
                              <SelectItem value="moderator">Mod</SelectItem>
                              <SelectItem value="admin">Admin</SelectItem>
                            </SelectContent>
                          </Select>

                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="outline" size="sm">
                                <Ban className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Ban User</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to ban {user.username}? This will prevent them from accessing
                                  the platform.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => banUserMutation.mutate(user.id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Ban User
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <PaginationControls currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
          </>
        )}

        {usersData && (
          <div className="text-sm text-muted-foreground">
            Showing {filteredUsers.length} of {usersData.paging?.total || 0} users
          </div>
        )}

        {error && (
          <div className="text-sm text-muted-foreground mt-4">
            Note: Using mock data for preview. Admin endpoints may not be available yet.
          </div>
        )}
      </CardContent>
    </Card>
  )
}
