import { supabase, type Deal, type Project, type Inserts, type Updates } from '@cloudreno/lib'

// Deal management functions
export async function getDeals(organizationId: string) {
  const { data, error } = await supabase
    .from('deals')
    .select('*')
    .eq('organization_id', organizationId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

export async function createDeal(deal: Inserts<'deals'>) {
  const { data, error } = await supabase
    .from('deals')
    .insert([deal])
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateDeal(id: string, updates: Updates<'deals'>) {
  const { data, error } = await supabase
    .from('deals')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateDealStage(id: string, stage: string) {
  return updateDeal(id, { 
    stage, 
    updated_at: new Date().toISOString() 
  })
}

// Project management functions
export async function getProjects(organizationId: string) {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('organization_id', organizationId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

export async function getProject(id: string) {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}

export async function createProject(project: Inserts<'projects'>) {
  const { data, error } = await supabase
    .from('projects')
    .insert([project])
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateProject(id: string, updates: Updates<'projects'>) {
  const { data, error } = await supabase
    .from('projects')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

// Organization management functions
export async function getOrganizations() {
  const { data, error } = await supabase
    .from('organizations')
    .select('*')
    .order('name')

  if (error) throw error
  return data
}

export async function getLocations(organizationId: string) {
  const { data, error } = await supabase
    .from('locations')
    .select('*')
    .eq('organization_id', organizationId)
    .eq('is_active', true)
    .order('name')

  if (error) throw error
  return data
}

// Real-time subscriptions
export function subscribeToDeals(organizationId: string, callback: (payload: any) => void) {
  return supabase
    .channel('deals_changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'deals',
        filter: `organization_id=eq.${organizationId}`
      },
      callback
    )
    .subscribe()
}

export function subscribeToProjects(organizationId: string, callback: (payload: any) => void) {
  return supabase
    .channel('projects_changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'projects',
        filter: `organization_id=eq.${organizationId}`
      },
      callback
    )
    .subscribe()
}