import { useParams, Link, useNavigate } from "react-router-dom";
import { useDeck } from "../features/decks/use-decks";
import { useVoteDeck, useDeleteDeck } from "../features/decks/mutations";
import {
  useComments,
  useCreateComment,
  useDeleteComment,
} from "../features/comments/use-comments";
import { useAuth } from "../hooks/use-auth";
import { Navbar } from "../layouts/navbar";
import { CodeBlock } from "../components/code-block";
import { CommentCard } from "../components/comment-card";
import { CommentForm } from "../components/comment-form";
import { Button } from "@/components/ui/button";
import { ThumbsUp, ThumbsDown, Edit, Trash } from "lucide-react";

export function DeckDetailPage() {
  const { slug } = useParams();
  const nav = useNavigate();
  const { user } = useAuth();
  const { data: deck, isLoading } = useDeck(slug);
  const { data: comments } = useComments(deck?.id);
  const voteMut = useVoteDeck(deck?.id);
  const createComm = useCreateComment(deck?.id);
  const delDeck = useDeleteDeck(deck?.id);
  const delComment = useDeleteComment(deck?.id);

  if (isLoading) return <p className="py-12 text-center">Loading…</p>;
  if (!deck) return <p className="py-12 text-center">Not found</p>;

  const owner = user?.id === deck.user?.id || user?.id === deck.userId;

  /* -------------------------------------------------------------------- */
  /* normalise optional arrays so we can map() safely                      */
  /* -------------------------------------------------------------------- */
  const tags = Array.isArray(deck.tags) ? deck.tags : [];
  const snippets = Array.isArray(deck.snippets) ? deck.snippets : [];

  return (
    <>
      <Navbar />
      <div className="container mx-auto max-w-3xl py-8 space-y-6 px-4">
        <img
          src={deck.thumbnailUrl}
          alt=""
          className="w-full max-h-60 object-contain rounded"
        />

        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">{deck.title}</h1>
          <div className="flex gap-1 text-sm items-center">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => voteMut.mutate(1)}
            >
              <ThumbsUp size={18} />
            </Button>
            {deck.upvotes}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => voteMut.mutate(-1)}
            >
              <ThumbsDown size={18} />
            </Button>
            {deck.downvotes}
          </div>
        </div>

        <p className="text-rosePine-subtle">{deck.description}</p>

        {!!tags.length && (
          <div className="flex gap-2 flex-wrap">
            {tags.map((t) => (
              <Link
                key={t}
                to={`/?tag=${t}`}
                className="text-xs bg-rosePine-overlay/50 px-2 py-1 rounded"
              >
                {t}
              </Link>
            ))}
          </div>
        )}

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
                delDeck.mutate(undefined, { onSuccess: () => nav("/") })
              }
            >
              <Trash size={14} /> Delete
            </Button>
          </div>
        )}

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
              onSubmit={(b) => createComm.mutate(b)}
              isLoading={createComm.isLoading}
            />
          ) : (
            <p className="text-sm">
              <Link className="underline" to="/login">
                Login
              </Link>{" "}
              to join the discussion.
            </p>
          )}
          {comments?.data.map((c) => (
            <CommentCard
              key={c.id}
              comment={c}
              onDelete={() => delComment.mutate(c.id)}
            />
          ))}
        </section>
      </div>
    </>
  );
}
