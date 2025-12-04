"use client"

import type { User, Session } from "@supabase/supabase-js"
import type { ReactNode } from "react"
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState
} from "react"
import { supabase } from "@/lib/supabaseClient"

type SessionContextValue = {
  user: User | null
  session: Session | null
  userProfile: any | null
  isLoading: boolean
}

const SessionContext = createContext<SessionContextValue | undefined>(
  undefined
)

export function useSession() {
  const context = useContext(SessionContext)
  if (!context) {
    throw new Error("useSession must be used within SessionProvider")
  }
  return context
}

export default function SessionProvider({
  children
}: {
  children: ReactNode
}) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [userProfile, setUserProfile] = useState<any | null>(null)

  const fetchProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .limit(1)
      .maybeSingle()
    if (error) {
      console.error("Error fetching profile", error.message)
      return
    }
    setUserProfile(data)
  }

  useEffect(() => {
    let isMounted = true

    const upsertProfile = async (user: User) => {
      const updates = {
        id: user.id,
        email: user.email,
        full_name: user.user_metadata?.full_name ?? user.user_metadata?.name ?? user.email?.split("@")[0],
        avatar_url: user.user_metadata?.avatar_url,
        updated_at: new Date().toISOString(),
      }
      const { error } = await supabase.from("profiles").upsert(updates)
      if (error) {
        console.error("Profile sync error", error)
      } else {
        // refresh local profile state
        fetchProfile(user.id)
      }
    }

    const syncSession = async () => {
      const {
        data: { session },
        error
      } = await supabase.auth.getSession()

      if (!isMounted) return
      if (error) {
        console.error("Error getting session", error.message)
      }
      setSession(session ?? null)
      setUser(session?.user ?? null)
      setIsLoading(false)

      if (session?.user) {
        upsertProfile(session.user)
      }
    }

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session ?? null)
      setUser(session?.user ?? null)
      setIsLoading(false)

      if (session?.user) {
        upsertProfile(session.user)
      }
    })

    syncSession()

    return () => {
      isMounted = false
      subscription.unsubscribe()
    }
  }, [])

  useEffect(() => {
    if (session?.user?.id) {
      fetchProfile(session.user.id)
    } else {
      setUserProfile(null)
    }
  }, [session])

  const value = useMemo(
    () => ({ user, session, userProfile, isLoading }),
    [user, session, userProfile, isLoading]
  )

  return (
    <SessionContext.Provider value={value}>
      {children}
    </SessionContext.Provider>
  )
}
