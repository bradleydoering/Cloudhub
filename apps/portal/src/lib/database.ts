import { supabase, type Project } from '@cloudreno/lib'

// Customer-focused project functions
export async function getCustomerProject(projectId: string) {
  const { data, error } = await supabase
    .from('projects')
    .select(`
      *,
      organization:organizations(*),
      location:locations(*)
    `)
    .eq('id', projectId)
    .single()

  if (error) throw error
  return data
}

// Document management
export async function getProjectDocuments(projectId: string) {
  const { data, error } = await supabase
    .from('documents')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

// Change order management
export async function getProjectChangeOrders(projectId: string) {
  const { data, error } = await supabase
    .from('change_orders')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

export async function approveChangeOrder(changeOrderId: string) {
  const { data, error } = await supabase
    .from('change_orders')
    .update({ 
      status: 'approved',
      approved_date: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq('id', changeOrderId)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function rejectChangeOrder(changeOrderId: string, reason?: string) {
  const { data, error } = await supabase
    .from('change_orders')
    .update({ 
      status: 'rejected',
      rejection_reason: reason,
      updated_at: new Date().toISOString()
    })
    .eq('id', changeOrderId)
    .select()
    .single()

  if (error) throw error
  return data
}

// Photo management
export async function getProjectPhotos(projectId: string) {
  const { data, error } = await supabase
    .from('photos')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

// Invoice management
export async function getProjectInvoices(projectId: string) {
  const { data, error } = await supabase
    .from('invoices')
    .select('*')
    .eq('project_id', projectId)
    .order('due_date', { ascending: true })

  if (error) throw error
  return data
}

// Activity feed
export async function getProjectActivity(projectId: string) {
  const { data, error } = await supabase
    .from('activities')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) throw error
  return data
}

// Real-time subscriptions for customer portal
export function subscribeToProjectUpdates(projectId: string, callback: (payload: any) => void) {
  return supabase
    .channel('project_updates')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'activities',
        filter: `project_id=eq.${projectId}`
      },
      callback
    )
    .subscribe()
}

export function subscribeToChangeOrders(projectId: string, callback: (payload: any) => void) {
  return supabase
    .channel('change_orders')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'change_orders',
        filter: `project_id=eq.${projectId}`
      },
      callback
    )
    .subscribe()
}