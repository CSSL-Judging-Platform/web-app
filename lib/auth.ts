import { supabase } from "./supabase"
import { mockData } from "./mock-data"

// Hardcoded demo accounts - no database lookup needed
const DEMO_ACCOUNTS = {
  "admin@judgingportal.com": {
    password: "admin123",
    profile: mockData.users.admin,
  },
  "judge@judgingportal.com": {
    password: "judge123",
    profile: mockData.users.judge,
  },
  "contestant@judgingportal.com": {
    password: "contestant123",
    profile: mockData.users.contestant,
  },
}

// Store current user in session storage
const getCurrentUserFromStorage = () => {
  if (typeof window === "undefined") return null
  const stored = sessionStorage.getItem("current_user")
  return stored ? JSON.parse(stored) : null
}

const setCurrentUserInStorage = (user: any) => {
  if (typeof window === "undefined") return
  if (user) {
    sessionStorage.setItem("current_user", JSON.stringify(user))
  } else {
    sessionStorage.removeItem("current_user")
  }
}

export async function getCurrentUser() {
  try {
    // First check session storage for demo user
    const storedUser = getCurrentUserFromStorage()
    if (storedUser) {
      return storedUser
    }

    // Fallback to Supabase auth (for future real users)
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return null
    }

    // Try to get profile from database
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single()

    if (profileError) {
      console.error("Profile error:", profileError)
      return null
    }

    return profile
  } catch (error) {
    console.error("Error in getCurrentUser:", error)
    return null
  }
}

export async function signIn(email: string, password: string) {
  try {
    const cleanEmail = email.trim().toLowerCase()

    // Check demo accounts first
    const demoAccount = DEMO_ACCOUNTS[cleanEmail as keyof typeof DEMO_ACCOUNTS]
    if (demoAccount) {
      if (demoAccount.password === password) {
        // Store demo user in session
        setCurrentUserInStorage(demoAccount.profile)
        return {
          data: {
            user: {
              id: demoAccount.profile.id,
              email: demoAccount.profile.email,
            },
          },
          error: null,
        }
      } else {
        return {
          data: null,
          error: new Error("Invalid email or password"),
        }
      }
    }

    // For non-demo accounts, try Supabase auth
    const { data, error } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password,
    })

    if (error) {
      // Map common Supabase errors to user-friendly messages
      const errorMessages: Record<string, string> = {
        "Database error querying schema": "Invalid email or password",
        "Invalid login credentials": "Invalid email or password",
        "Email not confirmed": "Please confirm your email address",
        "Too many requests": "Too many login attempts. Please try again later",
      }

      const friendlyMessage = errorMessages[error.message] || "Login failed. Please try again."
      return { data: null, error: new Error(friendlyMessage) }
    }

    return { data, error: null }
  } catch (error) {
    console.error("Unexpected sign in error:", error)
    return {
      data: null,
      error: new Error("An unexpected error occurred. Please try again."),
    }
  }
}

export async function signOut() {
  try {
    // Clear demo user from session
    setCurrentUserInStorage(null)

    // Also sign out from Supabase
    const { error } = await supabase.auth.signOut()
    return { error }
  } catch (error) {
    console.error("Sign out error:", error)
    return { error: error as Error }
  }
}

export async function createJudge(email: string, fullName: string) {
  try {
    // Generate a temporary password
    const tempPassword = Math.random().toString(36).slice(-8)

    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password: tempPassword,
      email_confirm: true,
    })

    if (authError) {
      console.error("Auth error:", authError)
      return { error: authError }
    }

    if (!authData.user) {
      return { error: new Error("Failed to create user") }
    }

    // Create profile
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .insert({
        id: authData.user.id,
        email,
        full_name: fullName,
        role: "judge",
      })
      .select()
      .single()

    if (profileError) {
      console.error("Profile error:", profileError)
      return { error: profileError }
    }

    return { data: { profile, tempPassword }, error: null }
  } catch (error) {
    console.error("Unexpected error in createJudge:", error)
    return { error: error instanceof Error ? error : new Error("Unknown error") }
  }
}
