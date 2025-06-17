/**
 * @file Presentational component that renders a syntax-highlight-ready
 * `<pre>` block with a “copy to clipboard” FAB.
 */

import { Copy } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

/**
 * @typedef {Object} Snippet
 * @property {string} code     – The raw source code.
 * @property {string} [caption]– Optional user-supplied caption.
 *
 * @param {{ snippet: Snippet }} props
 */
export function CodeBlock({ snippet }) {
  /**
   * Copy the snippet’s code to the system clipboard and show a toast.
   * Uses the async Clipboard API (supported in all modern browsers).
   */
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(snippet.code);
      toast.success("Copied!");
    } catch {
      toast.error("Clipboard unavailable");
    }
  };

  return (
    <div className="relative my-4">
      <pre className="rounded-md bg-rosePine-highlight p-4 overflow-x-auto text-sm">
        <code>{snippet.code}</code>
      </pre>

      <Button
        aria-label="Copy to clipboard"
        size="icon"
        variant="secondary"
        onClick={handleCopy}
        className="absolute top-2 right-2"
      >
        <Copy size={16} />
      </Button>

      {snippet.caption && (
        <p className="mt-1 text-xs text-rosePine-muted">{snippet.caption}</p>
      )}
    </div>
  );
}
