/**
 * @file Landing / browse page.  Shows search-bar + paginated deck grid.
 */

import { useState } from "react";

import { useDecks } from "@/features/decks/use-decks";
import { Navbar } from "@/layouts/navbar";
import { SearchBar } from "@/components/search-bar";
import { DeckCard } from "@/components/deck-card";

export function HomePage() {
  const [filters, setFilters] = useState({ limit: 20, offset: 0 });
  const { data, isLoading } = useDecks(filters);

  return (
    <>
      <Navbar />
      <div className="container mx-auto px-4">
        <SearchBar onChange={setFilters} />

        {isLoading ? (
          <p className="py-12 text-center">Loading…</p>
        ) : (
          <div className="grid gap-6 py-6 sm:grid-cols-2 lg:grid-cols-3">
            {data?.data.map((d) => (
              <DeckCard key={d.id} deck={d} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
