import { Platform } from 'react-native';

// For Android emulators, localhost is 10.0.2.2
// For iOS simulators and Web, localhost is localhost
// For physical devices, you MUST use your computer's local IP address (e.g., 192.168.1.5)
const getApiHost = () => {
    if (Platform.OS === 'android') {
        return '10.0.2.2';
    }
    return 'localhost';
};

export const API_HOST = getApiHost();
export const API_PORT = '7057';
export const API_BASE_URL = `http://${API_HOST}:${API_PORT}`;

export const ENDPOINTS = {
    HUBS: `${API_BASE_URL}/api/Hub/getAll`,
    GET_TOURNAMENT_STRUCTURE: (id: string) => `${API_BASE_URL}/api/tournament/${id}/structure`,
    UPDATE_PROFILE: `${API_BASE_URL}/api/Users/updateProfile`,
    GET_PLAYER_STATS: (id: string) => `${API_BASE_URL}/api/userProfile/${id}/stats`,
    USER_SOCIAL: `${API_BASE_URL}/api/UserSocial`,
    GET_USER_INFO: (id: string) => `${API_BASE_URL}/api/UserProfile/${id}/info`,
};

let authToken: string | null = null;

export const setAuthToken = (token: string | null) => {
    authToken = token;
};

export const authenticatedFetch = async (url: string, options: RequestInit = {}) => {
    const headers = new Headers(options.headers);
    if (authToken) {
        headers.set('Authorization', `Bearer ${authToken}`);
    }

    // Default to json content type if not set (for POST/PUT)
    if (!headers.has('Content-Type') && (options.method === 'POST' || options.method === 'PUT')) {
        headers.set('Content-Type', 'application/json');
    }

    return fetch(url, {
        ...options,
        headers,
    });
};
