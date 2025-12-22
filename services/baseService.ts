import { ACHIEVEMENTS_LIST } from '../constants';
import { UserGenesisData, UserRank, Transaction, Achievement } from '../types';
import { calculateRank, calculateDaysSinceJoined, parseTimestamp } from '../lib/rankUtils';
import { fetchWithRetry } from '../lib/retryHelper';

const BLOCKSCOUT_API_URL = 'https://base.blockscout.com/api';

const calculateAchievements = (
  daysSinceJoined: number,
  rank: UserRank,
  txCount: number,
  blockNumber: string
): Achievement[] => {
  return ACHIEVEMENTS_LIST.map(achievement => {
    let unlocked = false;
    
    switch (achievement.id) {
      case 'first_tx':
        unlocked = true;
        break;
      case 'pioneer':
        unlocked = rank === UserRank.OG_LEGEND;
        break;
      case 'early_bird':
        unlocked = rank === UserRank.OG_LEGEND || rank === UserRank.GENESIS_PIONEER || rank === UserRank.EARLY_SETTLER;
        break;
      case 'tx_10':
        unlocked = txCount >= 10;
        break;
      case 'tx_100':
        unlocked = txCount >= 100;
        break;
      case 'tx_1000':
        unlocked = txCount >= 1000;
        break;
      case 'year_1':
        unlocked = daysSinceJoined >= 365;
        break;
      case 'og_block':
        unlocked = parseInt(blockNumber) < 1000000;
        break;
    }
    
    return { ...achievement, unlocked };
  });
};

export const getBaseGenesisData = async (address: string): Promise<UserGenesisData> => {
  try {
    if (!address.startsWith('0x') || address.length !== 42) {
      throw new Error("Invalid Ethereum address format.");
    }

    // Get first transaction
    const firstTxParams = new URLSearchParams({
      module: 'account',
      action: 'txlist',
      address: address,
      startblock: '0',
      endblock: '99999999',
      page: '1',
      offset: '1',
      sort: 'asc'
    });

    // Get transaction count
    const txCountParams = new URLSearchParams({
      module: 'account',
      action: 'txlist',
      address: address,
      startblock: '0',
      endblock: '99999999',
      page: '1',
      offset: '10000',
      sort: 'asc'
    });

    // Use retry logic with 10s timeout
    const [firstTxResponse, txCountResponse] = await Promise.all([
      fetchWithRetry(
        `${BLOCKSCOUT_API_URL}?${firstTxParams.toString()}`,
        { headers: { 'Accept': 'application/json' } },
        10000,
        { maxAttempts: 2 }
      ),
      fetchWithRetry(
        `${BLOCKSCOUT_API_URL}?${txCountParams.toString()}`,
        { headers: { 'Accept': 'application/json' } },
        10000,
        { maxAttempts: 2 }
      )
    ]);

    const firstTxData = await firstTxResponse.json();
    const txCountData = await txCountResponse.json();

    if (firstTxData.status === '0') {
      if (firstTxData.message === 'No transactions found' || 
          !firstTxData.result || 
          (Array.isArray(firstTxData.result) && firstTxData.result.length === 0)) {
        throw new Error("No transactions found on Base for this address.");
      }
      if (firstTxData.message) {
        throw new Error(firstTxData.message);
      }
    }

    let firstTx: Transaction | null = null;
    if (firstTxData.result && Array.isArray(firstTxData.result) && firstTxData.result.length > 0) {
      firstTx = firstTxData.result[0];
    }

    if (!firstTx) {
      throw new Error("No transactions found on Base for this address.");
    }

    const txCount = Array.isArray(txCountData.result) ? txCountData.result.length : 0;

    const txDate = parseTimestamp(firstTx.timeStamp);
    const daysSinceJoined = calculateDaysSinceJoined(txDate);
    const rank = calculateRank(txDate);

    const achievements = calculateAchievements(daysSinceJoined, rank, txCount, firstTx.blockNumber);

    return {
      address,
      firstTxDate: txDate.toISOString(),
      firstTxHash: firstTx.hash,
      daysSinceJoined,
      rank,
      blockNumber: firstTx.blockNumber,
      txCount,
      achievements
    };

  } catch (error) {
    console.error("BaseService Error:", error);
    throw error;
  }
};
