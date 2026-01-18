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
    GET_USER_HUBS: (userId: string) => `${API_BASE_URL}/api/Hub/user/${userId}`,
    CREATE_TOURNAMENT: `${API_BASE_URL}/api/tournament`,
    GET_USER_TOURNAMENTS: (userId: string, status: number, page: number, pageSize: number = 10) =>
        `${API_BASE_URL}/api/User/${userId}/tournaments?Status=${status}&Page=${page}&PageSize=${pageSize}`,
    GET_TOURNAMENT: (id: string) => `${API_BASE_URL}/api/tournament/${id}`,
    REGISTER_TOURNAMENT: `${API_BASE_URL}/api/tournamentRegistration`,
    GET_PENDING_REGISTRATIONS: (tournamentId: string) => `${API_BASE_URL}/api/tournamentRegistration/tournament/${tournamentId}/pending`,
    APPROVE_REGISTRATION: `${API_BASE_URL}/api/tournamentRegistration/approve`,
    REJECT_REGISTRATION: `${API_BASE_URL}/api/tournamentRegistration/reject`,
    GET_TOURNAMENT_PARTICIPANTS: (tournamentId: string) => `${API_BASE_URL}/api/TournamentParticipant/tournament/${tournamentId}`,
    CREATE_BRACKET: (tournamentId: string) => `${API_BASE_URL}/api/tournament/${tournamentId}/createBracket`,
    REPORT_MATCH_RESULT: `${API_BASE_URL}/api/tournament/matchResult`,
};

let authToken: string | null = null;

export const setAuthToken = (token: string | null) => {
    authToken = token;
};

export const authenticatedFetch = async (url: string, options: RequestInit = {}) => {
    const headers = new Headers(options.headers);
    if (authToken) {
        headers.set('Authorization', `Bearer ${authToken}`);
    } else {
        console.warn(`[API] authenticatedFetch called without token for: ${url}`);
    }

    // Default to json content type if not set (for POST/PUT)
    if (!headers.has('Content-Type') && (options.method === 'POST' || options.method === 'PUT')) {
        headers.set('Content-Type', 'application/json');
    }

    console.log(`[API] ${options.method || 'GET'} -> ${url} (Auth: ${!!authToken})`);

    return fetch(url, {
        ...options,
        headers,
    });
};
