"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { supabase } from "./supabase"
import React from 'react'

// Auth functions using custom profiles table
export async function getCurrentUser() {
  try {
    // Check session storage first
    if (typeof window !== "undefined") {
      const stored = sessionStorage.getItem("current_user")
      if (stored) {
        return JSON.parse(stored)
      }
    }
    return null
  } catch (error) {
    console.error("Error getting current user:", error)
    return null
  }
}

export async function signIn(email: string, password: string) {
  try {
    const cleanEmail = email.trim().toLowerCase()

    // Query our custom profiles table
    const { data: user, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("email", cleanEmail)
      .eq("password", password)
      .eq("is_active", true)
      .single()

    if (error || !user) {
      return {
        data: null,
        error: new Error("Invalid email or password"),
      }
    }

    // Update last login
    await supabase.from("profiles").update({ last_login: new Date().toISOString() }).eq("id", user.id)

    // Store user in session
    if (typeof window !== "undefined") {
      sessionStorage.setItem("current_user", JSON.stringify(user))
    }

    return {
      data: { user },
      error: null,
    }
  } catch (error) {
    console.error("Sign in error:", error)
    return {
      data: null,
      error: new Error("Login failed. Please try again."),
    }
  }
}

export async function signOut() {
  try {
    // Clear session storage
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("current_user")
    }
    return { error: null }
  } catch (error) {
    console.error("Sign out error:", error)
    return { error: error as Error }
  }
}

// Auth context
interface AuthContextType {
  user: any | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ data: any; error: Error | null }>
  signOut: () => Promise<{ error: Error | null }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check for existing session on mount
    getCurrentUser().then((currentUser) => {
      setUser(currentUser)
      setLoading(false)
    })
  }, [])

  const handleSignIn = async (email: string, password: string) => {
    const result = await signIn(email, password)
    if (result.data?.user) {
      setUser(result.data.user)
    }
    return result
  }

  const handleSignOut = async () => {
    const result = await signOut()
    setUser(null)
    return result
  }

  return React.createElement(
    AuthContext.Provider,
    {
      value:{ user, loading, signIn: handleSignIn, signOut: handleSignOut }
    },
    children
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

// Additional helper functions for user management
export async function createUser(email: string, password: string, fullName: string, role: string) {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .insert({
        email: email.trim().toLowerCase(),
        password,
        full_name: fullName,
        role,
        is_active: true,
      })
      .select()
      .single()

    if (error) {
      return { error }
    }

    return { data, error: null }
  } catch (error) {
    console.error("Error creating user:", error)
    return { error: error instanceof Error ? error : new Error("Unknown error") }
  }
}

export async function updateUserPassword(userId: string, newPassword: string) {
  try {
    const { error } = await supabase.from("profiles").update({ password: newPassword }).eq("id", userId)

    return { error }
  } catch (error) {
    console.error("Error updating password:", error)
    return { error: error instanceof Error ? error : new Error("Unknown error") }
  }
}

export async function getAllUsers() {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("id, email, full_name, role, is_active, last_login, created_at")
      .order("created_at", { ascending: false })

    if (error) {
      return { data: null, error }
    }

    return { data, error: null }
  } catch (error) {
    console.error("Error getting users:", error)
    return { data: null, error: error instanceof Error ? error : new Error("Unknown error") }
  }
}
