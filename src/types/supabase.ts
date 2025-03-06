export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          updated_at: string | null
          name: string | null
          email: string | null
          phone: string | null
          role: string | null
        }
        Insert: {
          id: string
          updated_at?: string | null
          name?: string | null
          email?: string | null
          phone?: string | null
          role?: string | null
        }
        Update: {
          id?: string
          updated_at?: string | null
          name?: string | null
          email?: string | null
          phone?: string | null
          role?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      advertisers: {
        Row: {
          id: string
          user_id: string
          company_name: string
          company_address: string
          gstin: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          company_name: string
          company_address: string
          gstin?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          company_name?: string
          company_address?: string
          gstin?: string | null
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "advertisers_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      drivers: {
        Row: {
          id: string
          user_id: string
          vehicle_type: string
          vehicle_number: string
          license_number: string
          is_verified: boolean | null
          earnings: number | null
          created_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          vehicle_type: string
          vehicle_number: string
          license_number: string
          is_verified?: boolean | null
          earnings?: number | null
          created_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          vehicle_type?: string
          vehicle_number?: string
          license_number?: string
          is_verified?: boolean | null
          earnings?: number | null
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "drivers_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}