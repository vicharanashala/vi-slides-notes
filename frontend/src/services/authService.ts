import api from './api';

export interface User {
    id: string;
    name: string;
    email: string;
    role: 'Teacher' | 'Student';
    avatar?: string;
}

export interface RegisterData {
    name: string;
    email: string;
    password: string;
    role: 'Teacher' | 'Student';
}

export interface LoginData {
    email: string;
    password: string;
}

export interface AuthResponse {
    success: boolean;
    token: string;
    user: User;
}

export const authService = {
    // Register new user
    register: async (data: RegisterData): Promise<AuthResponse> => {
        const response = await api.post<AuthResponse>('/auth/register', data);
        return response.data;
    },

    // Login user
    login: async (data: LoginData): Promise<AuthResponse> => {
        const response = await api.post<AuthResponse>('/auth/login', data);
        return response.data;
    },

    // Get current user
    getCurrentUser: async (): Promise<{ success: boolean; user: User }> => {
        const response = await api.get('/auth/me');
        return response.data;
    },

    // Update user details
    updateDetails: async (data: { name: string; email: string }): Promise<{ success: boolean; user: User }> => {
        const response = await api.put('/auth/updatedetails', data);
        return response.data;
    },

    // Google Login
    googleLogin: async (token: string, role?: string): Promise<AuthResponse> => {
        const response = await api.post<AuthResponse>('/auth/google', { token, role });
        return response.data;
    },

    // Get full profile
    getProfile: async (): Promise<{ 
        success: boolean; 
        user: User & { 
            points: number; 
            createdAt: string;
            connections?: { github?: string; linkedin?: string }
        } 
    }> => {
        const response = await api.get('/auth/profile');
        return response.data;
    },

    // Change password
    changePassword: async (data: {
        currentPassword: string;
        newPassword: string;
        confirmPassword: string;
    }): Promise<{ success: boolean; message: string }> => {
        const response = await api.put('/auth/changepassword', data);
        return response.data;
    },

    // Update avatar
    updateAvatar: async (avatar: string): Promise<{ success: boolean; user: User; message: string }> => {
        const response = await api.put('/auth/updateavatar', { avatar });
        return response.data;
    },

    // Delete account
    deleteAccount: async (): Promise<{ success: boolean; message: string }> => {
        const response = await api.delete('/auth/deleteaccount');
        return response.data;
    },

    // Save connections (GitHub, LinkedIn)
    saveConnections: async (connections: { github?: string; linkedin?: string }): Promise<{ success: boolean; connections: any }> => {
        const response = await api.put('/auth/connections', connections);
        return response.data;
    }
};
