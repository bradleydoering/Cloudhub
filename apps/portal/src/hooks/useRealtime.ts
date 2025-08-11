'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@cloudreno/lib'
import { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js'

// Hook for real-time project activity updates
export function useProjectActivity(projectId: string) {
  const [activities, setActivities] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let channel: RealtimeChannel

    async function fetchActivities() {
      try {
        const { data, error } = await supabase
          .from('activities')
          .select('*')
          .eq('project_id', projectId)
          .order('created_at', { ascending: false })
          .limit(50)

        if (error) throw error
        setActivities(data || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch activities')
      } finally {
        setLoading(false)
      }
    }

    // Initial fetch
    fetchActivities()

    // Setup real-time subscription for project activities
    channel = supabase
      .channel(`project_activity_${projectId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'activities',
          filter: `project_id=eq.${projectId}`,
        },
        (payload) => {
          console.log('New project activity:', payload)
          if (payload.new) {
            setActivities(prev => [payload.new, ...prev.slice(0, 49)]) // Keep only latest 50
            
            // Show notification for important updates
            if (payload.new.type === 'milestone' || payload.new.type === 'change_order') {
              if (Notification.permission === 'granted') {
                new Notification('Project Update', {
                  body: payload.new.description,
                  icon: '/favicon.ico',
                  tag: payload.new.id
                })
              }
            }
          }
        }
      )
      .subscribe((status) => {
        console.log('Project activity subscription status:', status)
      })

    return () => {
      channel.unsubscribe()
    }
  }, [projectId])

  return { activities, loading, error }
}

// Hook for real-time change order updates
export function useChangeOrderUpdates(projectId: string) {
  const [changeOrders, setChangeOrders] = useState<any[]>([])
  const [pendingCount, setPendingCount] = useState(0)

  useEffect(() => {
    let channel: RealtimeChannel

    async function fetchChangeOrders() {
      try {
        const { data, error } = await supabase
          .from('change_orders')
          .select('*')
          .eq('project_id', projectId)
          .order('created_at', { ascending: false })

        if (error) throw error
        setChangeOrders(data || [])
        setPendingCount(data?.filter(co => co.status === 'pending').length || 0)
      } catch (err) {
        console.error('Failed to fetch change orders:', err)
      }
    }

    // Initial fetch
    fetchChangeOrders()

    // Setup real-time subscription
    channel = supabase
      .channel(`change_orders_${projectId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'change_orders',
          filter: `project_id=eq.${projectId}`,
        },
        (payload) => {
          console.log('Change order update:', payload)
          
          setChangeOrders(current => {
            switch (payload.eventType) {
              case 'INSERT':
                if (payload.new) {
                  setPendingCount(prev => payload.new.status === 'pending' ? prev + 1 : prev)
                  return [payload.new, ...current]
                }
                break
              case 'UPDATE':
                if (payload.new && payload.old) {
                  // Update pending count if status changed
                  if (payload.old.status === 'pending' && payload.new.status !== 'pending') {
                    setPendingCount(prev => Math.max(0, prev - 1))
                  } else if (payload.old.status !== 'pending' && payload.new.status === 'pending') {
                    setPendingCount(prev => prev + 1)
                  }
                  
                  return current.map(co => 
                    co.id === payload.new.id ? payload.new : co
                  )
                }
                break
              case 'DELETE':
                if (payload.old) {
                  setPendingCount(prev => payload.old.status === 'pending' ? Math.max(0, prev - 1) : prev)
                  return current.filter(co => co.id !== payload.old.id)
                }
                break
            }
            return current
          })
        }
      )
      .subscribe()

    return () => {
      channel.unsubscribe()
    }
  }, [projectId])

  return { changeOrders, pendingCount, setChangeOrders }
}

// Hook for real-time invoice updates
export function useInvoiceUpdates(projectId: string) {
  const [invoices, setInvoices] = useState<any[]>([])
  const [pendingPayments, setPendingPayments] = useState(0)

  useEffect(() => {
    let channel: RealtimeChannel

    async function fetchInvoices() {
      try {
        const { data, error } = await supabase
          .from('invoices')
          .select('*')
          .eq('project_id', projectId)
          .order('due_date', { ascending: true })

        if (error) throw error
        setInvoices(data || [])
        setPendingPayments(data?.filter(inv => inv.status === 'pending').length || 0)
      } catch (err) {
        console.error('Failed to fetch invoices:', err)
      }
    }

    // Initial fetch
    fetchInvoices()

    // Setup real-time subscription
    channel = supabase
      .channel(`invoices_${projectId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'invoices',
          filter: `project_id=eq.${projectId}`,
        },
        (payload) => {
          console.log('Invoice update:', payload)
          
          setInvoices(current => {
            switch (payload.eventType) {
              case 'INSERT':
                if (payload.new) {
                  setPendingPayments(prev => payload.new.status === 'pending' ? prev + 1 : prev)
                  return [...current, payload.new].sort((a, b) => 
                    new Date(a.due_date).getTime() - new Date(b.due_date).getTime()
                  )
                }
                break
              case 'UPDATE':
                if (payload.new && payload.old) {
                  // Update pending count if status changed
                  if (payload.old.status === 'pending' && payload.new.status !== 'pending') {
                    setPendingPayments(prev => Math.max(0, prev - 1))
                  } else if (payload.old.status !== 'pending' && payload.new.status === 'pending') {
                    setPendingPayments(prev => prev + 1)
                  }
                  
                  return current.map(inv => 
                    inv.id === payload.new.id ? payload.new : inv
                  )
                }
                break
            }
            return current
          })
        }
      )
      .subscribe()

    return () => {
      channel.unsubscribe()
    }
  }, [projectId])

  return { invoices, pendingPayments, setInvoices }
}

// Hook for connection status monitoring
export function useConnectionStatus() {
  const [isConnected, setIsConnected] = useState(true)
  const [lastSeen, setLastSeen] = useState<Date | null>(null)

  useEffect(() => {
    let heartbeatInterval: NodeJS.Timeout

    const checkConnection = async () => {
      try {
        const { error } = await supabase.from('_heartbeat').select('1').limit(1)
        const connected = !error
        setIsConnected(connected)
        if (connected) {
          setLastSeen(new Date())
        }
      } catch {
        setIsConnected(false)
      }
    }

    // Initial check
    checkConnection()

    // Check every 30 seconds
    heartbeatInterval = setInterval(checkConnection, 30000)

    return () => {
      clearInterval(heartbeatInterval)
    }
  }, [])

  return { isConnected, lastSeen }
}