import { Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function CodeBlock({ snippet }) {
  const copy = async () => {
    await navigator.clipboard.writeText(snippet.code);
    toast.success("Copied!");
  };

  return (
    <div className="relative my-4">
      <pre className="rounded-md bg-rosePine-highlight p-4 overflow-x-auto text-sm">
        <code>{snippet.code}</code>
      </pre>
      <Button
        size="icon"
        variant="secondary"
        onClick={copy}
        className="absolute top-2 right-2"
      >
        <Copy size={16} />
      </Button>
      {snippet.caption && (
        <p className="text-xs text-rosePine-muted mt-1">{snippet.caption}</p>
      )}
    </div>
  );
}
