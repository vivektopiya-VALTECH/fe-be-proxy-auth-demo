'use client'

import {useEffect, useState} from 'react';
import {useRouter} from 'next/navigation';
import {getTokens, storeTokens, verifyState} from '@/lib/auth';

export default function Page() {
    const router = useRouter();
    const [error, setError] = useState(null);
    const [processing, setProcessing] = useState(true);

    useEffect(() => {
        // Get query parameters from URL directly instead of relying on router.query
        const params = new URLSearchParams(window.location.search);
        const code = params.get('code');
        const state = params.get('state');
        const errorParam = params.get('error');

        const handleCallback = async () => {
            try {
                // Handle errors from Keycloak
                if (errorParam) {
                    setError(`Authentication error: ${errorParam}`);
                    setProcessing(false);
                    return;
                }

                if (!code || !state) {
                    setError('Invalid callback: missing code or state');
                    setProcessing(false);
                    return;
                }

                // Verify the state parameter to prevent CSRF attacks
                if (!verifyState(state)) {
                    setError('Invalid state parameter');
                    setProcessing(false);
                    return;
                }

                // Exchange the authorization code for tokens
                const tokens = await getTokens(code);

                // Store tokens in localStorage
                storeTokens(tokens);

                // Redirect to home page
                router.push('/');
            } catch (error) {
                setError(`Failed to complete authentication: ${error.message}`);
                setProcessing(false);
            }
        };

        // Execute the callback handler if we have the URL parameters
        if (window.location.search) {
            handleCallback();
        } else {
            setError('No authentication parameters found in URL');
            setProcessing(false);
        }
    }, [router]);

    return (
        <div className="flex items-center justify-center min-h-screen">
            {error ? (
                <div className="text-red-500 text-center max-w-md mx-auto p-4">
                    <h1 className="text-2xl font-bold mb-2">Authentication Error</h1>
                    <p className="mb-4">{error}</p>
                    <button
                        className="mt-4 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded"
                        onClick={() => router.push('/')}
                    >
                        Return to Home
                    </button>
                </div>
            ) : (
                <div className="text-center">
                    <h1 className="text-2xl font-bold mb-2">Completing Authentication</h1>
                    <p>Please wait while we complete the authentication process...</p>
                    <div
                        className="mt-4 w-16 h-16 border-t-4 border-blue-500 border-solid rounded-full animate-spin mx-auto"></div>
                </div>
            )}
        </div>
    );
}