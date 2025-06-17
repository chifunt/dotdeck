import { useParams } from "react-router-dom";
import { CreateDeckPage } from "./create-deck-page";
import { useDeck } from "../features/decks/use-decks";
import { useUpdateDeck } from "../features/decks/mutations";

export function EditDeckPage() {
  const { slug } = useParams();
  const { data, isLoading } = useDeck(slug);
  const updateMut = useUpdateDeck(data?.id);

  if (isLoading) return null; // or spinner

  // Re-use the create form, injecting defaults + different submit handler
  return (
    <CreateDeckPage
      initialValues={data}
      submitLabel="Save changes"
      onSubmit={(vals) => updateMut.mutate(vals)}
    />
  );
}
