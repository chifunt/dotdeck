"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/axios-instance";
import type { User, DeckSummary, Paging } from "@/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import Image from "next/image";
import { ThumbsUp, ThumbsDown, UserIcon, Settings } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { getImageUrl } from "@/lib/get-image-url";

interface UserProfileWithDecks {
  user: User;
  decks: Paging<DeckSummary>; // API spec says UserWithDecks has user and DeckArray (which is Paging<DeckSummary>)
}

const fetchUserProfile = async (
  username: string,
): Promise<UserProfileWithDecks> => {
  const { data } = await api.get(`/users/${username}`);

  // 🔧 add the profile owner as author of every deck
  const decksWithAuthor = {
    ...data.decks,
    data: data.decks.data.map((d: any) => ({
      ...d,
      author: { username: data.user.username, ...data.user }, // keeps TS happy
    })),
  };

  return { ...data, decks: decksWithAuthor };
};

function ProfileDeckCard({
  deck,
}: {
  deck: DeckSummary & {
    // extra fields that only appear in the /users/:username response
    thumbnail_url?: string;
    username?: string;
    upvotes?: number;
    downvotes?: number;
  };
}) {
  // ── normalise all API quirks ─────────────────────────────────────────────
  const thumbUrl = deck.thumbnail_url ?? deck.thumbnailUrl;
  const authorName =
    deck.username ?? // field sent by /users/:username
    deck.author?.username ??
    "Unknown Author";

  const likesCount = deck.likes ?? deck.upvotes ?? 0;
  const dislikesCount = deck.dislikes ?? deck.downvotes ?? 0;
  // ─────────────────────────────────────────────────────────────────────────

  return (
    <Card className="flex flex-col h-full">
      <CardHeader>
        {thumbUrl ? (
          <div className="relative aspect-video w-full overflow-hidden rounded-md">
            <Image
              src={getImageUrl(thumbUrl) || "/placeholder.svg"}
              alt={deck.title}
              fill
              className="object-cover"
              crossOrigin="anonymous"
            />
          </div>
        ) : (
          <div className="aspect-video w-full bg-muted flex items-center justify-center rounded-md">
            <Settings className="h-12 w-12 text-muted-foreground" />
          </div>
        )}

        <CardTitle className="mt-4">{deck.title}</CardTitle>
        <CardDescription className="line-clamp-2">
          {deck.description || "No description available."}
        </CardDescription>
      </CardHeader>

      <CardContent className="flex-grow">{/* …tags… */}</CardContent>

      <CardFooter className="flex justify-between items-center text-sm text-muted-foreground border-t pt-4">
        <div className="flex items-center">
          <UserIcon className="h-4 w-4 mr-1" />
          <span>{authorName}</span>
        </div>
      </CardFooter>
    </Card>
  );
}

export default function UserProfilePage() {
  const params = useParams();
  const username = params.username as string;

  const {
    data: profileData,
    isLoading,
    error,
  } = useQuery<UserProfileWithDecks, Error>({
    queryKey: ["userProfile", username],
    queryFn: () => fetchUserProfile(username),
    enabled: !!username,
  });

  if (isLoading)
    return (
      <div className="space-y-8">
        <div className="flex items-center space-x-4">
          <Skeleton className="h-24 w-24 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-6 w-32" />
          </div>
        </div>
        <Skeleton className="h-8 w-1/3 mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, index) => (
            <Card key={index}>
              <CardHeader>
                <Skeleton className="aspect-video w-full rounded-md" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-3/4 mt-2" />
                <Skeleton className="h-4 w-1/2 mt-1" />
              </CardContent>
              <CardFooter className="border-t pt-4">
                <Skeleton className="h-4 w-1/4" />
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    );
  if (error || !profileData)
    return (
      <p className="text-destructive text-center py-10">
        Error loading profile or profile not found.
      </p>
    );

  const { user, decks } = profileData;

  return (
    <div className="space-y-8">
      <header className="flex items-center space-x-6 p-6 bg-card rounded-lg shadow">
        <Avatar className="h-24 w-24 text-4xl">
          <AvatarImage
            src={`https://avatar.vercel.sh/${user.username}.png`}
            alt={user.username}
          />
          <AvatarFallback>
            {user.username.substring(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-3xl font-bold">{user.username}</h1>
          <p className="text-muted-foreground">{user.email}</p>
          {/* Add more profile info if available, e.g., bio, join date */}
        </div>
      </header>

      <section>
        <h2 className="text-2xl font-semibold mb-6">
          {user.username}&apos;s Decks ({decks.paging.total})
        </h2>
        {decks.data.length === 0 ? (
          <p>{user.username} hasn&apos;t created any decks yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {decks.data.map((deck) => (
              <Link
                key={deck.id}
                href={`/decks/${deck.slug}`}
                className="block hover:shadow-lg transition-shadow rounded-lg"
              >
                <ProfileDeckCard deck={deck} />
              </Link>
            ))}
          </div>
        )}
        {/* TODO: Pagination for user's decks */}
      </section>
    </div>
  );
}
