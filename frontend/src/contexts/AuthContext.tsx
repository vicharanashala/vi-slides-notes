import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService, User, GoogleAuthData } from '../services/authService';

interface AuthContextType {
    user: User | null;
    loading: boolean;
    googleLogin: (data: GoogleAuthData) => Promise<void>;
    logout: () => void;
    updateUser: (user: User) => void;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    const authStorage = localStorage;

    useEffect(() => {
        const initAuth = async () => {
            const token = authStorage.getItem('token');
            const storedUser = authStorage.getItem('user');

            if (token && storedUser) {
                try {
                    const response = await authService.getCurrentUser();
                    setUser(response.user);
                } catch (error) {
                    authStorage.removeItem('token');
                    authStorage.removeItem('user');
                }
            }
            setLoading(false);
        };

        initAuth();
    }, []);

    const googleLogin = async (data: GoogleAuthData) => {
        const response = await authService.googleLogin(data);
        authStorage.setItem('token', response.token);
        authStorage.setItem('user', JSON.stringify(response.user));
        setUser(response.user);
    };

    const logout = () => {
        authStorage.removeItem('token');
        authStorage.removeItem('user');
        setUser(null);
    };

    const updateUser = (updatedUser: User) => {
        authStorage.setItem('user', JSON.stringify(updatedUser));
        setUser(updatedUser);
    };

    const value: AuthContextType = {
        user,
        loading,
        googleLogin,
        logout,
        updateUser,
        isAuthenticated: !!user
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
