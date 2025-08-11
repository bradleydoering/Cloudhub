'use client'

import { useEffect, useState } from 'react'
import { supabase, type Deal, type Project } from '@cloudreno/lib'
import { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js'

// Hook for real-time deals updates
export function useRealtimeDeals(organizationId: string) {
  const [deals, setDeals] = useState<Deal[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let channel: RealtimeChannel

    async function fetchDeals() {
      try {
        const { data, error } = await supabase
          .from('deals')
          .select('*')
          .eq('organization_id', organizationId)
          .order('created_at', { ascending: false })

        if (error) throw error
        setDeals(data || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch deals')
      } finally {
        setLoading(false)
      }
    }

    // Initial fetch
    fetchDeals()

    // Setup real-time subscription
    channel = supabase
      .channel('deals_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'deals',
          filter: `organization_id=eq.${organizationId}`,
        },
        (payload: RealtimePostgresChangesPayload<Deal>) => {
          console.log('Deals real-time update:', payload)
          
          setDeals(currentDeals => {
            switch (payload.eventType) {
              case 'INSERT':
                if (payload.new) {
                  return [payload.new, ...currentDeals]
                }
                break
              case 'UPDATE':
                if (payload.new) {
                  return currentDeals.map(deal => 
                    deal.id === payload.new.id ? payload.new : deal
                  )
                }
                break
              case 'DELETE':
                if (payload.old) {
                  return currentDeals.filter(deal => deal.id !== payload.old.id)
                }
                break
            }
            return currentDeals
          })
        }
      )
      .subscribe((status) => {
        console.log('Deals subscription status:', status)
      })

    return () => {
      channel.unsubscribe()
    }
  }, [organizationId])

  return { deals, loading, error, setDeals }
}

// Hook for real-time projects updates
export function useRealtimeProjects(organizationId: string) {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let channel: RealtimeChannel

    async function fetchProjects() {
      try {
        const { data, error } = await supabase
          .from('projects')
          .select('*')
          .eq('organization_id', organizationId)
          .order('created_at', { ascending: false })

        if (error) throw error
        setProjects(data || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch projects')
      } finally {
        setLoading(false)
      }
    }

    // Initial fetch
    fetchProjects()

    // Setup real-time subscription
    channel = supabase
      .channel('projects_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'projects',
          filter: `organization_id=eq.${organizationId}`,
        },
        (payload: RealtimePostgresChangesPayload<Project>) => {
          console.log('Projects real-time update:', payload)
          
          setProjects(currentProjects => {
            switch (payload.eventType) {
              case 'INSERT':
                if (payload.new) {
                  return [payload.new, ...currentProjects]
                }
                break
              case 'UPDATE':
                if (payload.new) {
                  return currentProjects.map(project => 
                    project.id === payload.new.id ? payload.new : project
                  )
                }
                break
              case 'DELETE':
                if (payload.old) {
                  return currentProjects.filter(project => project.id !== payload.old.id)
                }
                break
            }
            return currentProjects
          })
        }
      )
      .subscribe((status) => {
        console.log('Projects subscription status:', status)
      })

    return () => {
      channel.unsubscribe()
    }
  }, [organizationId])

  return { projects, loading, error, setProjects }
}

// Hook for general real-time notifications
export function useRealtimeNotifications(userId: string) {
  const [notifications, setNotifications] = useState<any[]>([])
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    let channel: RealtimeChannel

    // Setup notification subscription
    channel = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          console.log('New notification:', payload)
          if (payload.new) {
            setNotifications(prev => [payload.new, ...prev])
            setUnreadCount(prev => prev + 1)
            
            // Show browser notification if permission granted
            if (Notification.permission === 'granted') {
              new Notification(payload.new.title || 'CloudHub Notification', {
                body: payload.new.message,
                icon: '/favicon.ico',
                tag: payload.new.id
              })
            }
          }
        }
      )
      .subscribe()

    return () => {
      channel.unsubscribe()
    }
  }, [userId])

  const markAsRead = async (notificationId: string) => {
    try {
      await supabase
        .from('notifications')
        .update({ read_at: new Date().toISOString() })
        .eq('id', notificationId)
      
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, read_at: new Date().toISOString() } : n)
      )
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch (error) {
      console.error('Failed to mark notification as read:', error)
    }
  }

  const requestNotificationPermission = async () => {
    if (Notification.permission === 'default') {
      await Notification.requestPermission()
    }
  }

  return { 
    notifications, 
    unreadCount, 
    markAsRead, 
    requestNotificationPermission 
  }
}