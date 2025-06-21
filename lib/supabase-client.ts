import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types for our custom auth system
export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          password: string
          full_name: string
          role: "admin" | "judge" | "contestant"
          is_active: boolean
          last_login: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          password: string
          full_name: string
          role?: "admin" | "judge" | "contestant"
          is_active?: boolean
          last_login?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          password?: string
          full_name?: string
          role?: "admin" | "judge" | "contestant"
          is_active?: boolean
          last_login?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      big_events: {
        Row: {
          id: string
          name: string
          description: string | null
          start_date: string
          end_date: string
          status: "draft" | "active" | "completed" | "cancelled"
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          start_date: string
          end_date: string
          status?: "draft" | "active" | "completed" | "cancelled"
          created_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          start_date?: string
          end_date?: string
          status?: "draft" | "active" | "completed" | "cancelled"
          created_by?: string
          created_at?: string
          updated_at?: string
        }
      }
      small_events: {
        Row: {
          id: string
          big_event_id: string
          name: string
          description: string | null
          start_date: string
          end_date: string
          status: "draft" | "active" | "completed" | "cancelled"
          allow_registration: boolean
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          big_event_id: string
          name: string
          description?: string | null
          start_date: string
          end_date: string
          status?: "draft" | "active" | "completed" | "cancelled"
          allow_registration?: boolean
          created_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          big_event_id?: string
          name?: string
          description?: string | null
          start_date?: string
          end_date?: string
          status?: "draft" | "active" | "completed" | "cancelled"
          allow_registration?: boolean
          created_by?: string
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}
