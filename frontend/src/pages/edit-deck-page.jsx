/**
 * @file Thin wrapper: fetches deck by slug, then re-uses
 * <CreateDeckPage/> as an “edit” form.
 */

import { useParams } from "react-router-dom";

import { CreateDeckPage } from "@/pages/create-deck-page";
import { useDeck } from "@/features/decks/use-decks";
import { useUpdateDeck } from "@/features/decks/mutations";

export function EditDeckPage() {
  const { slug } = useParams();
  const { data: deck, isLoading } = useDeck(slug);
  const updateMut = useUpdateDeck(deck?.id);

  if (isLoading) return null; // could be replaced with a spinner

  return (
    <CreateDeckPage
      initialValues={deck}
      submitLabel="Save changes"
      onSubmit={(vals) => updateMut.mutate(vals)}
    />
  );
}
