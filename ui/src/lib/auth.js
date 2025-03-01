// File: lib/auth.js

/**
 * Configuration for Keycloak OAuth/OIDC
 */
const keycloakConfig = {
    serverUrl: process.env.NEXT_PUBLIC_KEYCLOAK_URL,
    realm: process.env.NEXT_PUBLIC_KEYCLOAK_REALM,
    clientId: process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID,
    redirectUri: typeof window !== 'undefined' ? `${window.location.origin}/callback` : '',
};

/**
 * Get the authorization URL for Keycloak login
 */
export const getAuthorizationUrl = () => {
    const params = new URLSearchParams({
        client_id: keycloakConfig.clientId,
        redirect_uri: keycloakConfig.redirectUri,
        response_type: 'code',
        scope: 'openid profile email',
        state: generateRandomState(),
    });

    // Store state in localStorage for verification after redirect
    if (typeof window !== 'undefined') {
        localStorage.setItem('auth_state', params.get('state'));
    }

    return `${keycloakConfig.serverUrl}/realms/${keycloakConfig.realm}/protocol/openid-connect/auth?${params.toString()}`;
};

/**
 * Exchange authorization code for tokens
 */
export const getTokens = async (code) => {
    const params = new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: keycloakConfig.clientId,
        redirect_uri: keycloakConfig.redirectUri,
        code,
    });

    try {
        const response = await fetch(
            `${keycloakConfig.serverUrl}/realms/${keycloakConfig.realm}/protocol/openid-connect/token`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: params,
            }
        );

        if (!response.ok) {
            throw new Error('Failed to exchange code for tokens');
        }

        const tokens = await response.json();
        return tokens;
    } catch (error) {
        console.error('Token exchange error:', error);
        throw error;
    }
};

/**
 * Refresh the access token using the refresh token
 */
export const refreshTokens = async (refreshToken) => {
    const params = new URLSearchParams({
        grant_type: 'refresh_token',
        client_id: keycloakConfig.clientId,
        refresh_token: refreshToken,
    });

    try {
        const response = await fetch(
            `${keycloakConfig.serverUrl}/realms/${keycloakConfig.realm}/protocol/openid-connect/token`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: params,
            }
        );

        if (!response.ok) {
            throw new Error('Failed to refresh tokens');
        }

        const tokens = await response.json();
        return tokens;
    } catch (error) {
        console.error('Token refresh error:', error);
        throw error;
    }
};

/**
 * Logout the user
 */
export const logout = () => {
    if (typeof window !== 'undefined') {
        const idToken = localStorage.getItem('id_token');
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('id_token');
        localStorage.removeItem('token_expiry');

        // Redirect to Keycloak logout endpoint
        const params = new URLSearchParams({
            id_token_hint: idToken,
            post_logout_redirect_uri: window.location.origin,
        });

        window.location.href = `${keycloakConfig.serverUrl}/realms/${keycloakConfig.realm}/protocol/openid-connect/logout?${params.toString()}`;
    }
};

/**
 * Check if the user is authenticated
 */
export const isAuthenticated = () => {
    if (typeof window !== 'undefined') {
        const accessToken = localStorage.getItem('access_token');
        const tokenExpiry = localStorage.getItem('token_expiry');

        if (!accessToken || !tokenExpiry) {
            return false;
        }

        // Check if token is expired
        return parseInt(tokenExpiry, 10) > Date.now();
    }
    return false;
};

/**
 * Parse the ID token to get user info
 */
export const getUserInfo = () => {
    if (typeof window !== 'undefined') {
        const idToken = localStorage.getItem('id_token');

        if (!idToken) {
            return null;
        }

        try {
            // ID token is in JWT format (header.payload.signature)
            const payload = idToken.split('.')[1];
            const decodedPayload = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
            return JSON.parse(decodedPayload);
        } catch (error) {
            console.error('Failed to parse ID token:', error);
            return null;
        }
    }
    return null;
};

/**
 * Store tokens in localStorage
 */
export const storeTokens = (tokens) => {
    if (typeof window !== 'undefined') {
        localStorage.setItem('access_token', tokens.access_token);
        localStorage.setItem('refresh_token', tokens.refresh_token);
        localStorage.setItem('id_token', tokens.id_token);

        // Calculate token expiry time
        const expiresIn = tokens.expires_in || 300; // Default to 5 minutes if not specified
        const expiryTime = Date.now() + expiresIn * 1000;
        localStorage.setItem('token_expiry', expiryTime.toString());
    }
};

/**
 * Generate a random state parameter for CSRF protection
 */
function generateRandomState() {
    const array = new Uint8Array(16);
    if (typeof window !== 'undefined') {
        window.crypto.getRandomValues(array);
    }
    return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Verify the state parameter after redirect
 */
export const verifyState = (receivedState) => {
    if (typeof window !== 'undefined') {
        const storedState = localStorage.getItem('auth_state');
        localStorage.removeItem('auth_state'); // Clean up
        return storedState === receivedState;
    }
    return false;
};