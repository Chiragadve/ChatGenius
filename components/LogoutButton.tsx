"use client"

import { supabase } from "@/lib/supabaseClient"
import { useRouter } from "next/navigation"

export default function LogoutButton() {
  const router = useRouter()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.replace("/")
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      className="rounded-md px-3 py-2 text-sm font-medium text-red-500 hover:bg-red-500/10 transition-colors"
    >
      Logout
    </button>
  )
}
