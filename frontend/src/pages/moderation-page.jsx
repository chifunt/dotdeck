/**
 * @file Simple moderator view – enter IDs to soft-delete.
 */

import { useState } from "react";
import { RequireAuth } from "@/features/auth/require-auth";
import { Navbar } from "@/layouts/navbar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  useSoftDeleteDeck,
  useSoftDeleteComment,
} from "@/features/moderation/use-moderation";

export function ModerationPage() {
  const [deckId, setDeckId] = useState("");
  const [commentId, setCommentId] = useState("");

  const delDeck = useSoftDeleteDeck(deckId);
  const delComment = useSoftDeleteComment(commentId);

  return (
    <RequireAuth role="admin">
      {/* treat admins as moderators for now */}
      <Navbar />
      <div className="container mx-auto px-4 py-8 space-y-8">
        <h1 className="text-2xl font-bold">Moderator tools</h1>

        <section className="flex items-end gap-2">
          <div>
            <p className="text-sm mb-1">Soft-delete deck</p>
            <Input
              placeholder="Deck ID"
              value={deckId}
              onChange={(e) => setDeckId(e.target.value)}
              className="w-40"
            />
          </div>
          <Button size="sm" onClick={() => delDeck.mutate()} disabled={!deckId}>
            Delete
          </Button>
        </section>

        <section className="flex items-end gap-2">
          <div>
            <p className="text-sm mb-1">Soft-delete comment</p>
            <Input
              placeholder="Comment ID"
              value={commentId}
              onChange={(e) => setCommentId(e.target.value)}
              className="w-40"
            />
          </div>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => delComment.mutate()}
            disabled={!commentId}
          >
            Delete
          </Button>
        </section>
      </div>
    </RequireAuth>
  );
}
