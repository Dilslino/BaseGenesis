import { ref, onValue, runTransaction, get } from 'firebase/database';
import { database } from '../config/firebase';

const SCAN_COUNT_PATH = 'stats/totalScans';

// Save a scan and increment counter atomically
export const saveScanFirebase = async (walletAddress: string): Promise<boolean> => {
  try {
    const countRef = ref(database, SCAN_COUNT_PATH);
    
    await runTransaction(countRef, (currentCount) => {
      return (currentCount || 0) + 1;
    });

    return true;
  } catch (err) {
    console.error('Firebase save scan error:', err);
    return false;
  }
};

// Get total scans
export const getTotalScansFirebase = async (): Promise<number> => {
  try {
    const countRef = ref(database, SCAN_COUNT_PATH);
    const snapshot = await get(countRef);
    return snapshot.val() || 0;
  } catch (err) {
    console.error('Firebase get total scans error:', err);
    return 0;
  }
};

// Subscribe to real-time updates
export const subscribeToScanCountFirebase = (
  onUpdate: (count: number) => void
): (() => void) => {
  const countRef = ref(database, SCAN_COUNT_PATH);
  
  const unsubscribe = onValue(countRef, (snapshot) => {
    const count = snapshot.val() || 0;
    onUpdate(count);
  });

  return unsubscribe;
};
