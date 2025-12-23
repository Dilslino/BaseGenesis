import { useState, useCallback } from 'react';
import sdk from '@farcaster/frame-sdk';

interface AuthState {
  token: string | null;
  fid: number | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

interface UseQuickAuthResult extends AuthState {
  signIn: () => Promise<boolean>;
  signOut: () => void;
  authenticatedFetch: (url: string, options?: RequestInit) => Promise<Response>;
}

const BACKEND_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://basegenesis.vercel.app';

export const useQuickAuth = (): UseQuickAuthResult => {
  const [state, setState] = useState<AuthState>({
    token: null,
    fid: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
  });

  const signIn = useCallback(async (): Promise<boolean> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // Get JWT token from Farcaster Quick Auth
      const { token } = await sdk.experimental.quickAuth.getToken();
      
      // Verify token with our backend
      const response = await fetch(`${BACKEND_URL}/api/auth`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Authentication verification failed');
      }

      const data = await response.json();

      setState({
        token,
        fid: data.fid,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });

      return true;
    } catch (error: any) {
      console.error('Quick Auth error:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error.message || 'Authentication failed',
      }));
      return false;
    }
  }, []);

  const signOut = useCallback(() => {
    setState({
      token: null,
      fid: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });
  }, []);

  // Authenticated fetch helper - automatically includes JWT
  const authenticatedFetch = useCallback(async (url: string, options: RequestInit = {}): Promise<Response> => {
    if (!state.token) {
      throw new Error('Not authenticated');
    }

    const headers = new Headers(options.headers);
    headers.set('Authorization', `Bearer ${state.token}`);

    return fetch(url, {
      ...options,
      headers,
    });
  }, [state.token]);

  return {
    ...state,
    signIn,
    signOut,
    authenticatedFetch,
  };
};
