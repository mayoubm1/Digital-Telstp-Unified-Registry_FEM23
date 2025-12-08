import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Globe, Users, MessageSquare, Zap, Activity, LogIn } from 'lucide-react';

interface ApiResponse {
  success: boolean;
  data?: any[];
  error?: string;
}

// Environment variables are declared outside the component or at the top level
const API_BASE = import.meta.env.VITE_API_URL || 'https://telstp-ai-agent-globe.vercel.app';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY; // <-- CORRECT LOCATION

// New AuthButton Component
const AuthButton = () => {
  // Placeholder for future authentication state (e.g., from a context or global store)
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleAuthClick = () => {
    if (isAuthenticated) {
      // Future: Implement sign out logic
      alert('Signing out...');
      setIsAuthenticated(false);
    } else {
      // Future: Implement sign in logic (e.g., redirect to Supabase Auth UI)
      alert('Redirecting to Sign In/Hub Access...');
      setIsAuthenticated(true); // Mock sign in for now
    }
  };

  return (
    <button 
      onClick={handleAuthClick}
      className="ml-4 px-3 py-1 text-sm font-medium text-white bg-cyan-600 rounded-md hover:bg-cyan-700 transition-colors flex items-center gap-1"
    >
      <LogIn className="w-4 h-4" />
      {isAuthenticated ? 'Sign Out' : 'Sign In / Hub Access'}
    </button>
  );
};

export default function App() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>({});
  const [platforms, setPlatforms] = useState<any[]>([]);
  const [workspaces, setWorkspaces] = useState<any[]>([]);
  const [isWorkspaceActive, setIsWorkspaceActive] = useState<number | null>(null);

  const handleWorkspaceClick = (id: number, name: string) => {
    setIsWorkspaceActive(id);
    alert(`Navigating to workspace: ${name}`);
  };
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError('');

        // CRITICAL FIX: Create an axios instance with the Authorization header
        const api = axios.create({
          baseURL: API_BASE,
          headers: {
            // Use the Anon Key for initial unauthenticated access to the Edge Function
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`, 
            'Content-Type': 'application/json',
          },
        });

        // Fetch stats
        const statsRes = await api.get(`/stats`); 
        if (statsRes.data.success) {
          setStats(statsRes.data.stats);
        }

        // Fetch platforms
        const platformsRes = await api.get(`/platforms`); 
        if (platformsRes.data.success) {
          setPlatforms(platformsRes.data.data || []);
        }

        // Fetch workspaces
        const workspacesRes = await api.get(`/workspaces`); 
        if (workspacesRes.data.success) {
          setWorkspaces(workspacesRes.data.data || []);
        }
      } catch (err: any) {
        let errorMessage = 'Failed to fetch data';
        if (err.response && err.response.status === 401) {
          errorMessage = 'Authentication Error: Supabase Anon Key may be invalid or missing.';
        } else if (err.message) {
          errorMessage = err.message;
        }
        setError(errorMessage);
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    // Refresh every 30 seconds
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []); // Empty dependency array means this runs once on mount

  return (
    // ... (Rest of the JSX remains the same)
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="bg-slate-900/50 backdrop-blur-md border-b border-slate-700/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Globe className="w-8 h-8 text-cyan-400" />
              <div>
                <h1 className="text-2xl font-bold text-white">TELsTP OmniCognitor</h1>
                <p className="text-sm text-slate-400">Unified AI Platform - MMAC Edition</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-green-400" />
              <span className="text-sm text-green-400 font-medium">Live</span>
              <AuthButton />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-4 mb-6">
            <p className="text-red-200">⚠️ {error}</p>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto mb-4"></div>
              <p className="text-slate-300">Loading dashboard...</p>
            </div>
          </div>
        ) : (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
              {[
                { label: 'Users', value: stats.users || 0, icon: Users, color: 'cyan' },
                { label: 'Platforms', value: stats.platforms || 0, icon: Zap, color: 'purple' },
                { label: 'Workspaces', value: stats.workspaces || 0, icon: Globe, color: 'blue' },
                { label: 'Messages', value: stats.messages || 0, icon: MessageSquare, color: 'green' },
                { label: 'Conversations', value: stats.conversations || 0, icon: Activity, color: 'orange' },
              ].map((stat) => {
                // Check if all stats are zero to display a helpful message
                const allStatsZero = Object.values(stats).every(val => val === 0 || val === null || val === undefined);
                if (allStatsZero && stat.label === 'Users') {
                  return (
                    <div key="empty-stats" className="col-span-5 bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-lg p-6 text-center">
                      <p className="text-slate-400">Backend data is currently empty. Connect your Supabase tables to the Next.js backend to see real-time stats.</p>
                    </div>
                  );
                }
                if (allStatsZero) return null; // Hide other zero-stats when all are zero

                const Icon = stat.icon;
                return (
                  <div key={stat.label} className="bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-lg p-6 hover:border-slate-600/50 transition">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-slate-400 text-sm font-medium">{stat.label}</p>
                        <p className="text-3xl font-bold text-white mt-2">{stat.value}</p>
                      </div>
                      <Icon className={`w-8 h-8 text-${stat.color}-400 opacity-50`} />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Platforms Section */}
            <div className="bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-lg p-6 mb-8">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Zap className="w-5 h-5 text-purple-400" />
                Connected AI Platforms
              </h2>
              {platforms.length === 0 ? (
                <p className="text-slate-400">No platforms configured yet</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {platforms.slice(0, 8).map((platform) => (
                    <div key={platform.id} className="bg-slate-700/50 rounded-lg p-4 border border-slate-600/50 hover:border-slate-500/50 transition cursor-pointer">
                      <p className="font-semibold text-white">{platform.name}</p>
                      <p className="text-xs text-slate-400 mt-1">{platform.type}</p>
                      <div className="mt-3 flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${platform.is_enabled ? 'bg-green-400' : 'bg-red-400'}`}></div>
                        <span className="text-xs text-slate-300">{platform.is_enabled ? 'Enabled' : 'Disabled'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Workspaces Section */}
            <div className="bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-lg p-6">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Globe className="w-5 h-5 text-cyan-400" />
                Active Workspaces
              </h2>
              {workspaces.length === 0 ? (
                <p className="text-slate-400">No workspaces created yet</p>
              ) : (
                <div className="space-y-3">
                  {workspaces.slice(0, 5).map((workspace) => (
                    <div 
                      key={workspace.id} 
                      className={`bg-slate-700/50 rounded-lg p-4 border transition cursor-pointer ${isWorkspaceActive === workspace.id ? 'border-cyan-500 ring-2 ring-cyan-500/50' : 'border-slate-600/50 hover:border-slate-500/50'}`}
                      onClick={() => handleWorkspaceClick(workspace.id, workspace.name)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-white">{workspace.name}</p>
                          <p className="text-sm text-slate-400 mt-1">{workspace.description || 'No description'}</p>
                        </div>
                        <div className={`px-3 py-1 rounded-full text-xs font-medium ${workspace.is_public ? 'bg-blue-500/20 text-blue-300' : 'bg-slate-600/50 text-slate-300'}`}>
                          {workspace.is_public ? 'Public' : 'Private'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer Info */}
            <div className="mt-8 bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-lg p-4 text-center">
              <p className="text-slate-400 text-sm">
                Deployed by <span className="text-cyan-400 font-bold">MMAC - Manus Mission Accomplished</span>
              </p>
              <p className="text-slate-500 text-xs mt-1">
                Backend: Supabase Edge Functions (100% Free) | Frontend: GitHub Pages (100% Free)
              </p>
            </div>
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-700/50 mt-12 py-6 px-4">
        <div className="max-w-7xl mx-auto text-center text-slate-400 text-sm">
          <p>TELsTP OmniCognitor MVP • Zero Cost • {new Date().toLocaleString()}</p>
        </div>
      </footer>
    </div>
  );
}
