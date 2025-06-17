import { useParams } from "react-router-dom";
import { useUser } from "../features/users/use-user";
import { DeckCard } from "../components/deck-card";
import { Navbar } from "../layouts/navbar";

export function ProfilePage() {
  const { username } = useParams();
  const { data, isLoading } = useUser(username);

  if (isLoading) return <p className="py-12 text-center">Loading…</p>;

  return (
    <>
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">@{data.user.username}</h1>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {data.decks.data.map((d) => (
            <DeckCard key={d.id} deck={d} />
          ))}
        </div>
      </div>
    </>
  );
}
