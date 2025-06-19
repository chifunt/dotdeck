// Based on your updated OpenAPI spec
export interface User {
  id: number
  username: string
  email: string
  role?: "user" | "moderator" | "admin"
}

export interface Tag {
  id: number
  name: string
  tagType?: number | null
  isOfficial: boolean
}

export interface CodeSnippet {
  id: number
  language?: string | null
  caption?: string | null
  code: string
  sortOrder: number
}

export interface DeckSummary {
  id: number
  title: string
  slug: string
  description?: string
  thumbnailUrl?: string
  createdAt: string
  author: User
  tags?: Tag[] // Now included in DeckSummary
  likes?: number
  dislikes?: number
  snippets: CodeSnippet[]
}

export interface DeckDetail extends DeckSummary {
  // DeckDetail extends DeckSummary and includes tags
  tags: Tag[] // Required in DeckDetail
}

export interface DeckCreatePayload {
  title: string
  description?: string
  thumbnailUrl?: string
  tags?: string[]
  snippets: {
    language?: string
    caption?: string
    code: string
  }[]
}

export interface Comment {
  id: number
  body: string
  username: string
  createdAt: string
  deckId?: number
}

export interface RatingTotals {
  upvotes: number
  downvotes: number
  myVote?: number // 0 = no vote, 1 = upvote, -1 = downvote
}

export interface Paging<T> {
  data: T[]
  paging: {
    limit: number
    offset: number
    total: number
  }
}

export interface AuthResponse {
  token: string
  user: User
}
