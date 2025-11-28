import { useState, useEffect } from 'react';
import { getTotalScans, subscribeToScanCount } from '../services/supabase';

interface UseRealtimeScanCountResult {
  count: number;
  isLoading: boolean;
}

export const useRealtimeScanCount = (initialCount?: number): UseRealtimeScanCountResult => {
  const [count, setCount] = useState<number>(initialCount || 0);
  const [isLoading, setIsLoading] = useState<boolean>(!initialCount);

  useEffect(() => {
    // Fetch initial count
    const fetchInitialCount = async () => {
      const total = await getTotalScans();
      setCount(total);
      setIsLoading(false);
    };

    if (!initialCount) {
      fetchInitialCount();
    }

    // Subscribe to real-time updates
    const unsubscribe = subscribeToScanCount((newCount) => {
      setCount(newCount);
    });

    // Cleanup subscription on unmount
    return () => {
      unsubscribe();
    };
  }, [initialCount]);

  return { count, isLoading };
};
