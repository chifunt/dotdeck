import { Badge } from "@/components/ui/badge"; // shadcn
import { ThumbsUp, ThumbsDown } from "lucide-react"; // npm i lucide-react
import { Link } from "react-router-dom";
import clsx from "clsx";

export function DeckCard({ deck }) {
  return (
    <Link
      to={`/decks/${deck.slug}`}
      className="block rounded-lg shadow hover:shadow-lg transition"
    >
      <img
        src={deck.thumbnailUrl || "/placeholder.webp"}
        alt={deck.title}
        className="h-40 w-full object-cover"
      />
      <div className="p-4 space-y-2">
        <h3 className="font-semibold truncate">{deck.title}</h3>
        <p className="text-sm text-rosePine-subtle line-clamp-2">
          {deck.description}
        </p>
        <div className="flex flex-wrap gap-1">
          {deck.tags?.slice(0, 3).map((t) => (
            <Badge key={t}>{t}</Badge>
          ))}
        </div>
        <div className="flex justify-between text-xs text-rosePine-muted pt-1">
          <span>by {deck.username}</span>
          <span className="flex items-center gap-2">
            <ThumbsUp size={14} /> {deck.upvotes} ‧
            <ThumbsDown size={14} /> {deck.downvotes}
          </span>
        </div>
      </div>
    </Link>
  );
}
