"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

interface User {
  id: string
  name: string
  email: string
}

interface Session {
  user: User
}

interface AuthContextType {
  session: Session | null
  status: "loading" | "authenticated" | "unauthenticated"
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  status: "loading",
})

export function useSession() {
  return useContext(AuthContext)
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [status, setStatus] = useState<"loading" | "authenticated" | "unauthenticated">("loading")

  useEffect(() => {
    // Check for existing session
    const checkSession = async () => {
      try {
        const response = await fetch("/api/auth/session")
        if (response.ok) {
          const sessionData = await response.json()
          if (sessionData.user) {
            setSession(sessionData)
            setStatus("authenticated")
          } else {
            setStatus("unauthenticated")
          }
        } else {
          setStatus("unauthenticated")
        }
      } catch (error) {
        setStatus("unauthenticated")
      }
    }

    checkSession()
  }, [])

  return <AuthContext.Provider value={{ session, status }}>{children}</AuthContext.Provider>
}
