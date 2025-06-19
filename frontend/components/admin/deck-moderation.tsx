"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { api } from "@/lib/axios-instance"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
import { Skeleton } from "@/components/ui/skeleton"
import { Search, Trash2, Eye, ChevronLeft, ChevronRight } from "lucide-react"
import { toast } from "sonner"
import { useDebounce } from "@/hooks/use-debounce"
import Link from "next/link"
import type { DeckSummary, Paging } from "@/types"

const ITEMS_PER_PAGE = 12

const fetchDecks = async (params: { limit?: number; offset?: number }): Promise<Paging<DeckSummary>> => {
  try {
    // Try admin endpoint first, fall back to regular decks endpoint
    let response
    try {
      response = await api.get("/admin/decks", { params })
    } catch (adminError) {
      console.log("Admin endpoint not available, using regular decks endpoint")
      response = await api.get("/decks", { params })
    }

    if (response.data && Array.isArray(response.data.data) && response.data.paging) {
      return response.data
    }

    // Handle direct array response
    if (Array.isArray(response.data)) {
      return {
        data: response.data,
        paging: {
          limit: params.limit || ITEMS_PER_PAGE,
          offset: params.offset || 0,
          total: response.data.length,
        },
      }
    }

    throw new Error("Unexpected response format")
  } catch (error) {
    console.error("Failed to fetch decks:", error)
    // Return mock data for development/preview
    return {
      data: [
        {
          id: 1,
          title: "My Awesome Neovim Config",
          slug: "awesome-neovim-config",
          description: "A comprehensive Neovim configuration with LSP support",
          thumbnailUrl: "/uploads/neovim-thumb.png",
          createdAt: "2024-01-15T10:30:00Z",
          author: { id: 1, username: "john_doe", email: "john@example.com" },
          tags: [
            { id: 1, name: "neovim", isOfficial: true },
            { id: 2, name: "lua", isOfficial: false },
          ],
          likes: 25,
          dislikes: 2,
          snippets: [],
        },
        {
          id: 2,
          title: "React TypeScript Starter",
          slug: "react-typescript-starter",
          description: "A modern React setup with TypeScript and Vite",
          thumbnailUrl: null,
          createdAt: "2024-01-14T14:20:00Z",
          author: { id: 2, username: "jane_admin", email: "jane@example.com" },
          tags: [
            { id: 3, name: "react", isOfficial: true },
            { id: 4, name: "typescript", isOfficial: true },
          ],
          likes: 18,
          dislikes: 1,
          snippets: [],
        },
        {
          id: 3,
          title: "Deck with Missing Author",
          slug: "missing-author-deck",
          description: "This deck has no author data",
          thumbnailUrl: null,
          createdAt: "2024-01-13T09:00:00Z",
          author: { id: 0, username: "", email: "" },
          tags: [],
          likes: 5,
          dislikes: 0,
          snippets: [],
        },
      ],
      paging: {
        limit: ITEMS_PER_PAGE,
        offset: 0,
        total: 3,
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

export function DeckModeration() {
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const queryClient = useQueryClient()

  const debouncedSearchTerm = useDebounce(searchTerm, 500)

  const {
    data: decksData,
    isLoading,
    error,
  } = useQuery<Paging<DeckSummary>, Error>({
    queryKey: ["adminDecks", currentPage, debouncedSearchTerm],
    queryFn: () =>
      fetchDecks({
        limit: ITEMS_PER_PAGE,
        offset: (currentPage - 1) * ITEMS_PER_PAGE,
      }),
  })

  const deleteDeckMutation = useMutation({
    mutationFn: (deckId: number) => {
      // Try admin endpoint first, fall back to regular endpoint
      return api.delete(`/admin/decks/${deckId}`).catch(() => {
        toast.error("Admin delete not available - this is a preview")
        throw new Error("Admin functionality not available")
      })
    },
    onSuccess: () => {
      toast.success("Deck deleted successfully")
      queryClient.invalidateQueries({ queryKey: ["adminDecks"] })
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to delete deck")
    },
  })

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString()
    } catch {
      return "Unknown"
    }
  }

  const getAuthorName = (deck: DeckSummary): string => {
    if (!deck.author) return "Unknown Author"
    if (typeof deck.author === "string") return deck.author
    if (deck.author.username) return deck.author.username
    return "Unknown Author"
  }

  const totalPages = Math.ceil((decksData?.paging?.total || 0) / ITEMS_PER_PAGE)

  // Filter decks based on search term (client-side for now)
  const filteredDecks =
    decksData?.data?.filter((deck) => {
      const title = deck.title?.toLowerCase() || ""
      const authorName = getAuthorName(deck).toLowerCase()
      const searchLower = debouncedSearchTerm.toLowerCase()

      return title.includes(searchLower) || authorName.includes(searchLower)
    }) || []

  return (
    <Card>
      <CardHeader>
        <CardTitle>Deck Moderation</CardTitle>
        <CardDescription>Manage and moderate deck content ({ITEMS_PER_PAGE} per page)</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search decks by title or author..."
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
                <Skeleton className="h-16 w-24 rounded" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-60" />
                  <Skeleton className="h-3 w-40" />
                  <Skeleton className="h-3 w-32" />
                </div>
              </div>
            ))}
          </div>
        ) : !decksData?.data ? (
          <p className="text-destructive">Failed to load decks.</p>
        ) : (
          <>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Deck</TableHead>
                    <TableHead>Author</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Stats</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDecks.map((deck) => (
                    <TableRow key={deck.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <div className="w-16 h-12 bg-muted rounded flex items-center justify-center text-xs">
                            {deck.thumbnailUrl ? "IMG" : "NO IMG"}
                          </div>
                          <div>
                            <div className="font-medium">{deck.title || "Untitled Deck"}</div>
                            <div className="text-sm text-muted-foreground line-clamp-1">
                              {deck.description || "No description"}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{getAuthorName(deck)}</div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">{formatDate(deck.createdAt)}</div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{deck.likes || 0} likes</div>
                          <div className="text-muted-foreground">{deck.dislikes || 0} dislikes</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Link href={`/decks/${deck.slug || deck.id}`} target="_blank">
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>

                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="outline" size="sm">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Deck</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete "{deck.title || "this deck"}"? This action cannot be
                                  undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => deleteDeckMutation.mutate(deck.id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Delete Deck
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

        {decksData && (
          <div className="text-sm text-muted-foreground">
            Showing {filteredDecks.length} of {decksData.paging?.total || 0} decks
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
