"use client";

import { DeckForm } from "@/components/deck/deck-form";
import { useAuth } from "@/contexts/auth-context";
import { api } from "@/lib/axios-instance";
import type { DeckCreatePayload, DeckDetail } from "@/types";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { AnimatedButton } from "@/components/ui/animated-button";

const fetchDeckBySlug = async (slugOrId: string): Promise<DeckDetail> => {
  console.log("Fetching deck for edit by slug/ID:", slugOrId);

  // Try slug first
  try {
    console.log("Trying slug endpoint:", `/decks/slug/${slugOrId}`);
    const response = await api.get(`/decks/slug/${slugOrId}`);
    console.log("Slug response data:", response.data);

    if (response.data) {
      return response.data;
    }
    throw new Error("No valid deck data in slug response");
  } catch (slugError: any) {
    console.log("Slug lookup failed:", slugError.message);

    // If slug fails and the parameter looks like an ID (numeric), try the ID endpoint
    if (/^\d+$/.test(slugOrId)) {
      console.log("Trying ID endpoint:", `/decks/${slugOrId}`);
      try {
        const response = await api.get(`/decks/${slugOrId}`);
        console.log("ID response data:", response.data);

        if (response.data) {
          return response.data;
        }
        throw new Error("No valid deck data in ID response");
      } catch (idError: any) {
        console.error("ID lookup also failed:", idError);
        throw idError;
      }
    }
    throw slugError;
  }
};

export default function EditDeckPage() {
  const queryClient = useQueryClient();
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const slug = params.slug as string;

  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    data: deckData,
    isLoading: isLoadingDeck,
    error: deckError,
  } = useQuery<DeckDetail, Error>({
    queryKey: ["deck-edit", slug],
    queryFn: () => fetchDeckBySlug(slug),
    enabled: !!slug && !!user, // Only fetch if slug and user are available
  });

  useEffect(() => {
    if (!authLoading && !user) {
      toast.error("You must be logged in to edit a deck.");
      router.push("/login");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (deckData && user && (deckData.author as any)?.id !== user.id) {
      // Assuming author has an id
      toast.error("You are not authorized to edit this deck.");
      router.push(`/decks/${deckData.slug || slug}`);
    }
  }, [deckData, user, router, slug]);

  const handleEditDeck = async (data: DeckCreatePayload) => {
    setIsSubmitting(true);

    // 1️⃣ Pick off fields we definitely want
    const payload: Partial<DeckCreatePayload> = {
      title: data.title,
      // only include description if non-empty
      ...(data.description?.trim() ? { description: data.description } : {}),
    };

    // 2️⃣ Only include thumbnailUrl if it looks like a real URL
    if (data.thumbnailUrl?.trim()) {
      // include any non-empty thumbnailUrl (absolute or relative)
      payload.thumbnailUrl = data.thumbnailUrl.trim();
    }

    // 3️⃣ Convert any tag objects into strings (the API expects string[])
    if (Array.isArray(data.tags) && data.tags.length) {
      payload.tags = data.tags; // string[] → perfect for the API
    }

    // 4️⃣ And for snippets, only send the fields the API knows about
    if (Array.isArray(data.snippets)) {
      payload.snippets = data.snippets.map(({ language, caption, code }) => ({
        // leave out snippet.id and snippet.sortOrder
        language: language?.trim() || undefined,
        caption: caption?.trim() || undefined,
        code,
      }));
    }

    try {
      await api.patch(`/decks/${deckData!.id}`, payload);
      toast.success("Deck updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["deck", slug] });
      router.push(`/decks/${deckData!.slug || slug}`);
    } catch (error: any) {
      console.error("PATCH /decks failed:", error.response?.data);
      toast.error(
        Array.isArray(error.response?.data?.errors)
          ? error.response.data.errors.map((e: any) => e.msg).join(", ")
          : error.response?.data.message || "Failed to update deck.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteDeck = async () => {
    if (!deckData) return;
    if (
      !confirm(
        "Are you sure you want to delete this deck? This cannot be undone.",
      )
    ) {
      return;
    }
    setIsDeleting(true);
    try {
      await api.delete(`/decks/${deckData.id}`);
      toast.success("Deck deleted.");
      // Invalidate any list caches
      queryClient.invalidateQueries({ queryKey: ["decks"] });
      // Redirect home (or wherever you like)
      router.push("/");
    } catch (err: any) {
      console.error("DELETE /decks failed:", err.response?.data);
      toast.error(err.response?.data?.message || "Failed to delete deck.");
    } finally {
      setIsDeleting(false);
    }
  };

  if (authLoading || isLoadingDeck) {
    return (
      <div className="py-8 max-w-3xl mx-auto space-y-6">
        <Skeleton className="h-10 w-1/2" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-40 w-full" />
        <div className="flex justify-end space-x-2">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-24" />
        </div>
      </div>
    );
  }

  if (!user) return null; // Handled by useEffect
  if (deckError || !deckData)
    return (
      <p className="text-destructive text-center py-10">
        Error loading deck data or deck not found.
      </p>
    );
  if ((deckData.author as any)?.id !== user.id)
    return (
      <p className="text-destructive text-center py-10">
        You are not authorized to edit this deck.
      </p>
    );

  return (
    <div className="py-8">
      <div className="flex justify-end mb-6 space-x-2">
        <AnimatedButton
          variant="destructive"
          size="sm"
          onClick={handleDeleteDeck}
          disabled={isDeleting}
          animation="bounce"
        >
          {isDeleting ? "Deleting…" : "Delete Deck"}
        </AnimatedButton>
      </div>
      <DeckForm
        initialData={deckData}
        onSubmitForm={handleEditDeck}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
