import { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, SlidersHorizontal } from "lucide-react";
import clsx from "clsx";

const demoTags = ["javascript", "react", "css", "mysql", "python", "go"];

export function SearchBar({ onChange }) {
  const [text, setText] = useState("");
  const [tags, setTags] = useState([]);
  const barRef = useRef(null);

  // shrink into navbar on scroll
  useEffect(() => {
    const handler = () =>
      barRef.current?.classList.toggle("sticky", window.scrollY > 120);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const toggleTag = (t) => {
    setTags((cur) => {
      const next = cur.includes(t) ? cur.filter((x) => x !== t) : [...cur, t];
      onChange({ q: text, tag: next[0] }); // simple demo behaviour
      return next;
    });
  };

  return (
    <div
      ref={barRef}
      className={clsx(
        "bg-rosePine-base mb-6 transition-all",
        "sticky top-0 z-30 py-4 space-y-4",
      )}
    >
      <div className="flex gap-2">
        <Input
          placeholder="Search decks…"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && onChange({ q: text })}
        />
        <Button size="icon" onClick={() => onChange({ q: text })}>
          <Search size={18} />
        </Button>
        <Button variant="secondary" size="icon">
          <SlidersHorizontal size={18} />
        </Button>
      </div>

      {/* second row (hide when sticky) */}
      <div className="search-tags flex gap-2 overflow-x-auto">
        {demoTags
          .sort(() => 0.5 - Math.random())
          .slice(0, 6)
          .map((t) => (
            <Badge
              key={t}
              onClick={() => toggleTag(t)}
              variant={tags.includes(t) ? "default" : "outline"}
              className="cursor-pointer select-none"
            >
              {t}
            </Badge>
          ))}
      </div>
    </div>
  );
}
