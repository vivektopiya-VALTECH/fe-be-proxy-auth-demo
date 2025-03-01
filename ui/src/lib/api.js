export const fetchVehicles = async () => {
    // Get the access token from localStorage
    const accessToken = localStorage.getItem('access_token');

    // Check if the token exists
    if (!accessToken) {
        throw new Error('No access token found. Please log in first.');
    }

    try {
        const response = await fetch('http://localhost:9090/api/v1/vehicle', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
        });

        // Handle HTTP errors
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`API request failed: ${response.status} ${response.statusText} - ${errorText}`);
        }

        // Parse and return the JSON response
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching vehicles:', error);
        throw error;
    }
};

/**
 * Example function to use the API call
 */
export const getVehicleData = async () => {
    try {
        const vehicles = await fetchVehicles();
        console.log('Vehicles:', vehicles);
        return vehicles;
    } catch (error) {
        // You might want to handle auth errors by redirecting to login
        if (error.message.includes('No access token found') ||
            (error.message.includes('API request failed') && error.message.includes('401'))) {
            console.log('Authentication error, redirecting to login...');
            // Redirect to login or handle as needed
        }
        return { error: error.message };
    }
};