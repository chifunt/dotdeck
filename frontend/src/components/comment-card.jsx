import { Trash } from "lucide-react";
import { useAuth } from "../hooks/use-auth";
import { Button } from "@/components/ui/button";
import dayjs from "dayjs";

export function CommentCard({ comment, onDelete }) {
  const { user } = useAuth();
  return (
    <div className="border rounded-md p-3 space-y-1">
      <div className="flex justify-between text-xs text-rosePine-muted">
        <span>@{comment.username}</span>
        <span>{dayjs(comment.createdAt).format("YYYY-MM-DD HH:mm")}</span>
      </div>
      <p className="whitespace-pre-wrap text-sm">{comment.body}</p>
      {user?.username === comment.username && (
        <Button
          size="icon"
          variant="ghost"
          className="ml-auto"
          onClick={onDelete}
        >
          <Trash size={16} />
        </Button>
      )}
    </div>
  );
}
