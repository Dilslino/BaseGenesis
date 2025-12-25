'use client';

import React, { useState, useMemo } from 'react';
import { Search, Zap, Share2, Trophy, Wallet, Loader2, Medal } from 'lucide-react';
import { FlexCard } from '../components/FlexCard';
import { UserGenesisData, LeaderboardEntry, UserRank } from '../types';
import { RANK_COLORS, MOCK_LEADERBOARD } from '../constants';
import { useAccount, useDisconnect } from 'wagmi';
import { useAppKit } from '@reown/appkit/react';

type Tab = 'status' | 'leaderboard';
type ViewState = 'IDLE' | 'LOADING' | 'RESULT' | 'ERROR';

// Safe helper to get gradient colors
const getRankStyle = (rank?: UserRank | string) => {
  if (!rank || typeof rank !== 'string') return RANK_COLORS[UserRank.UNKNOWN];
  return RANK_COLORS[rank as UserRank] || RANK_COLORS[UserRank.UNKNOWN];
};

export default function Home() {
  // Web3 Hooks
  const { address, isConnected } = useAccount();
  const { open } = useAppKit();
  const { disconnect } = useDisconnect();

  // State
  const [activeTab, setActiveTab] = useState<Tab>('status');
  const [viewState, setViewState] = useState<ViewState>('IDLE');
  const [userData, setUserData] = useState<UserGenesisData | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>(MOCK_LEADERBOARD);
  const [userGlobalRank, setUserGlobalRank] = useState<number | null>(null); // Store the calculated rank
  const [errorMsg, setErrorMsg] = useState('');
  const [loadingText, setLoadingText] = useState('Initializing...');

  // Handlers
  const handleCheck = async () => {
    if (!address) return;

    setViewState('LOADING');
    setErrorMsg('');
    setActiveTab('status'); 
    
    // Tech-loading sequence
    const steps = ["Scanning Chain...", "Indexing History...", "Verifying Rank..."];
    let step = 0;
    const interval = setInterval(() => {
        if (step < steps.length) {
            setLoadingText(steps[step]);
            step++;
        }
    }, 600);

    try {
      const res = await fetch('/api/check-history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address: address }),
      });

      const data = await res.json();
      clearInterval(interval);

      if (!res.ok) {
        throw new Error(data.error || 'Failed to fetch data');
      }

      const newUser = data.userData as UserGenesisData;
      
      // --- RANKING LOGIC (Oldest Transaction = Rank 1) ---
      // 1. Get current static legends
      const currentList = Array.isArray(data.leaderboard) ? data.leaderboard : MOCK_LEADERBOARD;
      
      // 2. Filter out if user already exists in list (to prevent duplicates during dev)
      const listWithoutUser = currentList.filter((item: LeaderboardEntry) => 
        item.address.toLowerCase() !== newUser.address.toLowerCase()
      );

      // 3. Create User Entry
      const userEntry: LeaderboardEntry = {
        rank: 0, // Placeholder, calculated below
        name: "You",
        address: newUser.address,
        status: newUser.rank,
        days: newUser.daysSinceJoined, // More days = Higher Rank
        isLegend: false
      };

      // 4. Combine and Sort DESCENDING by Days (Oldest is first)
      const combinedList = [...listWithoutUser, userEntry];
      combinedList.sort((a, b) => b.days - a.days);

      // 5. Assign Ranks based on new sorted order
      const rankedList = combinedList.map((item, index) => ({
        ...item,
        rank: index + 1
      }));

      // 6. Find the user's new rank
      const myRankEntry = rankedList.find(item => item.address.toLowerCase() === newUser.address.toLowerCase());
      const finalRank = myRankEntry ? myRankEntry.rank : 999;

      // Update State
      setUserData(newUser);
      setLeaderboard(rankedList);
      setUserGlobalRank(finalRank); // Set the real calculated rank
      setViewState('RESULT');

    } catch (err: any) {
      clearInterval(interval);
      console.error(err);
      setErrorMsg(err.message || "An unexpected error occurred.");
      setViewState('ERROR');
    }
  };

  const handleShare = () => {
    if (!userData) return;
    const text = `I am Rank #${userGlobalRank} on BaseGenesis. Joined ${userData.daysSinceJoined} days ago. What's your on-chain status?`;
    const url = `https://warpcast.com/~/compose?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const handleMint = () => {
     alert("Triggering 0.0003 ETH Transaction... (Frame logic)");
  };

  // Helper for safe tab switching
  const switchTab = (tab: Tab) => {
    setActiveTab(tab);
  };

  const resetApp = () => {
    setViewState('IDLE');
    setUserData(null);
    setUserGlobalRank(null);
  };

  // --- RENDERING ---

  // NOT CONNECTED VIEW
  if (!isConnected) {
    return (
      <main className="h-[100dvh] w-full bg-[#020205] text-white font-sans flex flex-col relative overflow-hidden">
         {/* Background Ambience */}
         <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[500px] bg-blue-600/10 blur-[100px] rounded-full pointer-events-none" />
         
         <div className="flex-1 flex flex-col items-center justify-center px-6 text-center z-10 space-y-8 animate-fade-in-up">
            <div className="w-16 h-16 rounded-2xl bg-blue-600 flex items-center justify-center shadow-[0_0_40px_rgba(37,99,235,0.4)] mb-4">
               <span className="font-black text-3xl text-white">B</span>
            </div>
            
            <div className="space-y-4">
                <h1 className="text-5xl font-black tracking-tighter leading-[0.9]">
                  Base<br/>Genesis
                </h1>
                <p className="text-gray-400 text-lg leading-relaxed max-w-[280px] mx-auto">
                  Your history is immutable. <br/>
                  <span className="text-blue-400">Discover your OG Status.</span>
                </p>
            </div>

            <div className="grid grid-cols-2 gap-4 w-full max-w-xs opacity-60 pt-4">
                <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                    <div className="text-2xl font-bold text-white">142K+</div>
                    <div className="text-[10px] uppercase text-gray-500 tracking-wider font-bold">Identities</div>
                </div>
                <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                    <div className="text-2xl font-bold text-white">Aug '23</div>
                    <div className="text-[10px] uppercase text-gray-500 tracking-wider font-bold">Launch</div>
                </div>
            </div>
         </div>

         {/* Fixed Bottom Action Bar */}
         <div className="p-4 pb-safe bg-[#020205]/80 backdrop-blur-xl border-t border-white/10 z-20">
            <button
                onClick={() => open()}
                className="w-full bg-blue-600 text-white font-bold py-4 rounded-2xl shadow-[0_0_20px_rgba(37,99,235,0.4)] active:scale-[0.98] transition-transform flex items-center justify-center gap-3"
            >
                <Wallet className="w-6 h-6" />
                <span>Connect Wallet</span>
            </button>
         </div>
      </main>
    );
  }

  // CONNECTED VIEW
  return (
    <main className="h-[100dvh] w-full bg-[#020205] text-white font-sans flex flex-col overflow-hidden">
      
      {/* --- COMPACT HEADER --- */}
      <header className="w-full px-4 py-3 pt-safe flex justify-between items-center z-30 bg-[#020205]/90 backdrop-blur-xl border-b border-white/5 shrink-0">
        <div className="flex items-center gap-2" onClick={resetApp}>
           <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center shadow-lg">
             <span className="font-bold text-white text-sm">B</span>
           </div>
           <span className="font-bold text-base tracking-tight">BaseGenesis</span>
        </div>
        
        {/* Wallet Button */}
        <button 
            onClick={() => open()} 
            className="flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-full border border-white/10 transition-all active:scale-95"
        >
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.5)]"></div>
            <span className="font-mono text-xs font-medium text-gray-300">
                {address?.slice(0, 4)}...{address?.slice(-4)}
            </span>
        </button>
      </header>

      {/* --- SEGMENTED TABS --- */}
      <div className="px-4 py-3 w-full z-20 bg-[#020205] shrink-0">
        <div className="bg-white/5 p-1 rounded-xl flex border border-white/10 relative">
          <button 
            onClick={() => switchTab('status')}
            className={`flex-1 py-2 text-xs font-bold uppercase tracking-wide rounded-lg transition-all duration-300 ${activeTab === 'status' ? 'bg-white text-black shadow-md' : 'text-gray-500'}`}
          >
            My Status
          </button>
          <button 
             onClick={() => switchTab('leaderboard')}
            className={`flex-1 py-2 text-xs font-bold uppercase tracking-wide rounded-lg transition-all duration-300 ${activeTab === 'leaderboard' ? 'bg-white text-black shadow-md' : 'text-gray-500'}`}
          >
            Hall of Fame
          </button>
        </div>
      </div>

      {/* --- SCROLLABLE CONTENT AREA --- */}
      <div className="flex-1 w-full relative overflow-y-auto no-scrollbar pb-safe px-4">
        
        {/* === TAB 1: STATUS === */}
        {activeTab === 'status' && (
          <div className="flex flex-col gap-6 animate-fade-in pb-24">
            
            {viewState === 'IDLE' && (
              <div className="text-center mt-8 space-y-8">
                 <div className="p-6 bg-gradient-to-br from-blue-900/20 to-purple-900/20 rounded-3xl border border-white/5">
                    <Medal className="w-12 h-12 text-blue-500 mx-auto mb-4 opacity-80" />
                    <h2 className="text-2xl font-bold text-white mb-2">Ready to Analyze</h2>
                    <p className="text-sm text-gray-400 leading-relaxed mb-6">
                        We will check the first transaction of <br/>
                        <span className="font-mono text-blue-300">{address?.slice(0,6)}...{address?.slice(-4)}</span>
                    </p>
                    <button
                        onClick={handleCheck}
                        className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-2xl shadow-lg shadow-blue-600/20 transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
                     >
                        <Zap className="w-5 h-5 fill-white" />
                        <span>Reveal My Rank</span>
                     </button>
                 </div>
              </div>
            )}

            {viewState === 'LOADING' && (
               <div className="flex flex-col items-center justify-center h-[50vh] space-y-6 animate-fade-in">
                   <div className="relative">
                       <div className="w-16 h-16 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin"></div>
                       <div className="absolute inset-0 flex items-center justify-center">
                           <Loader2 className="w-6 h-6 text-blue-500 animate-pulse" />
                       </div>
                   </div>
                   <div className="font-mono text-blue-400 text-xs animate-pulse tracking-widest uppercase">{loadingText}</div>
               </div>
            )}

            {viewState === 'ERROR' && (
                <div className="mt-8 p-6 bg-red-500/10 border border-red-500/20 rounded-2xl text-center animate-fade-in">
                    <h3 className="text-red-400 font-bold mb-2">Analysis Failed</h3>
                    <p className="text-gray-400 text-sm mb-6">{errorMsg}</p>
                    <button 
                        onClick={() => setViewState('IDLE')} 
                        className="px-6 py-3 bg-white/10 rounded-xl text-sm font-semibold hover:bg-white/20 transition text-white w-full"
                    >
                        Try Again
                    </button>
                </div>
            )}

            {viewState === 'RESULT' && userData && (
               <div className="animate-fade-in-up space-y-6">
                  <div className="transform transition-all duration-500 mt-2 px-1">
                    <FlexCard data={userData} />
                  </div>
                  
                  <div className="bg-white/5 border border-white/10 rounded-3xl p-6 space-y-4 backdrop-blur-sm">
                     <div>
                        <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                            <Trophy className="w-5 h-5 text-yellow-500" />
                            Your Legacy
                        </h3>
                        <p className="text-sm text-gray-400 leading-relaxed">
                            {userData.rank === 'GENESIS PIONEER' && "You were there when the blocks began. A true founder."}
                            {userData.rank === 'EARLY SETTLER' && "You arrived before the hype. A builder of foundations."}
                            {userData.rank === 'BASE CITIZEN' && "You are fueling the future of the Superchain."}
                        </p>
                     </div>
                     
                     {/* DYNAMIC RANK DISPLAY */}
                     <div className="bg-blue-900/20 border border-blue-500/20 rounded-xl p-4 flex items-center justify-between">
                        <div>
                          <p className="text-xs text-blue-300 uppercase tracking-widest font-bold">Calculated Rank</p>
                          <p className="text-2xl font-mono font-black text-white">#{userGlobalRank ?? '-'}</p>
                        </div>
                        <Trophy className="w-8 h-8 text-yellow-500 opacity-80" />
                     </div>
                     
                     <div className="flex flex-col gap-3 pt-2">
                        <button 
                            onClick={handleMint}
                            className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl font-bold text-white shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
                        >
                            <Zap className="w-5 h-5 fill-white" /> Mint Genesis Card ($1)
                        </button>
                        
                        <button 
                            onClick={handleShare}
                            className="w-full py-4 bg-white/5 border border-white/10 rounded-2xl font-semibold text-white hover:bg-white/10 transition-colors flex items-center justify-center gap-2 active:scale-[0.98]"
                        >
                            <Share2 className="w-4 h-4" /> Share Flex
                        </button>
                     </div>
                  </div>
               </div>
            )}
          </div>
        )}

        {/* === TAB 2: LEADERBOARD === */}
        {activeTab === 'leaderboard' && (
            <div className="animate-fade-in pb-24">
                {/* STICKY USER RANK */}
                {userData ? (
                    <div className="sticky top-0 z-10 pt-2 pb-4 bg-[#020205] shadow-[0_10px_30px_-10px_rgba(0,0,0,0.8)] -mx-4 px-4">
                        <div className="bg-gradient-to-r from-blue-900/60 to-blue-800/40 border border-blue-500/30 p-4 rounded-2xl flex items-center justify-between backdrop-blur-md relative overflow-hidden">
                             <div className="flex items-center gap-4">
                                <div className="flex flex-col items-center justify-center w-10">
                                    <span className="text-[10px] text-blue-300 uppercase font-bold">Rank</span>
                                    <span className="text-xl font-black text-white">#{userGlobalRank}</span>
                                </div>
                                <div className="h-8 w-px bg-blue-500/30"></div>
                                <div>
                                    <div className="text-sm font-bold text-white flex items-center gap-1">
                                        You
                                        <div className="w-2 h-2 rounded-full bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.6)]"></div>
                                    </div>
                                    <div className="text-xs text-blue-200 font-mono opacity-80">{userData.daysSinceJoined} Days</div>
                                </div>
                             </div>
                             <div className="px-3 py-1 bg-blue-500/20 rounded-lg text-[10px] font-mono text-blue-200 border border-blue-500/30 font-bold">
                                {userData.rank === 'GENESIS PIONEER' ? 'PIONEER' : userData.rank === 'EARLY SETTLER' ? 'SETTLER' : 'CITIZEN'}
                             </div>
                        </div>
                    </div>
                ) : (
                    <div className="p-6 bg-white/5 border border-white/5 rounded-2xl text-center mb-6">
                         <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-2">
                             <Search className="w-4 h-4 text-gray-400" />
                         </div>
                        <p className="text-sm text-gray-400">Connect wallet to see your rank</p>
                    </div>
                )}

                {/* SCROLLABLE LIST */}
                <div className="space-y-3">
                    {leaderboard && leaderboard.length > 0 ? leaderboard.map((entry) => (
                        <div key={entry.address} className={`bg-white/10 border border-white/10 p-4 rounded-2xl flex items-center justify-between active:scale-[0.99] transition-transform ${entry.name === 'You' ? 'bg-blue-600/20 border-blue-500/50' : 'hover:bg-white/15'}`}>
                            <div className="flex items-center gap-4">
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs border ${entry.rank <= 3 ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50' : 'bg-white/10 text-gray-400 border-white/10'}`}>
                                    {entry.rank}
                                </div>
                                <div>
                                    <div className="text-sm font-bold text-white flex items-center gap-1">
                                        {entry.name}
                                        {entry.isLegend && <Trophy className="w-3 h-3 text-yellow-500" />}
                                    </div>
                                    <div className="text-[10px] text-gray-400 font-mono">{entry.address.slice(0,6)}...{entry.address.slice(-4)}</div>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-sm font-bold text-white font-mono">{entry.days}d</div>
                                <div className={`text-[9px] font-bold tracking-wide uppercase ${getRankStyle(entry.status).includes('via-') ? 'text-transparent bg-clip-text bg-gradient-to-r ' + getRankStyle(entry.status) : 'text-gray-400'}`}>
                                    {entry.status === 'GENESIS PIONEER' ? 'Pioneer' : entry.status === 'EARLY SETTLER' ? 'Settler' : 'Citizen'}
                                </div>
                            </div>
                        </div>
                    )) : (
                        <div className="text-center text-gray-500 py-10">Loading Leaderboard...</div>
                    )}
                </div>
            </div>
        )}

      </div>
    </main>
  );
}