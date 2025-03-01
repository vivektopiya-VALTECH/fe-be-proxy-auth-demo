'use client'
import {useEffect, createContext, useContext, useState} from 'react';
import {isAuthenticated, refreshTokens, storeTokens} from '@/lib/auth';

const AuthContext = createContext(null);

export function AuthProvider({children}) {
    const [isLoading, setIsLoading] = useState(true);
    const [authenticated, setAuthenticated] = useState(false);

    useEffect(() => {
        const checkAndRefreshAuth = async () => {
            setIsLoading(true);

            if (isAuthenticated()) {
                setAuthenticated(true);

                // Set up token refresh
                setupTokenRefresh();
            } else {
                setAuthenticated(false);
            }

            setIsLoading(false);
        };

        checkAndRefreshAuth();
    }, []);

    const setupTokenRefresh = () => {
        if (typeof window !== 'undefined') {
            const tokenExpiry = localStorage.getItem('token_expiry');
            const refreshToken = localStorage.getItem('refresh_token');

            if (!tokenExpiry || !refreshToken) return;

            const expiresAt = parseInt(tokenExpiry, 10);
            const timeUntilExpiry = expiresAt - Date.now();

            // Refresh token 1 minute before expiry
            const refreshTime = Math.max(0, timeUntilExpiry - 60000);

            setTimeout(async () => {
                try {
                    const newTokens = await refreshTokens(refreshToken);
                    storeTokens(newTokens);

                    // Set up the next refresh
                    setupTokenRefresh();
                } catch (error) {
                    console.error('Token refresh failed:', error);
                    setAuthenticated(false);
                }
            }, refreshTime);
        }
    };

    return (
        <AuthContext.Provider value={{isLoading, authenticated, setAuthenticated}}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);