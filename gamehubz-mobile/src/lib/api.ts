import { Platform } from 'react-native';

// Hardcoded for now as requested by user
export const API_HOST = 'localhost';
export const API_PORT = '7057';
export const API_BASE_URL = `http://${API_HOST}:${API_PORT}`;

export const ENDPOINTS = {
    HUBS: `${API_BASE_URL}/api/Hub/getAll`,
};
