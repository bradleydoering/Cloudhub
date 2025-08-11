import { supabase } from './supabase'
import type { User } from '@supabase/supabase-js'

export interface UserProfile {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  role: 'staff' | 'customer'
  organization_id: string | null
  location_id: string | null
  created_at: string
  updated_at: string
}

// Authentication functions
export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) throw error
  return data
}

export async function signUp(email: string, password: string, userData?: Partial<UserProfile>) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: userData
    }
  })

  if (error) throw error
  return data
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export async function getCurrentUser(): Promise<User | null> {
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error) throw error
  return user
}

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null // No rows found
    throw error
  }
  return data
}

export async function updateUserProfile(userId: string, updates: Partial<UserProfile>) {
  const { data, error } = await supabase
    .from('user_profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single()

  if (error) throw error
  return data
}

// Password reset
export async function resetPassword(email: string) {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`
  })

  if (error) throw error
}

export async function updatePassword(newPassword: string) {
  const { error } = await supabase.auth.updateUser({
    password: newPassword
  })

  if (error) throw error
}

// Role-based access helpers
export async function requireStaffRole(user: User): Promise<UserProfile> {
  const profile = await getUserProfile(user.id)
  if (!profile || profile.role !== 'staff') {
    throw new Error('Staff access required')
  }
  return profile
}

export async function requireCustomerRole(user: User): Promise<UserProfile> {
  const profile = await getUserProfile(user.id)
  if (!profile || profile.role !== 'customer') {
    throw new Error('Customer access required')
  }
  return profile
}

// Organization access helpers
export async function getUserOrganization(userId: string) {
  const { data, error } = await supabase
    .from('user_profiles')
    .select(`
      organization_id,
      organization:organizations(*)
    `)
    .eq('id', userId)
    .single()

  if (error) throw error
  return data.organization
}

export async function getUserLocations(userId: string) {
  const profile = await getUserProfile(userId)
  if (!profile?.organization_id) return []

  const { data, error } = await supabase
    .from('locations')
    .select('*')
    .eq('organization_id', profile.organization_id)
    .eq('is_active', true)
    .order('name')

  if (error) throw error
  return data
}

// Session management
export function onAuthStateChange(callback: (event: string, session: any) => void) {
  return supabase.auth.onAuthStateChange(callback)
}

export async function getSession() {
  const { data: { session }, error } = await supabase.auth.getSession()
  if (error) throw error
  return session
}