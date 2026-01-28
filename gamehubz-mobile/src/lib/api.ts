import { Platform } from 'react-native';

// For Android emulators, localhost is 10.0.2.2
// For iOS simulators and Web, localhost is localhost
// For physical devices, you MUST use your computer's local IP address (e.g., 192.168.1.5)
const getApiHost = () => {
    if (Platform.OS === 'android') {
        return '10.0.2.2';
    }
    // OVO MENJAŠ: Za iPhone (i fizički Android) mora IP adresa tvog kompa
    return '192.168.0.10';
};

export const API_HOST = getApiHost();
export const API_PORT = '5057';
export const API_BASE_URL = `http://${API_HOST}:${API_PORT}`;

export const ENDPOINTS = {
    HUBS: `${API_BASE_URL}/api/Hub/getAll`,
    GET_HUB: (id: string) => `${API_BASE_URL}/api/Hub/${id}`,
    GET_TOURNAMENT_STRUCTURE: (id: string) => `${API_BASE_URL}/api/tournament/${id}/structure`,
    UPDATE_PROFILE: `${API_BASE_URL}/api/user/update`,
    GET_PLAYER_STATS: (id: string) => `${API_BASE_URL}/api/userProfile/${id}/stats`,
    USER_SOCIAL: `${API_BASE_URL}/api/UserSocial`,
    GET_USER_INFO: (id: string) => `${API_BASE_URL}/api/UserProfile/${id}/info`,
    GET_USER_HUBS: (userId: string) => `${API_BASE_URL}/api/Hub/user/${userId}/joined`,
    GET_DISCOVERY_HUBS: (userId: string) => `${API_BASE_URL}/api/Hub/user/${userId}/discovery`,
    GET_PROFILE_TOURNAMENTS: (userId: string) => `${API_BASE_URL}/api/UserProfile/${userId}/tournaments`,
    CREATE_TOURNAMENT: `${API_BASE_URL}/api/tournament`,
    GET_USER_TOURNAMENTS: (userId: string, status: number, page: number, pageSize: number = 10) =>
        `${API_BASE_URL}/api/User/${userId}/tournaments?Status=${status}&Page=${page}&PageSize=${pageSize}`,
    GET_TOURNAMENT: (id: string) => `${API_BASE_URL}/api/tournament/${id}`,
    GET_TOURNAMENT_OVERVIEW: (id: string) => `${API_BASE_URL}/api/tournament/${id}/overview`,
    REGISTER_TOURNAMENT: `${API_BASE_URL}/api/tournamentRegistration`,
    GET_PENDING_REGISTRATIONS: (tournamentId: string) => `${API_BASE_URL}/api/tournamentRegistration/tournament/${tournamentId}/pending`,
    APPROVE_REGISTRATION: `${API_BASE_URL}/api/tournamentRegistration/approve`,
    APPROVE_ALL_REGISTRATIONS: `${API_BASE_URL}/api/tournamentRegistration/approveAll`,
    REJECT_REGISTRATION: `${API_BASE_URL}/api/tournamentRegistration/reject`,
    GET_TOURNAMENT_PARTICIPANTS: (tournamentId: string) => `${API_BASE_URL}/api/TournamentParticipant/tournament/${tournamentId}`,
    CREATE_BRACKET: `${API_BASE_URL}/api/tournament/createBracket`,
    CLOSE_REGISTRATION: (id: string) => `${API_BASE_URL}/api/tournament/${id}/closeRegistration`,
    REPORT_MATCH_RESULT: `${API_BASE_URL}/api/tournament/matchResult`,
    GET_HUB_TOURNAMENTS: (hubId: string, status: number, page: number, pageSize: number = 10) =>
        `${API_BASE_URL}/api/Hub/${hubId}/tournaments?Status=${status}&Page=${page}&PageSize=${pageSize}`,
    FOLLOW_HUB: `${API_BASE_URL}/api/userHub`,
    UNFOLLOW_HUB: (userId: string, hubId: string) => `${API_BASE_URL}/api/userHub/unfollow?userId=${userId}&hubId=${hubId}`,
    UPDATE_HUB: `${API_BASE_URL}/api/hub/update`,
    SUBMIT_MATCH_AVAILABILITY: `${API_BASE_URL}/api/match/availability`,
    GET_MATCH_AVAILABILITY: (matchId: string, userId: string) => `${API_BASE_URL}/api/match/${matchId}/availability/user/${userId}`,
    GET_USER_HOME_MATCHES: (userId: string) => `${API_BASE_URL}/api/match/home/${userId}`,
    CHECK_REGISTRATION: (id: string, userId: string) => `${API_BASE_URL}/api/tournament/${id}/user/${userId}/registred`,
    GET_HUB_ACTIVITY_HOME: `${API_BASE_URL}/api/hubActivity/home`,
    CREATE_HUB: `${API_BASE_URL}/api/hub/create`,
    DELETE_USER_SOCIAL: (id: string) => `${API_BASE_URL}/api/UserSocial/${id}`,
    UPDATE_TOURNAMENT: `${API_BASE_URL}/api/tournament/update`,
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
