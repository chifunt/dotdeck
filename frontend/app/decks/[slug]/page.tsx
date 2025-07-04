"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/axios-instance";
import type { RatingTotals } from "@/types";
import { Badge } from "@/components/ui/badge";
import {
  ThumbsUp,
  ThumbsDown,
  Edit,
  Copy,
  UserIcon,
  CalendarDays,
  AlertTriangle,
  Settings,
  ArrowLeft,
} from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CommentSchema, type CommentFormValues } from "@/lib/schemas";
import { Form, FormField, FormItem, FormMessage } from "@/components/ui/form";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow, format } from "date-fns";
import { getImageUrl } from "@/lib/get-image-url";
import { useState } from "react";
import { AnimatedButton } from "@/components/ui/animated-button";
import { Trash } from "lucide-react";

const fetchDeckBySlug = async (slugOrId: string): Promise<any> => {
  console.log("Fetching deck by slug/ID:", slugOrId);

  // Try slug first
  try {
    console.log("Trying slug endpoint:", `/decks/slug/${slugOrId}`);
    const response = await api.get(`/decks/slug/${slugOrId}`);
    console.log("Slug response data:", response.data);

    if (response.data) {
      return response.data;
    }
    throw new Error("No valid deck data in slug response");
  } catch (slugError: any) {
    console.log("Slug lookup failed:", slugError.message);

    // If slug fails and the parameter looks like an ID (numeric), try the ID endpoint
    if (/^\d+$/.test(slugOrId)) {
      console.log("Trying ID endpoint:", `/decks/${slugOrId}`);
      try {
        const response = await api.get(`/decks/${slugOrId}`);
        console.log("ID response data:", response.data);

        if (response.data) {
          return response.data;
        }
        throw new Error("No valid deck data in ID response");
      } catch (idError: any) {
        console.error("ID lookup also failed:", idError);
        throw idError;
      }
    }
    throw slugError;
  }
};

const fetchDeckComments = async (deckId: number): Promise<any> => {
  const response = await api.get(`/decks/${deckId}/comments`);
  console.log("Comments response data:", response.data);
  return response.data;
};

const fetchDeckRatings = async (deckId: number): Promise<RatingTotals> => {
  const { data } = await api.get(`/decks/${deckId}/ratings`);
  return data;
};

// Utility function to format dates as YYYY-MM-DD
const formatDateYMD = (dateString: any): string => {
  if (!dateString) {
    return "Unknown date";
  }

  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return "Unknown date";
    }
    return format(date, "yyyy-MM-dd");
  } catch (error) {
    console.warn("Invalid date format:", dateString, error);
    return "Unknown date";
  }
};

// Helper function to extract author information from deck
const getAuthorInfo = (deck: any) => {
  // Try different possible structures for author data
  let authorName = "Unknown Author";
  let authorUsername = null;

  // Check various possible author data structures
  if (deck.author?.username) {
    authorName = deck.author.username;
    authorUsername = deck.author.username;
  } else if (deck.username) {
    authorName = deck.username;
    authorUsername = deck.username;
  } else if (deck.author?.name) {
    authorName = deck.author.name;
    authorUsername = deck.author.username || deck.author.name;
  } else if (deck.user?.username) {
    authorName = deck.user.username;
    authorUsername = deck.user.username;
  } else if (deck.owner?.username) {
    authorName = deck.owner.username;
    authorUsername = deck.owner.username;
  }

  console.log("Author extraction debug:", {
    deck_author: deck.author,
    deck_username: deck.username,
    deck_user: deck.user,
    deck_owner: deck.owner,
    extracted_name: authorName,
    extracted_username: authorUsername,
  });

  return { authorName, authorUsername };
};

function CodeSnippetDisplay({
  snippet,
  onCopy,
}: {
  snippet: any;
  onCopy: (code: string) => void;
}) {
  if (!snippet) return null;
  return (
    <div className="bg-muted/50 p-4 rounded-md relative group hover-lift transition-all duration-300">
      {snippet.caption && (
        <p className="text-sm font-semibold mb-1">{snippet.caption}</p>
      )}
      <p className="text-xs text-muted-foreground mb-2 uppercase">
        {snippet.language}
      </p>
      <pre className="text-sm overflow-x-auto whitespace-pre-wrap break-all">
        <code>{snippet.code}</code>
      </pre>
      <AnimatedButton
        variant="ghost"
        size="icon"
        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-primary/10"
        onClick={() => onCopy(snippet.code)}
        animation="scale"
      >
        <Copy className="h-4 w-4" />
        <span className="sr-only">Copy code</span>
      </AnimatedButton>
    </div>
  );
}

function CommentDisplay({
  comment,
  canDelete,
  onDelete,
}: {
  comment: any;
  canDelete: boolean;
  onDelete: () => void;
}) {
  // Safely parse the date with fallback for relative time
  const getFormattedDate = (dateString: any) => {
    if (!dateString) {
      return "Unknown date";
    }

    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return "Unknown date";
      }
      return formatDistanceToNow(date, { addSuffix: true });
    } catch (error) {
      console.warn("Invalid date format:", dateString, error);
      return "Unknown date";
    }
  };

  // Handle the actual API structure for comments
  const createdAt = comment.created_at || comment.createdAt;
  const username = comment.username || "Unknown User";

  return (
    <div className="py-4 border-b last:border-b-0">
      {/* Flex container: left = content, right = delete button */}
      <div className="flex items-start justify-between">
        {/* Comment body */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center space-x-2">
              <UserIcon className="h-4 w-4 text-muted-foreground" />
              {username !== "Unknown User" ? (
                <Link
                  href={`/profile/${username}`}
                  className="font-semibold hover:text-primary transition-colors hover:underline"
                >
                  {username}
                </Link>
              ) : (
                <span className="font-semibold">{username}</span>
              )}
            </div>
            <span className="text-xs text-muted-foreground">
              {getFormattedDate(createdAt)}
            </span>
          </div>
          <p className="text-sm">
            {comment.body || comment.content || "No content"}
          </p>
        </div>

        {/* Delete button, only if allowed */}
        {canDelete && (
          <AnimatedButton
            variant="destructive"
            size="icon"
            onClick={() => {
              if (confirm("Delete this comment?")) onDelete();
            }}
            animation="glow"
            className="ml-4 flex-shrink-0"
          >
            <Trash className="h-4 w-4" />
            <span className="sr-only">Delete comment</span>
          </AnimatedButton>
        )}
      </div>
    </div>
  );
}

function ThumbnailDisplay({
  thumbnailUrl,
  title,
}: {
  thumbnailUrl: string;
  title: string;
}) {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  console.log("Thumbnail URL:", thumbnailUrl);

  // For local development, construct the proper URL
  const fullImageUrl = getImageUrl(thumbnailUrl);

  if (imageError || !thumbnailUrl) {
    return (
      <div className="aspect-[16/7] w-full bg-muted flex items-center justify-center rounded-lg border">
        <div className="text-center">
          <Settings className="h-12 w-12 text-muted-foreground mx-auto mb-2 animate-float" />
          <span className="text-sm text-muted-foreground">No thumbnail</span>
        </div>
      </div>
    );
  }

  return (
    <div className="relative aspect-[16/7] w-full overflow-hidden rounded-lg border">
      {imageLoading && (
        <div className="absolute inset-0 bg-muted flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      )}
      <img
        src={fullImageUrl || "/placeholder.svg"}
        alt={title || "Deck thumbnail"}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "contain",
          display: imageLoading ? "none" : "block",
        }}
        crossOrigin="anonymous"
        onError={(e) => {
          console.error("Image failed to load:", e.currentTarget.src);
          setImageError(true);
          setImageLoading(false);
        }}
        onLoad={() => {
          console.log("Image loaded successfully:", fullImageUrl);
          setImageLoading(false);
        }}
      />
    </div>
  );
}

export default function DeckDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const router = useRouter();

  const {
    data: deck,
    isLoading: isLoadingDeck,
    error: deckError,
  } = useQuery<any, Error>({
    queryKey: ["deck", slug],
    queryFn: () => fetchDeckBySlug(slug),
    enabled: !!slug,
  });

  const { data: commentsData, isLoading: isLoadingComments } = useQuery<
    any,
    Error
  >({
    queryKey: ["comments", deck?.id],
    queryFn: () => fetchDeckComments(deck!.id),
    enabled: !!deck?.id,
  });

  const deleteCommentMutation = useMutation({
    mutationFn: (commentId: number) =>
      api.delete(`/decks/${deck.id}/comments/${commentId}`),
    onSuccess: () => {
      toast.success("Comment deleted!");
      queryClient.invalidateQueries({ queryKey: ["comments", deck?.id] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to delete comment.");
    },
  });

  const {
    data: ratings,
    isLoading: isLoadingRatings,
    refetch: refetchRatings,
  } = useQuery<RatingTotals, Error>({
    queryKey: ["ratings", deck?.id],
    queryFn: () => fetchDeckRatings(deck!.id),
    enabled: !!deck?.id,
  });

  const commentForm = useForm<CommentFormValues>({
    resolver: zodResolver(CommentSchema),
    defaultValues: { body: "" },
  });

  const addCommentMutation = useMutation({
    mutationFn: (newComment: { body: string }) =>
      api.post(`/decks/${deck!.id}/comments`, newComment),
    onSuccess: () => {
      toast.success("Comment added!");
      queryClient.invalidateQueries({ queryKey: ["comments", deck?.id] });
      commentForm.reset();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to add comment.");
    },
  });

  const toggleVoteMutation = useMutation({
    mutationFn: (score: number) =>
      api.post(`/decks/${deck!.id}/ratings`, { score }),
    onSuccess: () => {
      toast.success("Vote updated!");
      refetchRatings();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to update vote.");
    },
  });

  const handleCopyCode = (code: string) => {
    navigator.clipboard
      .writeText(code)
      .then(() => toast.success("Code copied to clipboard!"))
      .catch(() => toast.error("Failed to copy code."));
  };

  const onCommentSubmit = (data: CommentFormValues) => {
    if (deck) {
      addCommentMutation.mutate(data);
    }
  };

  if (isLoadingDeck)
    return (
      <div className="space-y-8 animate-fade-in">
        <div className="flex items-center gap-4 mb-6">
          <Skeleton className="h-10 w-10 rounded-full" />
          <Skeleton className="h-6 w-20" />
        </div>
        <Skeleton className="h-12 w-3/4" />
        <Skeleton className="h-80 w-full" />
        <div className="grid md:grid-cols-3 gap-6">
          <Skeleton className="h-40 md:col-span-2" />
          <Skeleton className="h-40" />
        </div>
      </div>
    );

  if (deckError || !deck) {
    console.error("Deck error or no deck:", { deckError, deck });
    return (
      <div className="text-center py-10 animate-fade-in">
        <p className="text-destructive mb-4">
          Error loading deck or deck not found.
        </p>
        <p className="text-sm text-muted-foreground mb-4">
          Debug info: Slug/ID = "{slug}", Error ={" "}
          {deckError?.message || "No deck data"}
        </p>
        <Link href="/" className="underline">
          Go home
        </Link>
      </div>
    );
  }

  // Extract author information using the helper function
  const { authorName, authorUsername } = getAuthorInfo(deck);
  const createdAt = deck.created_at || deck.createdAt;
  const thumbnailUrl = deck.thumbnail_url || deck.thumbnailUrl;
  const snippets = deck.snippets || [];

  // Handle tags from API response
  const deckTags = deck.tags || [];
  const maxTagsToShow = 8; // Show more tags on detail page

  // Debug logging
  console.log("Full deck object:", deck);
  console.log("Ratings data:", ratings);
  console.log("Author info:", { authorName, authorUsername });
  console.log("Deck tags:", deckTags);

  // For edit authorization, grab the author’s ID (from slug or detail) and compare
  const authorId = deck.author?.id ?? deck.userId;
  console.log("DEBUG authorId:", authorId, "currentUserId:", user?.id);
  const isAuthor = Boolean(
    user && // must be logged in
      authorId && // we actually found an author ID
      user.id === authorId,
  );

  // Current vote helpers - matching your working example
  // not authenticated → treat as no vote and block click-through
  const myVote = user ? (ratings?.myVote ?? 0) : 0;
  const onUp = () => user && toggleVoteMutation.mutate(myVote === 1 ? 0 : 1);
  const onDown = () =>
    user && toggleVoteMutation.mutate(myVote === -1 ? 0 : -1);
  const btnDisabled = !user || toggleVoteMutation.isPending;

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
      {/* Back button */}
      <div>
        <AnimatedButton
          variant="ghost"
          size="sm"
          onClick={() => router.push("/")}
          className="mb-4 hover:bg-primary/10"
          animation="scale"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to decks
        </AnimatedButton>
      </div>

      <header className="space-y-4">
        <h1 className="text-4xl font-bold tracking-tight gradient-text">
          {deck.title || "Untitled Deck"}
        </h1>
        <div className="flex items-center space-x-4 text-muted-foreground text-sm">
          <div className="flex items-center">
            <UserIcon className="h-4 w-4 mr-1" />
            {authorUsername && authorUsername !== "Unknown Author" ? (
              <Link
                href={`/profile/${authorUsername}`}
                className="hover:text-primary transition-colors hover:underline font-medium"
              >
                {authorName}
              </Link>
            ) : (
              <span>{authorName}</span>
            )}
          </div>
          <div className="flex items-center">
            <CalendarDays className="h-4 w-4 mr-1" />
            <span>{formatDateYMD(createdAt)}</span>
          </div>
          {user && isAuthor && (
            <Link href={`/decks/${deck.slug || slug}/edit`} passHref>
              <AnimatedButton variant="outline" size="sm" animation="scale">
                <Edit className="h-4 w-4 mr-2" /> Edit Deck
              </AnimatedButton>
            </Link>
          )}
        </div>
        {deck.description && (
          <p className="text-lg text-muted-foreground">{deck.description}</p>
        )}

        {/* Tags section - improved layout */}
        {deckTags.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-2">
            {deckTags.slice(0, maxTagsToShow).map((tag: any, index: number) => (
              <Badge
                key={tag.id || tag.name || index}
                variant="secondary"
                className="hover-scale transition-all duration-200 hover:bg-primary/20"
              >
                {tag.name || tag}
              </Badge>
            ))}
            {deckTags.length > maxTagsToShow && (
              <Badge variant="outline" className="hover-scale">
                +{deckTags.length - maxTagsToShow} more
              </Badge>
            )}
          </div>
        )}
      </header>

      {thumbnailUrl && (
        <ThumbnailDisplay thumbnailUrl={thumbnailUrl} title={deck.title} />
      )}

      <section className="space-y-6">
        <h2 className="text-2xl font-semibold">
          Snippets ({snippets?.length || 0})
        </h2>
        {snippets && Array.isArray(snippets) && snippets.length > 0 ? (
          snippets.map((snippet: any, index: number) => (
            <CodeSnippetDisplay
              key={index}
              snippet={snippet}
              onCopy={handleCopyCode}
            />
          ))
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground">
              No snippets available for this deck.
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              Debug: snippets = {JSON.stringify(snippets)}
            </p>
          </div>
        )}
      </section>

      <section className="flex items-center space-x-4 py-4 border-t border-b">
        <AnimatedButton
          variant={myVote === 1 ? "default" : "ghost"}
          size="lg"
          onClick={onUp}
          disabled={btnDisabled}
          className={
            myVote === 1 ? "bg-green-600 hover:bg-green-700 text-white" : ""
          }
          animation="bounce"
        >
          <ThumbsUp
            className={`h-5 w-5 mr-2 ${myVote === 1 ? "text-white" : ""}`}
          />
          {ratings?.upvotes ?? deck.likes ?? 0}
        </AnimatedButton>
        <AnimatedButton
          variant={myVote === -1 ? "destructive" : "ghost"}
          size="lg"
          onClick={onDown}
          disabled={btnDisabled}
          animation="bounce"
        >
          <ThumbsDown className={`h-5 w-5 mr-2`} />
          {ratings?.downvotes ?? deck.dislikes ?? 0}
        </AnimatedButton>
        {!user && (
          <p className="text-sm text-muted-foreground">
            <AlertTriangle className="inline h-4 w-4 mr-1" />
            Login to vote.
          </p>
        )}
        {toggleVoteMutation.isPending && (
          <p className="text-sm text-muted-foreground">Updating vote...</p>
        )}
      </section>

      <section className="space-y-6">
        <h2 className="text-2xl font-semibold">
          Comments (
          {commentsData?.paging?.total ||
            commentsData?.total ||
            commentsData?.data?.length ||
            0}
          )
        </h2>
        {user ? (
          <Form {...commentForm}>
            <form
              onSubmit={commentForm.handleSubmit(onCommentSubmit)}
              className="space-y-2"
            >
              <FormField
                control={commentForm.control}
                name="body"
                render={({ field }) => (
                  <FormItem>
                    <Textarea
                      placeholder="Add a comment..."
                      {...field}
                      rows={3}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
              <AnimatedButton
                type="submit"
                disabled={addCommentMutation.isPending}
                animation="glow"
              >
                {addCommentMutation.isPending ? "Posting..." : "Post Comment"}
              </AnimatedButton>
            </form>
          </Form>
        ) : (
          <p className="text-sm text-muted-foreground">
            <Link href="/login" className="underline">
              Login
            </Link>{" "}
            to post a comment.
          </p>
        )}
        <div className="space-y-4">
          {/* Show skeletons while loading */}
          {isLoadingComments &&
            Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}

          {/* Normalize commentsData into an array */}
          {(() => {
            const commentList: any[] = commentsData?.data ?? commentsData ?? [];
            return commentList.map((comment, idx) => {
              const canDelete = user?.username === comment.username;
              return (
                <CommentDisplay
                  key={comment.id ?? idx}
                  comment={comment}
                  canDelete={canDelete}
                  onDelete={() => deleteCommentMutation.mutate(comment.id)}
                />
              );
            });
          })()}

          {/* Empty state if no comments */}
          {!(commentsData?.data ?? commentsData ?? []).length &&
            !isLoadingComments && <p>No comments yet.</p>}
        </div>
      </section>
    </div>
  );
}
