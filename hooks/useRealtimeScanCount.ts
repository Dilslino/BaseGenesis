import { useState, useEffect } from 'react';
import { getTotalScansFirebase, subscribeToScanCountFirebase } from '../services/firebaseCounter';
import { getTotalUsers, subscribeToScanCount } from '../services/supabase';

interface UseRealtimeScanCountResult {
  count: number;
  isLoading: boolean;
  source: 'firebase' | 'supabase' | 'none';
}

/**
 * Real-time Scan Counter Hook
 * 
 * Uses dual-source strategy:
 * 1. Primary: Firebase Realtime Database (instant updates)
 * 2. Fallback: Supabase (with realtime subscription)
 * 
 * If Firebase is not configured, falls back to Supabase total_scans
 */
export const useRealtimeScanCount = (initialCount?: number): UseRealtimeScanCountResult => {
  const [count, setCount] = useState<number>(initialCount || 0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [source, setSource] = useState<'firebase' | 'supabase' | 'none'>('none');

  useEffect(() => {
    let firebaseUnsubscribe: (() => void) | null = null;
    let supabaseUnsubscribe: (() => void) | null = null;
    let isMounted = true;
    
    const initCounter = async () => {
      try {
        // 1. Try Firebase first
        const firebaseCount = await getTotalScansFirebase();
        
        if (firebaseCount > 0 && isMounted) {
          // Firebase is working, use it
          console.log('✅ Using Firebase for real-time counter');
          setCount(firebaseCount);
          setSource('firebase');
          setIsLoading(false);
          
          // Subscribe to Firebase real-time updates
          firebaseUnsubscribe = subscribeToScanCountFirebase((newCount) => {
            if (isMounted && newCount > 0) {
              setCount(newCount);
            }
          });
          return;
        } 
        
        // 2. Firebase not available/empty, try Supabase
        if (isMounted) {
          console.log('⚠️ Firebase unavailable/empty, checking Supabase');
          
          // Get initial count from Supabase
          const supabaseCount = await getTotalUsers();
          
          if (supabaseCount > 0) {
            setCount(supabaseCount);
            setSource('supabase');
          } else {
            setCount(initialCount || 0);
          }
          setIsLoading(false);
          
          // Subscribe to Supabase real-time updates
          try {
            supabaseUnsubscribe = subscribeToScanCount((newCount) => {
              if (isMounted && newCount > 0) {
                setCount(newCount);
              }
            });
          } catch (err) {
            console.warn('Supabase realtime subscription failed, using polling fallback');
            // Fallback: Poll every 15 seconds
            const pollInterval = setInterval(async () => {
              if (!isMounted) return;
              try {
                const newCount = await getTotalUsers();
                if (newCount > count) {
                  setCount(newCount);
                }
              } catch (e) {
                // ignore
              }
            }, 15000);
            supabaseUnsubscribe = () => clearInterval(pollInterval);
          }
        }
      } catch (err) {
        console.error('Counter initialization error:', err);
        if (isMounted) {
          setCount(initialCount || 0);
          setIsLoading(false);
        }
      }
    };

    initCounter();

    // Cleanup subscriptions on unmount
    return () => {
      isMounted = false;
      if (firebaseUnsubscribe) firebaseUnsubscribe();
      if (supabaseUnsubscribe) supabaseUnsubscribe();
    };
  }, [initialCount]);

  return { count, isLoading, source };
};
