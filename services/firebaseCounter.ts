import { ref, onValue, runTransaction, get } from 'firebase/database';
import { database } from '../config/firebase';

const SCAN_COUNT_PATH = 'stats/totalScans';

// Save a scan and increment counter atomically
export const saveScanFirebase = async (walletAddress: string): Promise<boolean> => {
  if (!database) {
    console.warn('Firebase not initialized, skipping scan save');
    return false;
  }
  
  try {
    const countRef = ref(database, SCAN_COUNT_PATH);
    
    const result = await runTransaction(countRef, (currentCount) => {
      // Increment count, initializing to 0 if null
      return (currentCount || 0) + 1;
    });

    if (result.committed) {
      // Optional: Log individual scan if needed in a separate path
      // const scanLogRef = ref(database, `scans/${Date.now()}`);
      // set(scanLogRef, { address: walletAddress, timestamp: Date.now() });
      return true;
    } else {
      console.warn('Firebase transaction not committed');
      return false;
    }
  } catch (err) {
    console.error('Firebase save scan error:', err);
    return false;
  }
};

// Get total scans
export const getTotalScansFirebase = async (): Promise<number> => {
  if (!database) {
    return 0;
  }
  
  try {
    const countRef = ref(database, SCAN_COUNT_PATH);
    const snapshot = await get(countRef);
    if (snapshot.exists()) {
      return snapshot.val();
    }
    return 0;
  } catch (err) {
    console.error('Firebase get total scans error:', err);
    return 0;
  }
};

// Subscribe to real-time updates
export const subscribeToScanCountFirebase = (
  onUpdate: (count: number) => void
): (() => void) => {
  if (!database) {
    return () => {}; // Return no-op unsubscribe
  }
  
  const countRef = ref(database, SCAN_COUNT_PATH);
  
  const unsubscribe = onValue(countRef, (snapshot) => {
    const count = snapshot.val();
    if (typeof count === 'number') {
      onUpdate(count);
    }
  }, (error) => {
    console.error('Firebase subscription error:', error);
  });

  return unsubscribe;
};
