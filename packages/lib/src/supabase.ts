import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'

// Create placeholder client for build time when env vars are not available
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types for TypeScript
export type Database = {
  public: {
    Tables: {
      organizations: {
        Row: {
          id: string
          name: string
          slug: string
          logo_url: string | null
          address: string | null
          phone: string | null
          email: string | null
          website: string | null
          license_number: string | null
          insurance_info: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          logo_url?: string | null
          address?: string | null
          phone?: string | null
          email?: string | null
          website?: string | null
          license_number?: string | null
          insurance_info?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          logo_url?: string | null
          address?: string | null
          phone?: string | null
          email?: string | null
          website?: string | null
          license_number?: string | null
          insurance_info?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      locations: {
        Row: {
          id: string
          organization_id: string
          name: string
          address: string
          city: string
          state: string
          zip_code: string
          phone: string | null
          manager_id: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          name: string
          address: string
          city: string
          state: string
          zip_code: string
          phone?: string | null
          manager_id?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          name?: string
          address?: string
          city?: string
          state?: string
          zip_code?: string
          phone?: string | null
          manager_id?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      deals: {
        Row: {
          id: string
          organization_id: string
          location_id: string | null
          customer_name: string
          customer_email: string | null
          customer_phone: string | null
          customer_address: string | null
          project_type: string
          project_description: string | null
          estimated_value: number | null
          stage: string
          priority: string
          source: string | null
          assigned_to: string | null
          notes: string | null
          follow_up_date: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          location_id?: string | null
          customer_name: string
          customer_email?: string | null
          customer_phone?: string | null
          customer_address?: string | null
          project_type: string
          project_description?: string | null
          estimated_value?: number | null
          stage?: string
          priority?: string
          source?: string | null
          assigned_to?: string | null
          notes?: string | null
          follow_up_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          location_id?: string | null
          customer_name?: string
          customer_email?: string | null
          customer_phone?: string | null
          customer_address?: string | null
          project_type?: string
          project_description?: string | null
          estimated_value?: number | null
          stage?: string
          priority?: string
          source?: string | null
          assigned_to?: string | null
          notes?: string | null
          follow_up_date?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      projects: {
        Row: {
          id: string
          organization_id: string
          location_id: string | null
          deal_id: string | null
          project_number: string
          name: string
          description: string | null
          customer_name: string
          customer_email: string | null
          customer_phone: string | null
          customer_address: string | null
          project_type: string
          status: string
          priority: string
          start_date: string | null
          target_completion_date: string | null
          actual_completion_date: string | null
          contract_value: number | null
          project_manager_id: string | null
          lead_contractor_id: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          location_id?: string | null
          deal_id?: string | null
          project_number: string
          name: string
          description?: string | null
          customer_name: string
          customer_email?: string | null
          customer_phone?: string | null
          customer_address?: string | null
          project_type: string
          status?: string
          priority?: string
          start_date?: string | null
          target_completion_date?: string | null
          actual_completion_date?: string | null
          contract_value?: number | null
          project_manager_id?: string | null
          lead_contractor_id?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          location_id?: string | null
          deal_id?: string | null
          project_number?: string
          name?: string
          description?: string | null
          customer_name?: string
          customer_email?: string | null
          customer_phone?: string | null
          customer_address?: string | null
          project_type?: string
          status?: string
          priority?: string
          start_date?: string | null
          target_completion_date?: string | null
          actual_completion_date?: string | null
          contract_value?: number | null
          project_manager_id?: string | null
          lead_contractor_id?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
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
  }
}

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type Inserts<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type Updates<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']

// Convenience type exports
export type Organization = Tables<'organizations'>
export type Location = Tables<'locations'>
export type Deal = Tables<'deals'>
export type Project = Tables<'projects'>