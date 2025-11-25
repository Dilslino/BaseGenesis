import React, { useState, useCallback, useEffect } from 'react';
import { Wallet, Share2, Zap, ArrowRight, Trophy, Sparkles, ExternalLink, CheckCircle } from 'lucide-react';
import { Button } from './components/Button';
import { FlexCard } from './components/FlexCard';
import { LoadingSequence } from './components/LoadingSequence';
import { Leaderboard } from './components/Leaderboard';
import { Achievements } from './components/Achievements';
import { StatsCard } from './components/StatsCard';
import { RankBadge } from './components/RankBadge';
import { getBaseGenesisData } from './services/baseService';
import { useFarcaster } from './hooks/useFarcaster';
import { useMint } from './hooks/useMint';
import { UserGenesisData, AppState } from './types';
import { RANK_DESCRIPTIONS, MOCK_LEADERBOARD, SHARE_MESSAGES, RANK_EMOJI } from './constants';
import { MINT_PRICE } from './config/wagmi';

const App: React.FC = () => {
  const [addressInput, setAddressInput] = useState('');
  const [appState, setAppState] = useState<AppState>('IDLE');
  const [userData, setUserData] = useState<UserGenesisData | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [mintStatus, setMintStatus] = useState<'idle' | 'pending' | 'success' | 'error'>('idle');
  const [showConfetti, setShowConfetti] = useState(false);
  const [mintTxHash, setMintTxHash] = useState<string | null>(null);

  const { isLoaded, isInFrame, user, walletAddress, shareToWarpcast, openUrl } = useFarcaster();
  const { mint, isLoading: isMinting, error: mintError } = useMint();

  // Auto-fill wallet address from Farcaster
  useEffect(() => {
    if (walletAddress && !addressInput) {
      setAddressInput(walletAddress);
    }
  }, [walletAddress]);

  // Auto-discover if in Farcaster frame with wallet
  useEffect(() => {
    if (isLoaded && walletAddress && appState === 'IDLE') {
      handleDiscover();
    }
  }, [isLoaded, walletAddress]);

  const handleDiscover = useCallback(async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const address = addressInput || walletAddress;
    if (!address) return;

    setAppState('LOADING');
    setErrorMsg('');
    setMintStatus('idle');

    await new Promise(r => setTimeout(r, 2000));

    try {
      const data = await getBaseGenesisData(address.trim());
      setUserData(data);
      setAppState('RESULT');
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Could not fetch on-chain data.");
      setAppState('ERROR');
    }
  }, [addressInput, walletAddress]);

  const handleShare = async () => {
    if (!userData) return;
    const baseMessage = SHARE_MESSAGES[userData.rank];
    const text = `${baseMessage}\n\n${RANK_EMOJI[userData.rank]} ${userData.daysSinceJoined} days on Base\n\nCheck yours: basegenesis.xyz`;
    await shareToWarpcast(text);
  };

  const handleMint = async () => {
    if (!userData) return;
    
    setMintStatus('pending');
    
    try {
      const txHash = await mint(userData);
      
      if (txHash) {
        setMintTxHash(txHash);
        setMintStatus('success');
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 3000);
      } else {
        setMintStatus('error');
      }
    } catch (err) {
      console.error('Mint failed:', err);
      setMintStatus('error');
    }
  };

  const handleReset = () => {
    setAppState('IDLE');
    setAddressInput(walletAddress || '');
    setUserData(null);
  };

  const handleViewOnBasescan = () => {
    if (userData?.firstTxHash) {
      openUrl(`https://basescan.org/tx/${userData.firstTxHash}`);
    }
  };

  // Loading state for Farcaster SDK
  if (!isLoaded) {
    return (
      <div className="w-full min-h-screen max-w-[424px] mx-auto bg-base-black text-white flex items-center justify-center">
        <LoadingSequence />
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen max-w-[424px] mx-auto bg-base-black text-white font-sans flex flex-col relative overflow-hidden">
      
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
      <div className="absolute bottom-20 right-0 w-[200px] h-[150px] bg-purple-900/15 blur-[60px] rounded-full pointer-events-none" />

      {/* Header */}
      <header className="relative z-10 px-4 py-3 flex items-center justify-between border-b border-white/5">
        <div className="flex items-center gap-2 cursor-pointer" onClick={handleReset}>
          <div className="w-7 h-7 rounded-lg bg-base-blue flex items-center justify-center">
            <span className="font-bold text-white text-sm">B</span>
          </div>
          <span className="font-bold tracking-tight text-base">BaseGenesis</span>
        </div>
        
        {/* User info if in Farcaster */}
        {isInFrame && user && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400">@{user.username}</span>
            {user.pfpUrl && (
              <img src={user.pfpUrl} alt="" className="w-6 h-6 rounded-full border border-white/10" />
            )}
          </div>
        )}

        {/* Leaderboard button when not in leaderboard view */}
        {appState !== 'LEADERBOARD' && appState !== 'LOADING' && (
          <button 
            onClick={() => setAppState('LEADERBOARD')}
            className="flex items-center gap-1 text-xs text-gray-400 hover:text-white transition"
          >
            <Trophy className="w-3.5 h-3.5" />
            <span className="hidden min-[360px]:inline">Rankings</span>
          </button>
        )}
      </header>

      <main className="flex-grow flex flex-col px-4 py-4 relative z-10 overflow-y-auto">
        
        {/* STATE: IDLE */}
        {appState === 'IDLE' && (
          <div className="flex flex-col h-full animate-fade-in-up">
            <div className="flex-grow flex flex-col justify-center space-y-5">
              <div className="text-center space-y-2">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-base-blue/10 border border-base-blue/20 rounded-full text-xs text-base-blue mb-2">
                  <Sparkles className="w-3 h-3" />
                  <span>Farcaster Mini App</span>
                </div>
                <h1 className="text-3xl font-black tracking-tight leading-tight">
                  Discover Your{' '}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-base-blue to-white">Base Origin</span>
                </h1>
                <p className="text-gray-400 text-sm">
                  Find out when you first joined Base and earn your Genesis rank.
                </p>
              </div>

              <form onSubmit={handleDiscover} className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-base-blue to-purple-600 rounded-xl blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
                <div className="relative bg-base-black border border-white/10 rounded-xl p-1.5 flex items-center">
                  <Wallet className="ml-2 w-4 h-4 text-gray-500" />
                  <input 
                    type="text" 
                    placeholder={isInFrame ? "Using your Farcaster wallet..." : "Wallet Address (0x...)"}
                    className="flex-grow bg-transparent border-none outline-none text-white px-2 py-2 font-mono text-xs placeholder:text-gray-600"
                    value={addressInput}
                    onChange={(e) => setAddressInput(e.target.value)}
                    autoFocus={!isInFrame}
                  />
                  <Button 
                    type="submit" 
                    variant="primary" 
                    className="!py-1.5 !px-3 !rounded-lg !text-xs" 
                    disabled={!addressInput && !walletAddress}
                  >
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </form>

              {/* Quick Stats */}
              <div className="flex justify-center gap-6 pt-2">
                <div className="flex flex-col items-center">
                  <span className="text-xl font-bold text-white">100K+</span>
                  <span className="text-[10px] text-gray-500 uppercase tracking-widest">Checked</span>
                </div>
                <div className="w-px h-8 bg-white/10"></div>
                <div className="flex flex-col items-center">
                  <span className="text-xl font-bold text-white">Aug '23</span>
                  <span className="text-[10px] text-gray-500 uppercase tracking-widest">Genesis</span>
                </div>
                <div className="w-px h-8 bg-white/10"></div>
                <div className="flex flex-col items-center">
                  <span className="text-xl font-bold text-white">3</span>
                  <span className="text-[10px] text-gray-500 uppercase tracking-widest">Ranks</span>
                </div>
              </div>

              {/* Rank Previews */}
              <div className="space-y-2 pt-2">
                <p className="text-[10px] text-gray-500 uppercase tracking-widest text-center">Possible Ranks</p>
                <div className="flex justify-center gap-2 flex-wrap">
                  <span className="text-xs px-2 py-1 bg-amber-500/10 text-amber-400 rounded-full border border-amber-500/20">🏆 Pioneer</span>
                  <span className="text-xs px-2 py-1 bg-cyan-500/10 text-cyan-400 rounded-full border border-cyan-500/20">⚡ Settler</span>
                  <span className="text-xs px-2 py-1 bg-slate-500/10 text-slate-400 rounded-full border border-slate-500/20">🌐 Citizen</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STATE: LOADING */}
        {appState === 'LOADING' && (
          <div className="flex-grow flex items-center justify-center">
            <LoadingSequence />
          </div>
        )}

        {/* STATE: ERROR */}
        {appState === 'ERROR' && (
          <div className="flex-grow flex items-center justify-center">
            <div className="text-center space-y-4 w-full">
              <div className="p-4 bg-red-900/20 border border-red-500/30 rounded-xl">
                <h3 className="text-base font-bold text-red-400 mb-1">Analysis Failed</h3>
                <p className="text-gray-300 text-sm mb-3">{errorMsg}</p>
                <Button onClick={() => setAppState('IDLE')} variant="secondary" className="!text-sm !py-2">
                  Try Again
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* STATE: LEADERBOARD */}
        {appState === 'LEADERBOARD' && (
          <Leaderboard 
            entries={MOCK_LEADERBOARD} 
            onClose={() => setAppState(userData ? 'RESULT' : 'IDLE')}
            userRank={userData ? 42069 : undefined}
          />
        )}

        {/* STATE: RESULT */}
        {appState === 'RESULT' && userData && (
          <div className="flex flex-col space-y-4 animate-fade-in pb-2">
            
            {/* Card with Rank Badge */}
            <div className="flex flex-col items-center space-y-2">
              <RankBadge rank={userData.rank} size="md" />
              <FlexCard data={userData} />
            </div>

            {/* Stats */}
            <StatsCard 
              daysSince={userData.daysSinceJoined}
              blockNumber={userData.blockNumber}
              txHash={userData.firstTxHash}
              txCount={userData.txCount}
            />

            {/* Achievements */}
            {userData.achievements && (
              <Achievements achievements={userData.achievements} />
            )}

            {/* Status Description */}
            <div className="text-center py-2">
              <p className="text-gray-400 text-xs italic">
                "{RANK_DESCRIPTIONS[userData.rank]}"
              </p>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-2 mt-auto">
              {mintStatus === 'success' ? (
                <div className="p-3 bg-green-500/20 border border-green-500/50 rounded-lg text-center space-y-2">
                  <div className="flex items-center justify-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    <p className="text-green-400 font-bold text-sm">Successfully Minted!</p>
                  </div>
                  <p className="text-[10px] text-green-300">Your NFT is now in your wallet</p>
                  {mintTxHash && (
                    <button
                      onClick={() => openUrl(`https://basescan.org/tx/${mintTxHash}`)}
                      className="text-[10px] text-base-blue hover:underline flex items-center justify-center gap-1"
                    >
                      View on Basescan <ExternalLink className="w-3 h-3" />
                    </button>
                  )}
                  <button
                    onClick={() => openUrl('https://opensea.io/account')}
                    className="w-full mt-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white text-xs font-semibold transition"
                  >
                    View on OpenSea
                  </button>
                </div>
              ) : mintStatus === 'error' ? (
                <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-center space-y-2">
                  <p className="text-red-400 font-bold text-sm">Mint Failed</p>
                  <p className="text-[10px] text-red-300">{mintError || 'Transaction was rejected or failed'}</p>
                  <Button 
                    variant="secondary" 
                    onClick={() => setMintStatus('idle')}
                    className="!text-xs !py-1.5"
                  >
                    Try Again
                  </Button>
                </div>
              ) : (
                <Button 
                  variant="mint" 
                  onClick={handleMint}
                  className="w-full !text-sm !py-2.5" 
                  icon={<Zap className="w-4 h-4 fill-current" />}
                  disabled={mintStatus === 'pending' || isMinting}
                >
                  {mintStatus === 'pending' || isMinting ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Confirming in Wallet...
                    </span>
                  ) : (
                    `Mint Genesis NFT (${MINT_PRICE} ETH)`
                  )}
                </Button>
              )}
              
              <div className="grid grid-cols-2 gap-2">
                <Button 
                  variant="secondary" 
                  onClick={handleShare}
                  className="!text-xs !py-2" 
                  icon={<Share2 className="w-3.5 h-3.5" />}
                >
                  Share
                </Button>
                <Button 
                  variant="secondary" 
                  onClick={handleViewOnBasescan}
                  className="!text-xs !py-2" 
                  icon={<ExternalLink className="w-3.5 h-3.5" />}
                >
                  Basescan
                </Button>
              </div>
              
              <div className="flex items-center justify-center gap-4 pt-1">
                <button 
                  onClick={() => setAppState('LEADERBOARD')}
                  className="text-[10px] text-gray-500 hover:text-white flex items-center gap-1 transition"
                >
                  <Trophy className="w-3 h-3" /> Leaderboard
                </button>
                <button 
                  onClick={handleReset}
                  className="text-[10px] text-gray-500 hover:text-white transition"
                >
                  Check another
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="relative z-10 px-4 py-2 border-t border-white/5 text-center">
        <p className="text-[10px] text-gray-600">
          Built on Base • Powered by Farcaster
        </p>
      </footer>
    </div>
  );
};

export default App;
