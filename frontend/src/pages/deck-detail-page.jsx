/**
 * @file Full deck view: thumbnail, description, vote toggle,
 * snippets, comment thread, owner actions.
 */

import { Link, useNavigate, useParams } from "react-router-dom";
import { ThumbsUp, ThumbsDown, Edit, Trash } from "lucide-react";

import { useDeck } from "@/features/decks/use-decks";
import { useDeleteDeck } from "@/features/decks/mutations";
import { useRatings, useToggleVote } from "@/features/ratings/use-ratings";
import {
  useComments,
  useCreateComment,
  useDeleteComment,
} from "@/features/comments/use-comments";

import { useAuth } from "@/hooks/use-auth";

import { Navbar } from "@/layouts/navbar";
import { Button } from "@/components/ui/button";
import { CodeBlock } from "@/components/code-block";
import { CommentCard } from "@/components/comment-card";
import { CommentForm } from "@/components/comment-form";

export function DeckDetailPage() {
  const { slug } = useParams();
  const nav = useNavigate();
  const { user } = useAuth();

  /* ── data ───────────────────────────────────────────────────── */
  const { data: deck, isLoading } = useDeck(slug);
  const { data: ratings } = useRatings(deck?.id);
  const toggleVote = useToggleVote(deck?.id);

  const { data: comments } = useComments(deck?.id);
  const createComment = useCreateComment(deck?.id);
  const deleteDeck = useDeleteDeck(deck?.id);
  const deleteComment = useDeleteComment(deck?.id);

  if (isLoading) return <p className="py-12 text-center">Loading…</p>;
  if (!deck) return <p className="py-12 text-center">Not found</p>;

  const owner = user?.id === deck.userId || user?.id === deck.user?.id;
  const tags = Array.isArray(deck.tags) ? deck.tags : [];
  const snippets = Array.isArray(deck.snippets) ? deck.snippets : [];

  /* current vote helpers */
  // not authenticated → treat as no vote and block click-through
  const my = user ? (ratings?.myVote ?? 0) : 0;
  const onUp = () => user && toggleVote.mutate(my === 1 ? 0 : 1);
  const onDown = () => user && toggleVote.mutate(my === -1 ? 0 : -1);
  const btnDisabled = !user;

  /* ── render ─────────────────────────────────────────────────── */
  return (
    <>
      <Navbar />

      <div className="container mx-auto max-w-3xl space-y-6 px-4 py-8">
        {/* Thumbnail */}
        <img
          src={deck.thumbnailUrl}
          alt=""
          className="max-h-60 w-full rounded object-contain"
        />

        {/* Title + votes */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">{deck.title}</h1>

          <div className="flex items-center gap-1 text-sm">
            <Button
              variant={my === 1 ? "default" : "ghost"}
              size="icon"
              aria-label="Up-vote"
              disabled={btnDisabled}
              onClick={onUp}
            >
              <ThumbsUp size={18} />
            </Button>
            {ratings?.upvotes ?? deck.upvotes}

            <Button
              variant={my === -1 ? "destructive" : "ghost"}
              size="icon"
              aria-label="Down-vote"
              disabled={btnDisabled}
              onClick={onDown}
            >
              <ThumbsDown size={18} />
            </Button>
            {ratings?.downvotes ?? deck.downvotes}
          </div>
        </div>

        <p className="text-rosePine-subtle">{deck.description}</p>

        {!!tags.length && (
          <div className="flex flex-wrap gap-2">
            {tags.map((t) => (
              <Link
                key={t}
                to={`/?tag=${t}`}
                className="rounded bg-rosePine-overlay/50 px-2 py-1 text-xs"
              >
                {t}
              </Link>
            ))}
          </div>
        )}

        {/* Owner actions */}
        {owner && (
          <div className="flex gap-2">
            <Link to={`/decks/${deck.slug}/edit`}>
              <Button size="sm">
                <Edit size={14} /> Edit
              </Button>
            </Link>

            <Button
              size="sm"
              variant="destructive"
              onClick={() =>
                deleteDeck.mutate(undefined, { onSuccess: () => nav("/") })
              }
            >
              <Trash size={14} /> Delete
            </Button>
          </div>
        )}

        {/* Snippets */}
        {snippets.map((s, i) => (
          <CodeBlock key={i} snippet={s} />
        ))}

        {/* Comments */}
        <section className="space-y-4">
          <h2 className="font-semibold">
            Comments ({comments?.data.length || 0})
          </h2>

          {user ? (
            <CommentForm
              onSubmit={(b) => createComment.mutate(b)}
              isLoading={createComment.isLoading}
            />
          ) : (
            <p className="text-sm">
              <Link to="/login" className="underline">
                Login
              </Link>{" "}
              to join the discussion.
            </p>
          )}

          {comments?.data.map((c) => (
            <CommentCard
              key={c.id}
              comment={c}
              onDelete={() => deleteComment.mutate(c.id)}
            />
          ))}
        </section>
      </div>
    </>
  );
}
