/**
 * @file Two-row search widget:
 * • Row 1 – text input + search button + (future) filters button
 * • Row 2 – random sample of “demo” tags, collapses when sticky
 */

import { useEffect, useRef, useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import clsx from "clsx";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

/** Placeholder until the real tag endpoint powers this. */
const DEMO_TAGS = ["javascript", "react", "css", "mysql", "python", "go"];

/**
 * @param {{
 *   onChange: (params: { q?: string; tag?: string }) => void;
 * }} props
 */
export function SearchBar({ onChange }) {
  const [text, setText] = useState("");
  const [activeTags, setActiveTags] = useState(/** @type{string[]} */ ([]));

  /** External sticky class toggled by scroll position. */
  const ref = useRef(/** @type{HTMLDivElement|null} */ (null));

  /*──────────────────────── Sticky collapse logic ────────────────────────*/
  useEffect(() => {
    const onScroll = () =>
      ref.current?.classList.toggle("sticky", window.scrollY > 120);

    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* small helper – fires search only when the query is non-empty */
  const fireSearch = () => {
    const q = text.trim();
    onChange(q ? { q } : {}); // ← no `q` key when empty
  };

  /*──────────────────────── Tag toggle handler ───────────────────────────*/
  const toggleTag = (t) =>
    setActiveTags((prev) => {
      const next = prev.includes(t)
        ? prev.filter((x) => x !== t)
        : [...prev, t];
      // include the query only when it has characters
      const q = text.trim();
      onChange({ tag: next[0], ...(q ? { q } : {}) });
      return next;
    });

  /*──────────────────────── Render ───────────────────────────────────────*/
  return (
    <div
      ref={ref}
      className={clsx(
        "sticky top-0 z-30 space-y-4 bg-rosePine-base py-4 transition-all",
      )}
    >
      {/* Row 1 – input + buttons */}
      <div className="flex gap-2">
        <Input
          placeholder="Search decks…"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && fireSearch()}
        />

        <Button size="icon" onClick={fireSearch}>
          <Search size={18} />
        </Button>

        <Button
          variant="secondary"
          size="icon"
          aria-label="Filter (coming soon)"
        >
          <SlidersHorizontal size={18} />
        </Button>
      </div>

      {/* Row 2 – quick-tag bar (hidden when sticky) */}
      <div className="search-tags flex overflow-x-auto gap-2">
        {DEMO_TAGS.sort(() => 0.5 - Math.random())
          .slice(0, 6)
          .map((t) => (
            <Badge
              key={t}
              onClick={() => toggleTag(t)}
              variant={activeTags.includes(t) ? "default" : "outline"}
              className="select-none cursor-pointer"
            >
              {t}
            </Badge>
          ))}
      </div>
    </div>
  );
}
