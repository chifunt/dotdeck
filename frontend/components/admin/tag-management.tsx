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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
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
import { Skeleton } from "@/components/ui/skeleton"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Search, Plus, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { useDebounce } from "@/hooks/use-debounce"
import type { Tag, Paging } from "@/types"

const fetchTags = async (params: { limit?: number; offset?: number }): Promise<Paging<Tag>> => {
  try {
    const { data } = await api.get("/admin/tags", { params })
    return data
  } catch (error) {
    console.error("Failed to fetch tags:", error)
    // Return mock data for development/preview
    return {
      data: [
        { id: 1, name: "react", isOfficial: true },
        { id: 2, name: "typescript", isOfficial: true },
        { id: 3, name: "javascript", isOfficial: true },
        { id: 4, name: "neovim", isOfficial: false },
        { id: 5, name: "lua", isOfficial: false },
        { id: 6, name: "python", isOfficial: true },
        { id: 7, name: "nodejs", isOfficial: true },
        { id: 8, name: "custom-tag", isOfficial: false },
      ],
      paging: {
        limit: 50,
        offset: 0,
        total: 8,
      },
    }
  }
}

export function TagManagement() {
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(0)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [newTagName, setNewTagName] = useState("")
  const [newTagOfficial, setNewTagOfficial] = useState(false)
  const pageSize = 50
  const queryClient = useQueryClient()

  const debouncedSearchTerm = useDebounce(searchTerm, 500)

  const {
    data: tagsData,
    isLoading,
    error,
  } = useQuery<Paging<Tag>, Error>({
    queryKey: ["adminTags", currentPage, debouncedSearchTerm],
    queryFn: () =>
      fetchTags({
        limit: pageSize,
        offset: currentPage * pageSize,
      }),
  })

  const createTagMutation = useMutation({
    mutationFn: (tag: { name: string; isOfficial: boolean }) => api.post("/admin/tags", tag),
    onSuccess: () => {
      toast.success("Tag created successfully")
      queryClient.invalidateQueries({ queryKey: ["adminTags"] })
      setIsCreateDialogOpen(false)
      setNewTagName("")
      setNewTagOfficial(false)
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to create tag")
    },
  })

  const deleteTagMutation = useMutation({
    mutationFn: (tagId: number) => api.delete(`/admin/tags/${tagId}`),
    onSuccess: () => {
      toast.success("Tag deleted successfully")
      queryClient.invalidateQueries({ queryKey: ["adminTags"] })
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to delete tag")
    },
  })

  const handleCreateTag = () => {
    if (!newTagName.trim()) {
      toast.error("Tag name is required")
      return
    }
    createTagMutation.mutate({ name: newTagName.trim(), isOfficial: newTagOfficial })
  }

  // Filter tags based on search term (client-side for now)
  const filteredTags =
    tagsData?.data?.filter((tag) => tag.name?.toLowerCase().includes(debouncedSearchTerm.toLowerCase())) || []

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tag Management</CardTitle>
        <CardDescription>Create and manage tags</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search tags..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Tag
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Tag</DialogTitle>
                <DialogDescription>Add a new tag to the system</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="tagName">Tag Name</Label>
                  <Input
                    id="tagName"
                    value={newTagName}
                    onChange={(e) => setNewTagName(e.target.value)}
                    placeholder="e.g., react, typescript"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="official"
                    checked={newTagOfficial}
                    onCheckedChange={(checked) => setNewTagOfficial(checked as boolean)}
                  />
                  <Label htmlFor="official">Official tag</Label>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateTag} disabled={createTagMutation.isPending}>
                  {createTagMutation.isPending ? "Creating..." : "Create Tag"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-20" />
              </div>
            ))}
          </div>
        ) : !tagsData?.data ? (
          <p className="text-destructive">Failed to load tags.</p>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tag</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTags.map((tag) => (
                  <TableRow key={tag.id}>
                    <TableCell>
                      <Badge variant="outline">{tag.name}</Badge>
                    </TableCell>
                    <TableCell>
                      {tag.isOfficial ? (
                        <Badge variant="default" className="text-xs">
                          Official
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="text-xs">
                          Community
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Tag</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete the tag "{tag.name}"? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => deleteTagMutation.mutate(tag.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Delete Tag
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {tagsData && (
          <div className="flex justify-between items-center text-sm text-muted-foreground">
            <span>
              Showing {filteredTags.length} of {tagsData.paging?.total || 0} tags
            </span>
            {tagsData.paging && tagsData.paging.total > pageSize && (
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
                  disabled={(currentPage + 1) * pageSize >= tagsData.paging.total}
                >
                  Next
                </Button>
              </div>
            )}
          </div>
        )}

        {error && (
          <div className="text-sm text-muted-foreground mt-4">
            Note: Using mock data for preview. Connect to your backend API for real tag data.
          </div>
        )}
      </CardContent>
    </Card>
  )
}
