import { BASE_LAUNCH_DATE, RANK_THRESHOLDS, ACHIEVEMENTS_LIST } from '../constants';
import { UserGenesisData, UserRank, Transaction, Achievement } from '../types';

const BLOCKSCOUT_API_URL = 'https://base.blockscout.com/api';

// Special OG wallets (for testing/VIP)
const OG_WALLETS = [
  '0xEA83Fad9414A2e82Ea00Fb30e4C3e09B7E51fE4d'.toLowerCase(),
];

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
        unlocked = rank === UserRank.GENESIS_PIONEER;
        break;
      case 'early_bird':
        unlocked = rank === UserRank.GENESIS_PIONEER || rank === UserRank.EARLY_SETTLER;
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

    const [firstTxResponse, txCountResponse] = await Promise.all([
      fetch(`${BLOCKSCOUT_API_URL}?${firstTxParams.toString()}`),
      fetch(`${BLOCKSCOUT_API_URL}?${txCountParams.toString()}`)
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

    const txDate = new Date(parseInt(firstTx.timeStamp) * 1000);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - txDate.getTime());
    const daysSinceJoined = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    const diffFromLaunch = Math.abs(txDate.getTime() - BASE_LAUNCH_DATE.getTime());
    const daysSinceLaunch = Math.ceil(diffFromLaunch / (1000 * 60 * 60 * 24));
    const isPreLaunch = txDate < BASE_LAUNCH_DATE;

    // Check if wallet is in special OG list
    const isSpecialOG = OG_WALLETS.includes(address.toLowerCase());

    let rank = UserRank.BASE_CITIZEN;
    if (isSpecialOG || isPreLaunch || daysSinceLaunch <= RANK_THRESHOLDS.OG_DAYS) {
      rank = UserRank.OG_LEGEND;
    } else if (daysSinceLaunch <= RANK_THRESHOLDS.PIONEER_DAYS) {
      rank = UserRank.GENESIS_PIONEER;
    } else if (daysSinceLaunch <= RANK_THRESHOLDS.SETTLER_DAYS) {
      rank = UserRank.EARLY_SETTLER;
    }

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
