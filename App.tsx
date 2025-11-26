import React, { useState, useCallback, useEffect } from 'react';
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
import { getBaseGenesisData } from './services/baseService';
import { useFarcaster } from './hooks/useFarcaster';
import { useDonate } from './hooks/useDonate';
import { UserGenesisData } from './types';
import { MOCK_LEADERBOARD, SHARE_MESSAGES, RANK_EMOJI } from './constants';

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

  // Farcaster MiniKit hook
  const { 
    isLoaded, 
    isInFrame, 
    user, 
    walletAddress: farcasterWallet,
    connectWallet,
    shareToWarpcast, 
    openUrl,
  } = useFarcaster();
  
  const { donate, isLoading: isDonating } = useDonate();

  // Auto-connect if in Farcaster frame with wallet
  useEffect(() => {
    if (isLoaded && isInFrame && farcasterWallet) {
      setWalletAddress(farcasterWallet);
      setIsConnected(true);
    }
  }, [isLoaded, isInFrame, farcasterWallet]);

  // Connect wallet using Farcaster MiniKit or MetaMask
  const handleConnect = async () => {
    setIsConnecting(true);
    setScanError(null);
    
    try {
      const address = await connectWallet();
      
      if (address) {
        setWalletAddress(address);
        setIsConnected(true);
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

  // Disconnect wallet
  const handleDisconnect = () => {
    setIsConnected(false);
    setWalletAddress(null);
    setUserData(null);
    setActiveTab('home');
  };

  // Start scan
  const handleStartScan = useCallback(async () => {
    if (!walletAddress) return;
    
    setIsScanning(true);
    setScanError(null);

    try {
      await new Promise(r => setTimeout(r, 2000)); // Loading effect
      const data = await getBaseGenesisData(walletAddress);
      setUserData(data);
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
      setActiveTab('profile'); // Go to profile after scan
    } catch (err: any) {
      console.error('Scan error:', err);
      setScanError(err.message || 'Failed to analyze wallet');
    } finally {
      setIsScanning(false);
    }
  }, [walletAddress]);

  // Share profile
  const handleShare = async () => {
    if (!userData) return;
    const baseMessage = SHARE_MESSAGES[userData.rank];
    const text = `${baseMessage}\n\n${RANK_EMOJI[userData.rank]} ${userData.daysSinceJoined} days on Base\n\nCheck yours:`;
    await shareToWarpcast(text);
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
      <div className="w-full min-h-screen max-w-[424px] mx-auto bg-base-black text-white flex items-center justify-center">
        <LoadingSequence />
      </div>
    );
  }

  return (
    <div className="w-full h-screen max-w-full sm:max-w-[480px] md:max-w-[520px] lg:max-w-[560px] mx-auto bg-base-black text-white font-sans flex flex-col relative overflow-hidden">
      
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
          <img src="/logo.jpg" alt="BaseGenesis" className="w-8 h-8 rounded-xl object-contain" />
          <span className="font-bold tracking-tight">BaseGenesis</span>
        </div>
        
        {/* User info */}
        {isConnected && (
          <div className="flex items-center gap-2">
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
          </div>
        )}
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
            onConnect={handleConnect}
            onDisconnect={handleDisconnect}
            onNavigateToScan={() => setActiveTab('scan')}
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
            entries={MOCK_LEADERBOARD}
            userRank={userData ? 42069 : undefined}
            userAddress={walletAddress || undefined}
          />
        )}

        {/* Profile Tab */}
        {activeTab === 'profile' && userData && (
          <div className="flex flex-col h-full space-y-4">
            {/* Card */}
            <div className="flex justify-center">
              <FlexCard data={userData} />
            </div>
            
            {/* Profile Info */}
            <ProfileView
              userData={userData}
              onShare={handleShare}
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
    </div>
  );
};

export default App;
