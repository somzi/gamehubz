import React, { createContext, useContext, useState, ReactNode, useMemo, useEffect, useCallback, useRef } from 'react';
import { User, AuthResponse, UserSocial } from '../types/auth';
import { API_BASE_URL, ENDPOINTS, setAuthToken, authenticatedFetch } from '../lib/api';

interface AuthContextType {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<boolean>;
    register: (data: any) => Promise<boolean>;
    logout: () => void;
    updateProfile: (data: any) => Promise<boolean>;
    saveUserSocial: (social: UserSocial) => Promise<boolean>;
    refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, _setUser] = useState<User | null>(null);
    const setUser = (newUser: User | null | ((prev: User | null) => User | null)) => {
        if (typeof newUser === 'function') {
            _setUser(prev => {
                const val = (newUser as (prev: User | null) => User | null)(prev);
                console.log(`[AuthContext] setUser (functional) - New User: ${val?.username}, Auth: ${!!val}`);
                return val;
            });
        } else {
            console.log(`[AuthContext] setUser (direct) - New User: ${newUser?.username}, Auth: ${!!newUser}`);
            _setUser(newUser);
        }
    };
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const login = useCallback(async (email: string, password: string): Promise<boolean> => {
        setIsLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/api/Auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            const text = await response.text();
            let data: AuthResponse;

            try {
                data = JSON.parse(text);
            } catch (e) {
                console.error('Failed to parse login response:', text);
                return false;
            }

            if (data.isSuccessful && data.accessToken?.token) {
                setToken(data.accessToken.token);
                setAuthToken(data.accessToken.token);
                setUser(data.user);
                return true;
            } else {
                console.error('Login failed:', data.messages);
                return false;
            }
        } catch (error) {
            console.error('Login error:', error);
            return false;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const register = useCallback(async (formData: any): Promise<boolean> => {
        setIsLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/api/Auth/registerUser`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            const text = await response.text();

            if (response.ok) {
                return true;
            } else {
                let errorMessage = text;
                try {
                    const errorData = JSON.parse(text);
                    errorMessage = errorData.messages || errorData;
                } catch (e) { }
                console.error('Register failed response:', errorMessage);
                return false;
            }
        } catch (error) {
            console.error('Register error:', error);
            return false;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const logout = useCallback(() => {
        setUser(null);
        setToken(null);
        setAuthToken(null);
    }, []);

    const updateProfile = useCallback(async (data: any): Promise<boolean> => {
        setIsLoading(true);
        try {
            const response = await authenticatedFetch(ENDPOINTS.UPDATE_PROFILE, {
                method: 'POST',
                body: JSON.stringify(data),
            });

            if (response.ok) {
                try {
                    const updatedUser: User = await response.json();
                    setUser(updatedUser);
                } catch (e) { }
                return true;
            }
            return false;
        } catch (error) {
            console.error('Update profile error:', error);
            return false;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const saveUserSocial = useCallback(async (social: UserSocial): Promise<boolean> => {
        if (!user?.id) return false;

        setIsLoading(true);
        try {
            const payload: any = {
                type: social.socialType,
                username: social.username,
                userId: user.id
            };

            if (social.id) {
                payload.id = social.id;
            }

            const response = await authenticatedFetch(ENDPOINTS.USER_SOCIAL, {
                method: 'POST',
                body: JSON.stringify(payload),
            });

            if (response.ok) {
                const savedSocial: UserSocial = await response.json();

                setUser(prev => {
                    if (!prev) return null;
                    const socialType = savedSocial.type !== undefined ? savedSocial.type : savedSocial.socialType;
                    console.log(`[AuthContext] Updating social account. Type: ${socialType}, Internal ID: ${savedSocial.id}`);

                    const currentSocials = prev.userSocials || [];
                    const existingIndex = currentSocials.findIndex(s => {
                        const sType = s.socialType !== undefined ? s.socialType : s.type;
                        return sType === socialType;
                    });
                    let newSocials = [...currentSocials];

                    const normalizedSocial = {
                        ...savedSocial,
                        socialType: socialType
                    };

                    if (existingIndex >= 0) {
                        newSocials[existingIndex] = normalizedSocial;
                    } else {
                        newSocials.push(normalizedSocial);
                    }

                    return { ...prev, userSocials: newSocials };
                });
                return true;
            }
            return false;
        } catch (error) {
            console.error('Save user social error:', error);
            return false;
        } finally {
            setIsLoading(false);
        }
    }, [user?.id]);

    const refreshUser = useCallback(async () => {
        if (!user?.id) return;
        try {
            const response = await authenticatedFetch(ENDPOINTS.GET_USER_INFO(user.id));
            if (response.ok) {
                const userInfo = await response.json();
                const normalizedSocials = (userInfo.userSocials || []).map((s: any) => ({
                    ...s,
                    socialType: s.type !== undefined ? s.type : s.socialType
                }));

                console.log(`[AuthContext] Refreshing user info. Socials count: ${normalizedSocials.length}`);

                setUser(prev => {
                    if (!prev) return null;
                    return {
                        ...prev,
                        username: userInfo.username,
                        region: userInfo.region,
                        userSocials: normalizedSocials
                    };
                });
            }
        } catch (error) {
            console.error('Refresh user error:', error);
        }
    }, [user?.id]);

    useEffect(() => {
        console.log(`[AuthContext] Syncing token with API. Token exists: ${!!token}`);
        setAuthToken(token);
    }, [token]);

    const authContextValue = useMemo(() => ({
        user,
        token,
        isAuthenticated: !!user && !!token,
        isLoading,
        login,
        register,
        logout,
        updateProfile,
        saveUserSocial,
        refreshUser,
    }), [user, token, isLoading, login, register, logout, updateProfile, saveUserSocial, refreshUser]);

    return (
        <AuthContext.Provider value={authContextValue}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
