"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { LoginSchema, type LoginFormValues } from "@/lib/schemas"
import { AnimatedButton } from "@/components/ui/animated-button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { PasswordInput } from "@/components/ui/password-input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { useAuth } from "@/contexts/auth-context"
import { api } from "@/lib/axios-instance"
import type { AuthResponse } from "@/types"
import { toast } from "sonner"
import { useEffect } from "react"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { LogIn } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const { login, user, isLoading: authLoading } = useAuth()

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  useEffect(() => {
    if (!authLoading && user) {
      router.push("/")
    }
  }, [user, authLoading, router])

  const onSubmit = async (data: LoginFormValues) => {
    try {
      const response = await api.post<AuthResponse>("/auth/login", data)
      login(response.data.token, response.data.user)
      toast.success("Logged in successfully!")
      router.push("/")
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || error.response?.data?.errors?.[0]?.msg || "Login failed. Please try again."
      toast.error(errorMessage)
      console.error("Login error:", error.response?.data || error.message)
    }
  }

  if (authLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <LoadingSpinner size="lg" text="Loading..." />
      </div>
    )
  }
  if (user) return null

  return (
    <div className="flex items-center justify-center py-12 animate-fade-in">
      <Card className="w-full max-w-md hover-lift">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 animate-bounce-subtle">
            <LogIn className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-2xl gradient-text">Welcome Back</CardTitle>
          <CardDescription>Enter your credentials to access your account</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="m@example.com"
                        {...field}
                        className="focus-ring hover:border-primary/50 transition-all duration-200"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <PasswordInput
                        placeholder="••••••••"
                        {...field}
                        className="focus-ring hover:border-primary/50 transition-all duration-200"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <AnimatedButton
                type="submit"
                className="w-full"
                loading={form.formState.isSubmitting}
                loadingText="Signing in..."
                animation="glow"
              >
                Sign In
              </AnimatedButton>
            </form>
          </Form>
          <div className="mt-4 text-center text-sm animate-fade-in">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="underline hover:text-primary transition-colors">
              Sign up
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
