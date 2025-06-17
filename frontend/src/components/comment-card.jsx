/**
 * @file Read-only single comment with “delete” affordance for its author.
 */

import dayjs from "dayjs";
import { Trash } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";

/**
 * @typedef {Object} Comment
 * @property {number}  id
 * @property {string}  username   – Author’s handle.
 * @property {string}  body       – Comment markdown/plain-text.
 * @property {string}  createdAt  – ISO-8601 timestamp.
 *
 * @param {{
 *   comment: Comment;
 *   onDelete?: () => void;
 * }} props
 */
export function CommentCard({ comment, onDelete }) {
  const { user } = useAuth();
  const mine = user?.username === comment.username;

  return (
    <div className="space-y-1 rounded-md border p-3">
      <div className="flex justify-between text-xs text-rosePine-muted">
        <span>@{comment.username}</span>
        <span>{dayjs(comment.createdAt).format("YYYY-MM-DD HH:mm")}</span>
      </div>

      <p className="whitespace-pre-wrap text-sm">{comment.body}</p>

      {mine && (
        <Button
          aria-label="Delete comment"
          size="icon"
          variant="ghost"
          onClick={onDelete}
          className="ml-auto"
        >
          <Trash size={16} />
        </Button>
      )}
    </div>
  );
}
