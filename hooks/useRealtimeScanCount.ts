import { useState, useEffect } from 'react';
import { getTotalScansFirebase, subscribeToScanCountFirebase } from '../services/firebaseCounter';
import { getTotalUsers, subscribeToScanCount } from '../services/supabase';

interface UseRealtimeScanCountResult {
  count: number;
  isLoading: boolean;
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
  const [useFirebase, setUseFirebase] = useState<boolean>(true);

  useEffect(() => {
    let firebaseUnsubscribe: (() => void) | null = null;
    let supabaseUnsubscribe: (() => void) | null = null;
    
    // Try Firebase first
    getTotalScansFirebase().then(async (firebaseCount) => {
      if (firebaseCount > 0) {
        // Firebase is working, use it
        console.log('✅ Using Firebase for real-time counter');
        setCount(firebaseCount);
        setUseFirebase(true);
        setIsLoading(false);
        
        // Subscribe to Firebase real-time updates
        firebaseUnsubscribe = subscribeToScanCountFirebase((newCount) => {
          console.log('🔥 Firebase real-time update:', newCount);
          if (newCount > 0) {
            setCount(newCount);
          }
        });
      } else {
        // Firebase not available, use Supabase
        console.log('⚠️ Firebase unavailable, using Supabase for counter');
        setUseFirebase(false);
        
        // Get initial count from Supabase
        const supabaseCount = await getTotalUsers();
        setCount(supabaseCount > 0 ? supabaseCount : (initialCount || 0));
        setIsLoading(false);
        
        // Subscribe to Supabase real-time updates (if available)
        try {
          supabaseUnsubscribe = subscribeToScanCount((newCount) => {
            console.log('📊 Supabase real-time update:', newCount);
            if (newCount > 0) {
              setCount(newCount);
            }
          });
        } catch (err) {
          console.warn('Supabase realtime subscription failed:', err);
          
          // Fallback: Poll every 10 seconds if realtime fails
          const pollInterval = setInterval(async () => {
            try {
              const newCount = await getTotalUsers();
              if (newCount > count) {
                console.log('📊 Polling update:', newCount);
                setCount(newCount);
              }
            } catch (error) {
              console.error('Polling failed:', error);
            }
          }, 10000);
          
          // Store interval ID for cleanup
          supabaseUnsubscribe = () => clearInterval(pollInterval);
        }
      }
    }).catch(() => {
      console.warn('Failed to fetch scan count, using initial value');
      setCount(initialCount || 0);
      setIsLoading(false);
    });

    // Cleanup subscriptions on unmount
    return () => {
      if (firebaseUnsubscribe) {
        firebaseUnsubscribe();
      }
      if (supabaseUnsubscribe) {
        supabaseUnsubscribe();
      }
    };
  }, [initialCount]);

  return { count, isLoading };
};
