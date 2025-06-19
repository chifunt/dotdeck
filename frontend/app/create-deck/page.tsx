"use client"

import { DeckForm } from "@/components/deck/deck-form"
import { useAuth } from "@/contexts/auth-context"
import { api } from "@/lib/axios-instance"
import type { DeckCreatePayload, DeckDetail as DeckDetailType } from "@/types"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { useState, useEffect } from "react"

export default function CreateDeckPage() {
  const { user, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (!authLoading && !user) {
      toast.error("You must be logged in to create a deck.")
      router.push("/login")
    }
  }, [user, authLoading, router])

  const handleCreateDeck = async (data: DeckCreatePayload) => {
    if (!user) {
      toast.error("Authentication error. Please log in again.")
      router.push("/login")
      return
    }

    setIsSubmitting(true)
    console.log("Creating deck with data:", data)

    try {
      // Step 1: Create the deck
      console.log("Sending POST request to /decks...")
      const createResponse = await api.post("/decks", data)
      console.log("Create response:", createResponse)
      console.log("Create response data:", createResponse.data)

      // Handle different possible response formats
      let newDeckId: number | undefined
      let newDeckSlug: string | undefined

      if (createResponse.data) {
        // Try different possible response structures
        if (typeof createResponse.data === "object") {
          newDeckId = createResponse.data.id || createResponse.data.data?.id
          newDeckSlug = createResponse.data.slug || createResponse.data.data?.slug
        }
      }

      console.log("Extracted:", { id: newDeckId, slug: newDeckSlug })

      if (!newDeckId) {
        console.error("No deck ID found in create response")
        toast.error("Deck creation failed - no ID returned")
        return
      }

      toast.success("Deck created successfully!")

      // If we got a slug directly from creation, use it
      if (newDeckSlug) {
        console.log("Using slug from create response:", newDeckSlug)
        router.push(`/decks/${newDeckSlug}`)
        return
      }

      // Step 2: Fetch the deck by ID to get the slug
      console.log("Fetching deck details by ID:", newDeckId)
      try {
        const detailResponse = await api.get(`/decks/${newDeckId}`)
        console.log("Detail response:", detailResponse)
        console.log("Detail response data:", detailResponse.data)

        let newDeck: DeckDetailType | undefined

        // Handle different possible response structures
        if (detailResponse.data) {
          if (detailResponse.data.data) {
            newDeck = detailResponse.data.data
          } else if (detailResponse.data.id) {
            newDeck = detailResponse.data
          }
        }

        console.log("Extracted deck:", newDeck)

        if (newDeck && newDeck.slug) {
          console.log("Using slug from detail response:", newDeck.slug)
          router.push(`/decks/${newDeck.slug}`)
        } else if (newDeck && newDeck.id) {
          console.log("No slug found, using ID:", newDeck.id)
          router.push(`/decks/${newDeck.id}`)
        } else {
          console.error("No valid deck data found in detail response")
          toast.error("Deck created but couldn't navigate to it. Check your profile.")
          router.push(`/profile/${user.username}`)
        }
      } catch (fetchError: any) {
        console.error("Failed to fetch new deck details by ID:", fetchError)
        console.error("Fetch error response:", fetchError.response?.data)
        toast.error("Deck created but couldn't load details. Check your profile.")
        router.push(`/profile/${user.username}`)
      }
    } catch (error: any) {
      console.error("Create deck error:", error)
      console.error("Error response:", error.response?.data)
      toast.error(error.response?.data?.message || "Failed to create deck.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (authLoading || !user) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <p>Loading or redirecting...</p>
      </div>
    )
  }

  return (
    <div className="py-8">
      <DeckForm onSubmitForm={handleCreateDeck} isSubmitting={isSubmitting} />
    </div>
  )
}
