'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { useAppKit, useAppKitAccount, useDisconnect } from '@reown/appkit/react';
import { BottomNav, TabType } from '../components/BottomNav';
import { HomeView } from '../components/HomeView';
import { ScanView } from '../components/ScanView';
import { ProfileView } from '../components/ProfileView';
import { FlexCard } from '../components/FlexCard';
import { Leaderboard } from '../components/Leaderboard';
import { LoadingSequence } from '../components/LoadingSequence';
import { DonateModal } from '../components/DonateModal';
import { ConnectWalletModal } from '../components/ConnectWalletModal';
import { AddMiniAppModal } from '../components/AddMiniAppModal';
import { Button } from '../components/Button';
import { useFarcaster } from '../hooks/useFarcaster';
import { useDonate } from '../hooks/useDonate';
import { UserGenesisData, LeaderboardEntry } from '../types';
import { getLeaderboard, getTotalUsers } from '../services/supabase';
import { saveScanFirebase } from '../services/firebaseCounter';

export default function Home() {
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
  
  // Add Mini App modal
  const [showAddMiniAppModal, setShowAddMiniAppModal] = useState(false);
  const [isAddingMiniApp, setIsAddingMiniApp] = useState(false);

  // Farcaster MiniKit hook
  const { 
    isLoaded, 
    isInFrame,
    isAppAdded,
    user, 
    walletAddress: farcasterWallet,
    isAuthenticated,
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
      if (farcasterWallet) {
        setWalletAddress(farcasterWallet);
      }
      setIsConnected(true);
    }
  }, [isLoaded, isInFrame, farcasterWallet, isAuthenticated]);

  // Show Add Mini App modal after loading (if not already added)
  useEffect(() => {
    if (isLoaded && isInFrame && !isAppAdded) {
      // Show modal after a short delay for better UX
      const timer = setTimeout(() => {
        setShowAddMiniAppModal(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [isLoaded, isInFrame, isAppAdded]);

  // Sync AppKit wallet state
  useEffect(() => {
    if (isAppKitConnected && appKitAddress) {
      setWalletAddress(appKitAddress);
      setIsConnected(true);
      setShowConnectModal(false);
    }
  }, [isAppKitConnected, appKitAddress]);

  // Fetch leaderboard on load
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        // Fetch leaderboard from Supabase
        const leaderboard = await getLeaderboard(100);
        setLeaderboardData(leaderboard);
        
        // Fetch total users count
        const total = await getTotalUsers();
        setTotalUsers(total);
      } catch (error) {
        console.error('Error fetching initial data:', error);
      }
    };
    fetchInitialData();
  }, []);

  // Open connect wallet modal
  const handleConnect = () => {
    if (isInFrame) {
      handleConnectFarcaster();
    } else {
      setShowConnectModal(true);
    }
  };

  // Handle Add Mini App
  const handleAddMiniApp = async () => {
    setIsAddingMiniApp(true);
    try {
      const success = await addMiniApp();
      if (success) {
        setShowAddMiniAppModal(false);
      }
    } catch (err) {
      console.error('Add mini app error:', err);
    } finally {
      setIsAddingMiniApp(false);
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

  // Start scan (connected wallet)
  const handleStartScan = useCallback(async () => {
    // Use walletAddress from state, or farcasterWallet as fallback
    let addressToScan = walletAddress || farcasterWallet;
    
    if (!addressToScan) {
      setScanError('Please connect your wallet first');
      return;
    }
    
    setIsScanning(true);
    setScanError(null);
    setIsPasteScan(false);

    try {
      const res = await fetch('/api/check-history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address: addressToScan }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to fetch data');
      }

      setUserData(data.userData);
      if (data.leaderboard) {
        setLeaderboardData(data.leaderboard);
      }
      
      // Increment Firebase scan counter
      await saveScanFirebase(addressToScan);
      
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
      setActiveTab('profile');

    } catch (err: any) {
      console.error('Scan error:', err);
      setScanError(err.message || 'Failed to analyze wallet');
    } finally {
      setIsScanning(false);
    }
  }, [walletAddress, farcasterWallet]);

  // Paste address scan (not connected)
  const handlePasteAddressScan = useCallback(async (address: string) => {
    setIsScanning(true);
    setScanError(null);
    setIsPasteScan(true);
    setActiveTab('scan');

    try {
      const res = await fetch('/api/check-history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to fetch data');
      }

      setUserData(data.userData);
      if (data.leaderboard) {
        setLeaderboardData(data.leaderboard);
      }
      
      // Increment Firebase scan counter
      await saveScanFirebase(address);
      
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

  // Share profile to Farcaster
  const handleShare = async (text: string, _url: string) => {
    if (!userData) return;
    const shareUrl = `https://basegenesis.vercel.app/share/${userData.address}`;
    await shareToWarpcast(text, shareUrl);
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
          {isLoaded && isInFrame && !isAppAdded && (
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
      <main className="flex-grow flex flex-col px-4 py-4 relative z-10 overflow-y-auto no-scrollbar">
        
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
              onDonate={() => setShowDonateModal(true)}
            />
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

      {/* Add Mini App Modal */}
      <AddMiniAppModal
        isOpen={showAddMiniAppModal}
        onClose={() => setShowAddMiniAppModal(false)}
        onAdd={handleAddMiniApp}
        isAdding={isAddingMiniApp}
      />
    </div>
  );
}
