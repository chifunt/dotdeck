import { z } from "zod"

export const SignupSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
})
export type SignupFormValues = z.infer<typeof SignupSchema>

export const LoginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"), // Min 1 for presence
})
export type LoginFormValues = z.infer<typeof LoginSchema>

export const SnippetSchema = z.object({
  language: z.string().min(1, "Language is required"),
  caption: z.string().optional(),
  code: z.string().min(1, "Code is required"),
})

export const DeckFormSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(100, "Title too long"),
  description: z.string().max(500, "Description too long").optional(),
  thumbnailUrl: z.string().optional().or(z.literal("")), // Remove URL validation, allow relative paths
  tags: z.array(z.string().min(1)).max(25, "Maximum 25 tags").optional(),
  snippets: z.array(SnippetSchema).min(1, "At least one snippet is required"),
})
export type DeckFormValues = z.infer<typeof DeckFormSchema>

export const CommentSchema = z.object({
  body: z.string().min(1, "Comment cannot be empty").max(1000, "Comment too long"),
})
export type CommentFormValues = z.infer<typeof CommentSchema>
