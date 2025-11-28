import { useState, useEffect } from 'react';
import { subscribeToScanCountFirebase } from '../services/firebaseCounter';

interface UseRealtimeScanCountResult {
  count: number;
  isLoading: boolean;
}

export const useRealtimeScanCount = (initialCount?: number): UseRealtimeScanCountResult => {
  const [count, setCount] = useState<number>(initialCount || 0);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // Subscribe to real-time updates from Firebase
    // Firebase onValue automatically provides initial value
    const unsubscribe = subscribeToScanCountFirebase((newCount) => {
      // Use Firebase count if > 0, otherwise fallback to initialCount
      setCount(newCount > 0 ? newCount : (initialCount || 0));
      setIsLoading(false);
    });

    // Cleanup subscription on unmount
    return () => {
      unsubscribe();
    };
  }, [initialCount]);

  return { count, isLoading };
};
