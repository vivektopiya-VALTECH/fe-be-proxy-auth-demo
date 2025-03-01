'use client'

import {useEffect, useState} from 'react';
import {getAuthorizationUrl, getUserInfo, isAuthenticated} from '@/lib/auth';
import Head from 'next/head';
import {useRouter} from "next/navigation";
import {fetchVehicles} from "@/lib/api";

export default function Home() {
    const [authState, setAuthState] = useState({
        isLoading: true,
        isAuthenticated: false,
        userInfo: null
    });

    const [vehicleData, setVehicleData] = useState({
        loading: false,
        data: null,
        error: null
    });
    const [showUserInfo, setShowUserInfo] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const checkAuth = () => {
            if (isAuthenticated()) {
                const userInfo = getUserInfo();
                setAuthState({
                    isLoading: false,
                    isAuthenticated: true,
                    userInfo
                });
            } else {
                setAuthState({
                    isLoading: false,
                    isAuthenticated: false,
                    userInfo: null
                });
            }
        };
        checkAuth();
    }, []);

    const handleLogin = () => {
        window.location.href = getAuthorizationUrl();
    };

    const handleLogout = () => {
        import('../lib/auth').then(({logout}) => {
            logout();
        });
    };

    const handleFetchVehicles = async () => {
        setVehicleData({loading: true, data: null, error: null});
        try {
            const data = await fetchVehicles();
            setVehicleData({loading: false, data, error: null});
        } catch (error) {
            setVehicleData({loading: false, data: null, error: error.message});
            if (error.message.includes('No access token found') ||
                (error.message.includes('API request failed') && error.message.includes('401'))) {
                setAuthState({...authState, isAuthenticated: false});
                alert("Authentication error. Please login again.");
            }
        }
    };

    return (
        <div className="container mx-auto p-4 relative">
            <Head>
                <title>Next.js Keycloak Auth</title>
            </Head>
            <div className="absolute top-4 right-4 flex items-center space-x-4">
                {authState.isAuthenticated && (
                    <>
                            <span className="text-gray-700 font-medium">
                                {authState.userInfo?.preferred_username || authState.userInfo?.name}
                            </span>
                        <button
                            className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded"
                            onClick={handleLogout}
                        >
                            Logout
                        </button>
                    </>
                )}
            </div>
            <main className="flex flex-col items-center justify-center min-h-screen">
                <h1 className="text-2xl font-bold mb-6">NextJS, Keycloak, Spring Cloud Gateway and API Demo</h1>
                {authState.isLoading ? (
                    <p>Checking authentication...</p>
                ) : authState.isAuthenticated ? (
                    <div className="flex flex-col items-center">
                        <p className="text-gray-700 font-medium">Click t get vehicle data via proxy url</p>
                        <button
                            className="bg-green-500 hover:bg-green-600 text-white py-3 px-6 rounded text-lg mb-4"
                            onClick={handleFetchVehicles}
                            disabled={vehicleData.loading}
                        >
                            {vehicleData.loading ? 'Loading Vehicles...' : 'Fetch Vehicles'}
                        </button>
                        <div className="mt-4 p-4 w-full max-w-lg border rounded bg-gray-50 shadow-md">
                            {vehicleData.data && (
                                <>
                                    <h2 className="text-xl font-semibold mb-2">Your Vehicles</h2>
                                    {vehicleData.data.length === 0 ? (
                                        <p>No vehicles found.</p>
                                    ) : (
                                        <pre className="bg-white p-2 rounded overflow-auto text-sm border">
                                                {JSON.stringify(vehicleData.data, null, 2)}
                                            </pre>
                                    )}
                                </>
                            )}
                            {vehicleData.error && (
                                <div className="mt-4 p-4 border border-red-300 bg-red-50 rounded">
                                    <h2 className="text-xl font-semibold mb-2 text-red-600">Error Fetching Vehicles</h2>
                                    <p className="text-red-600">{vehicleData.error}</p>
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <div>
                        <p>You are not logged in.</p>
                        <button
                            className="mt-4 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded"
                            onClick={handleLogin}
                        >
                            Login with Keycloak
                        </button>
                    </div>
                )}
            </main>
            {authState.isAuthenticated && (
                <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 w-full max-w-md">
                    <button
                        className="bg-gray-800 text-white py-2 px-4 w-full rounded-t"
                        onClick={() => setShowUserInfo(!showUserInfo)}
                    >
                        {showUserInfo ? 'Hide' : 'Show'} User Info
                    </button>
                    {showUserInfo && (
                        <div className="bg-white p-4 border border-gray-300 rounded-b shadow-lg">
                                <pre className="text-sm overflow-auto">
                                    {JSON.stringify(authState.userInfo, null, 2)}
                                </pre>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}