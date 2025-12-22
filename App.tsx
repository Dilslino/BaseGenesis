import React, { useState, useCallback, useEffect } from 'react';
import { useAppKit, useAppKitAccount, useDisconnect } from '@reown/appkit/react';
import { Heart } from 'lucide-react';
import { Button } from './components/Button';
import { FlexCard } from './components/FlexCard';
import { BottomNav, TabType } from './components/BottomNav';
import { HomeView } from './components/HomeView';
import { ScanView } from './components/ScanView';
import { ProfileView } from './components/ProfileView';
import { Leaderboard } from './components/Leaderboard';
import { LoadingSequence } from './components/LoadingSequence';
import { DonateModal } from './components/DonateModal';
import { ConnectWalletModal } from './components/ConnectWalletModal';
import { getBaseGenesisData } from './services/baseService';
import { saveUserProfile, getLeaderboard, getTotalUsers, getUserRankPosition } from './services/supabase';
import { saveScanFirebase } from './services/firebaseCounter';
import { useFarcaster } from './hooks/useFarcaster';
import { useDonate } from './hooks/useDonate';
import { UserGenesisData, LeaderboardEntry } from './types';
import { RANK_EMOJI } from './constants';

const App: React.FC = () => {
  // Navigation
  const [activeTab, setActiveTab] = useState<TabType>('home');
  
  // Wallet state
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  
  // Scan state
  const [isScanning, setIsScanning] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);
  const [userData, setUserData] = useState<UserGenesisData | null>(null);
  
  // Donate state
  const [showDonateModal, setShowDonateModal] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  // Leaderboard state
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [userRankPosition, setUserRankPosition] = useState<number | null>(null);
  
  // Paste address scan (not connected)
  const [isPasteScan, setIsPasteScan] = useState(false);
  
  // Connect wallet modal
  const [showConnectModal, setShowConnectModal] = useState(false);

  // Farcaster MiniKit hook
  const { 
    isLoaded, 
    isInFrame,
    isAppAdded,
    user, 
    walletAddress: farcasterWallet,
    isAuthenticated,
    authToken,
    connectWallet: connectFarcasterWallet,
    shareToWarpcast, 
    openUrl,
    addMiniApp,
  } = useFarcaster();
  
  // Reown AppKit hooks
  const { open: openAppKit } = useAppKit();
  const { address: appKitAddress, isConnected: isAppKitConnected } = useAppKitAccount();
  const { disconnect: disconnectAppKit } = useDisconnect();
  
  const { donate, isLoading: isDonating } = useDonate();

  // Auto-connect if in Farcaster frame with wallet OR authenticated
  useEffect(() => {
    if (isLoaded && isInFrame && (farcasterWallet || isAuthenticated)) {
      // Use Farcaster wallet if available, otherwise user is just authenticated
      if (farcasterWallet) {
        setWalletAddress(farcasterWallet);
      }
      setIsConnected(true);
      
      console.log('✅ Auto-connected via Farcaster');
      console.log('  - User:', user?.username || 'Unknown');
      console.log('  - Wallet:', farcasterWallet || 'Not shared');
      console.log('  - Authenticated:', isAuthenticated);
    }
  }, [isLoaded, isInFrame, farcasterWallet, isAuthenticated, user]);

  // Sync AppKit wallet state
  useEffect(() => {
    if (isAppKitConnected && appKitAddress) {
      setWalletAddress(appKitAddress);
      setIsConnected(true);
      setShowConnectModal(false);
    }
  }, [isAppKitConnected, appKitAddress]);

  // Fetch leaderboard and total users on load
  useEffect(() => {
    const fetchData = async () => {
      const [leaderboard, total] = await Promise.all([
        getLeaderboard(50),
        getTotalUsers()
      ]);
      setLeaderboardData(leaderboard);
      setTotalUsers(total);
    };
    fetchData();
  }, []);

  // Open connect wallet modal
  const handleConnect = () => {
    if (isInFrame) {
      // In Farcaster frame, directly connect with Farcaster wallet
      handleConnectFarcaster();
    } else {
      // Outside frame, show modal with options
      setShowConnectModal(true);
    }
  };

  // Connect with Farcaster wallet
  const handleConnectFarcaster = async () => {
    setIsConnecting(true);
    setScanError(null);
    
    try {
      const address = await connectFarcasterWallet();
      
      if (address) {
        setWalletAddress(address);
        setIsConnected(true);
        setShowConnectModal(false);
      } else {
        throw new Error('Failed to connect wallet');
      }
    } catch (err: any) {
      console.error('Connect error:', err);
      setScanError(err.message || 'Failed to connect wallet');
    } finally {
      setIsConnecting(false);
    }
  };

  // Connect with WalletConnect via Reown AppKit
  const handleConnectWalletConnect = async () => {
    setShowConnectModal(false);
    await openAppKit();
  };

  // Disconnect wallet
  const handleDisconnect = async () => {
    // Disconnect AppKit if connected
    if (isAppKitConnected) {
      await disconnectAppKit();
    }
    
    setIsConnected(false);
    setWalletAddress(null);
    setUserData(null);
    setIsPasteScan(false);
    setUserRankPosition(null);
    setActiveTab('home');
  };

  // Start scan (connected wallet - saves to database)
  const handleStartScan = useCallback(async () => {
    let addressToScan = walletAddress;
    
    // If authenticated but no wallet address, try to connect wallet first
    if (!addressToScan) {
      console.warn('⚠️ No wallet address available, attempting to connect...');
      setScanError('Please connect your wallet first');
      
      // Try to get wallet address via Farcaster wallet connection
      if (isInFrame) {
        try {
          const address = await connectFarcasterWallet();
          if (!address) {
            setScanError('Failed to get wallet address. Please try connecting manually.');
            return;
          }
          // Wallet connected, continue with scan
          setWalletAddress(address);
          addressToScan = address; // Use the address directly, don't wait for state
        } catch (err: any) {
          console.error('Wallet connect error:', err);
          setScanError('Failed to connect wallet. Please try manually.');
          return;
        }
      } else {
        setScanError('Please connect your wallet first');
        return;
      }
    }
    
    // Safety check: ensure we have an address
    if (!addressToScan) {
      setScanError('No wallet address available');
      return;
    }
    
    setIsScanning(true);
    setScanError(null);
    setIsPasteScan(false);

    try {
      await new Promise(r => setTimeout(r, 2000)); // Loading effect
      const data = await getBaseGenesisData(addressToScan);
      setUserData(data);
      
      // Save scan to trigger real-time counter update (Firebase)
      await saveScanFirebase(addressToScan);
      console.log('✅ Scan saved to Firebase for real-time counter');
      
      // Save to Supabase (only for connected wallets)
      if (isConnected) {
        await saveUserProfile(data, {
          username: user?.username,
          pfpUrl: user?.pfpUrl,
          fid: user?.fid,
        });
        
        // Refresh leaderboard and get user position
        const [leaderboard, total, position] = await Promise.all([
          getLeaderboard(50),
          getTotalUsers(),
          getUserRankPosition(addressToScan)
        ]);
        setLeaderboardData(leaderboard);
        setTotalUsers(total);
        setUserRankPosition(position);
      }
      
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
      setActiveTab('profile');
    } catch (err: any) {
      console.error('Scan error:', err);
      setScanError(err.message || 'Failed to analyze wallet');
    } finally {
      setIsScanning(false);
    }
  }, [walletAddress, isConnected, user, isInFrame, connectFarcasterWallet]);

  // Paste address scan (not connected - does NOT save to database but counts scan)
  const handlePasteAddressScan = useCallback(async (address: string) => {
    setIsScanning(true);
    setScanError(null);
    setIsPasteScan(true);
    setActiveTab('scan');

    try {
      await new Promise(r => setTimeout(r, 2000)); // Loading effect
      const data = await getBaseGenesisData(address);
      setUserData(data);
      
      // Save scan to trigger real-time counter update (Firebase)
      await saveScanFirebase(address);
      console.log('✅ Anonymous scan saved to Firebase for real-time counter');
      
      // Save anonymous profile to Supabase for leaderboard (without Farcaster data)
      await saveUserProfile(data, undefined);
      
      // Refresh leaderboard
      const [leaderboard, total] = await Promise.all([
        getLeaderboard(50),
        getTotalUsers()
      ]);
      setLeaderboardData(leaderboard);
      setTotalUsers(total);
      
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
      setActiveTab('profile');
    } catch (err: any) {
      console.error('Scan error:', err);
      setScanError(err.message || 'Failed to analyze wallet');
      setActiveTab('home');
    } finally {
      setIsScanning(false);
    }
  }, []);

  // Share profile to Farcaster with embeds
  const handleShare = async (text: string, _url: string) => {
    if (!userData) return;
    // Use dynamic share URL that generates card image
    const shareUrl = `https://basegenesis.vercel.app/share/${userData.address}`;
    const fullText = `${text}\n\n${shareUrl}`;
    await shareToWarpcast(fullText);
  };

  // View on Basescan
  const handleViewBasescan = () => {
    if (userData?.firstTxHash) {
      openUrl(`https://basescan.org/tx/${userData.firstTxHash}`);
    }
  };

  // Handle donate
  const handleDonate = async (amount: string, token: 'ETH' | 'USDC'): Promise<string | null> => {
    const txHash = await donate(amount, token, isInFrame);
    if (txHash) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
    }
    return txHash;
  };

  // Loading screen
  if (!isLoaded) {
    return (
      <div className="w-full min-h-screen max-w-[424px] mx-auto glass-bg text-white flex items-center justify-center">
        <LoadingSequence />
      </div>
    );
  }

  return (
    <div className="w-full h-screen max-w-full sm:max-w-[480px] md:max-w-[520px] lg:max-w-[560px] mx-auto glass-bg text-white font-sans flex flex-col relative">
      
      {/* Confetti Effect */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-confetti"
              style={{
                left: `${Math.random() * 100}%`,
                top: '-20px',
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${2 + Math.random() * 2}s`
              }}
            >
              <span className="text-lg">{['🔵', '⚡', '✨', '🏆', '💎'][Math.floor(Math.random() * 5)]}</span>
            </div>
          ))}
        </div>
      )}

      {/* Background Ambience */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[300px] h-[200px] bg-base-blue/15 blur-[80px] rounded-full pointer-events-none" />
      <div className="absolute bottom-32 right-0 w-[200px] h-[150px] bg-purple-900/15 blur-[60px] rounded-full pointer-events-none" />

      {/* Header */}
      <header className="relative z-10 px-4 py-3 flex items-center justify-between border-b border-white/5 bg-base-black/80 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <img src="/logo.jpg" alt="BaseGenesis" className="w-8 h-8 rounded-xl object-cover" />
          <span className="font-bold tracking-tight">BaseGenesis</span>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Add to Warpcast button */}
          {isInFrame && !isAppAdded && (
            <button
              onClick={addMiniApp}
              className="px-3 py-1.5 rounded-lg text-xs font-medium
                bg-purple-500/20 text-purple-400 border border-purple-500/30
                hover:bg-purple-500/30 hover:border-purple-500/50
                transition-all duration-200"
            >
              + Add App
            </button>
          )}
          
          {/* User info */}
          {isConnected && (
            <>
              {user?.pfpUrl ? (
                <img src={user.pfpUrl} alt="" className="w-7 h-7 rounded-full border-2 border-green-500/50" />
              ) : (
                <div className="w-7 h-7 rounded-full bg-green-500/20 flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                </div>
              )}
              {user?.username && (
                <span className="text-xs text-gray-400">@{user.username}</span>
              )}
            </>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow flex flex-col px-4 py-4 relative z-10 overflow-y-auto">
        
        {/* Home Tab */}
        {activeTab === 'home' && (
          <HomeView
            isConnected={isConnected}
            isConnecting={isConnecting}
            walletAddress={walletAddress}
            isInFrame={isInFrame}
            username={user?.username}
            pfpUrl={user?.pfpUrl}
            totalUsers={totalUsers}
            onConnect={handleConnect}
            onDisconnect={handleDisconnect}
            onNavigateToScan={() => setActiveTab('scan')}
            onPasteAddressScan={handlePasteAddressScan}
          />
        )}

        {/* Scan Tab */}
        {activeTab === 'scan' && (
          <ScanView
            isConnected={isConnected}
            isScanning={isScanning}
            walletAddress={walletAddress}
            isAuthenticated={isAuthenticated}
            onStartScan={handleStartScan}
            error={scanError || undefined}
          />
        )}

        {/* Leaderboard Tab */}
        {activeTab === 'leaderboard' && (
          <Leaderboard
            entries={leaderboardData}
            userRank={userRankPosition || undefined}
            userAddress={walletAddress || undefined}
          />
        )}

        {/* Profile Tab */}
        {activeTab === 'profile' && userData && (
          <div className="flex flex-col h-full space-y-4">
            {/* Paste Scan Notice */}
            {isPasteScan && (
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-3 text-center">
                <p className="text-yellow-400 text-xs">
                  This is a preview scan. Connect wallet to save to leaderboard.
                </p>
              </div>
            )}

            {/* Card */}
            <div className="flex justify-center">
              <FlexCard data={userData} />
            </div>
            
            {/* Profile Info */}
            <ProfileView
              userData={userData}
              onShareFarcaster={handleShare}
              onViewBasescan={handleViewBasescan}
            />

            {/* Donate Section */}
            <div className="mt-auto pt-2">
              <button
                onClick={() => setShowDonateModal(true)}
                className="w-full py-3.5 rounded-2xl font-semibold text-white text-sm
                  bg-gradient-to-r from-pink-500/80 via-purple-500/80 to-indigo-500/80
                  hover:from-pink-500 hover:via-purple-500 hover:to-indigo-500
                  backdrop-blur-sm border border-white/10 hover:border-white/20
                  shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40
                  transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]
                  flex items-center justify-center gap-2"
              >
                <Heart className="w-5 h-5" />
                Support the Creator
              </button>
            </div>
          </div>
        )}

        {/* Profile Tab - Not Scanned Yet */}
        {activeTab === 'profile' && !userData && (
          <div className="flex-grow flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center">
              <span className="text-3xl">🔍</span>
            </div>
            <div>
              <h3 className="text-lg font-bold text-white mb-1">No Profile Yet</h3>
              <p className="text-gray-400 text-sm">Scan your wallet first to see your profile</p>
            </div>
            <Button variant="primary" onClick={() => setActiveTab('scan')} className="!px-6">
              Go to Scan
            </Button>
          </div>
        )}
      </main>

      {/* Bottom Navigation */}
      <BottomNav
        activeTab={activeTab}
        onTabChange={setActiveTab}
        hasScanned={!!userData}
      />

      {/* Donate Modal */}
      <DonateModal
        isOpen={showDonateModal}
        onClose={() => setShowDonateModal(false)}
        onDonate={handleDonate}
        isLoading={isDonating}
      />

      {/* Connect Wallet Modal */}
      <ConnectWalletModal
        isOpen={showConnectModal}
        onClose={() => setShowConnectModal(false)}
        onConnectFarcaster={handleConnectFarcaster}
        onConnectWalletConnect={handleConnectWalletConnect}
        isConnecting={isConnecting}
        isInFrame={isInFrame}
      />
    </div>
  );
};

export default App;
