/**
 * @file Compact “deck” summary card used in grid listings.
 */

import { Link } from "react-router-dom";
import { ThumbsUp, ThumbsDown } from "lucide-react";

import { Badge } from "@/components/ui/badge";

/**
 * @typedef {import("@/features/decks/use-decks").DeckSummary} DeckSummary
 *
 * @param {{ deck: DeckSummary }} props
 */
export function DeckCard({ deck }) {
  return (
    <Link
      to={`/decks/${deck.slug}`}
      className="block rounded-lg shadow transition hover:shadow-lg"
    >
      <img
        src={deck.thumbnailUrl || "/placeholder.webp"}
        alt={deck.title}
        className="h-40 w-full object-cover"
      />

      <div className="space-y-2 p-4">
        <h3 className="truncate font-semibold">{deck.title}</h3>

        <p className="line-clamp-2 text-sm text-rosePine-subtle">
          {deck.description}
        </p>

        <div className="flex flex-wrap gap-1">
          {(deck.tags || []).slice(0, 3).map((t) => (
            <Badge key={t}>{t}</Badge>
          ))}
        </div>

        <div className="pt-1 text-xs text-rosePine-muted">
          <div className="flex justify-between">
            <span>by {deck.username}</span>

            <span className="flex items-center gap-2">
              <ThumbsUp size={14} /> {deck.upvotes} ‧
              <ThumbsDown size={14} /> {deck.downvotes}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
