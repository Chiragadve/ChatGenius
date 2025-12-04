"use client"

import type { FormEvent } from "react"
import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabaseClient"

export default function RegisterPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState("")

  const handleRegister = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError("")
    setMessage("")
    setIsSubmitting(true)

    if (password !== confirmPassword) {
      setIsSubmitting(false)
      setError("Passwords do not match.")
      return
    }

    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password
    })

    setIsSubmitting(false)

    if (signUpError) {
      setError(signUpError.message)
      return
    }

    setMessage("Check your email to confirm your account, then sign in.")
    router.replace("/login")
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md rounded-xl bg-card border border-border p-8 shadow-2xl shadow-black/20">
        <div className="flex flex-col items-center mb-8">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[hsl(174,72%,45%)] to-[hsl(186,72%,55%)] flex items-center justify-center text-primary-foreground font-bold text-lg shadow-lg mb-4">
            C
          </div>
          <h1 className="text-2xl font-bold text-foreground">Create account</h1>
          <p className="mt-2 text-sm text-muted-foreground text-center">
            Get started with your free account today
          </p>
        </div>

        <form className="space-y-4" onSubmit={handleRegister}>
          <label className="block space-y-1.5">
            <span className="text-sm font-medium text-foreground">Email</span>
            <input
              required
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-border bg-input/50 px-3 py-2 text-foreground shadow-sm outline-none placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-200"
              placeholder="you@example.com"
            />
          </label>

          <label className="block space-y-1.5">
            <span className="text-sm font-medium text-foreground">Password</span>
            <input
              required
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-border bg-input/50 px-3 py-2 text-foreground shadow-sm outline-none placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-200"
              placeholder="Create a password"
            />
          </label>

          <label className="block space-y-1.5">
            <span className="text-sm font-medium text-foreground">
              Confirm password
            </span>
            <input
              required
              type="password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full rounded-lg border border-border bg-input/50 px-3 py-2 text-foreground shadow-sm outline-none placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-200"
              placeholder="Re-enter password"
            />
          </label>

          {error && (
            <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-sm text-destructive flex items-center gap-2">
              <span className="font-medium">Error:</span> {error}
            </div>
          )}

          {message && (
            <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-sm text-green-600 flex items-center gap-2">
              <span className="font-medium">Success:</span> {message}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-lg bg-gradient-to-r from-[hsl(174,72%,45%)] to-[hsl(186,72%,55%)] px-4 py-2.5 text-primary-foreground font-semibold shadow-lg shadow-primary/20 hover:opacity-90 hover:shadow-primary/30 hover:-translate-y-0.5 active:translate-y-0 active:shadow-none transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting ? "Creating account..." : "Create account"}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-medium text-primary hover:text-primary/80 hover:underline transition-all"
          >
            Sign in
          </Link>
        </p>
      </div>
    </main>
  )
}
