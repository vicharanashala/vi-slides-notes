import api from './api';

export interface GuestJoinData {
    code: string;
    name: string;
    email: string;
    question?: string;
}

export interface GuestQuestionData {
    sessionId: string;
    content: string;
    name: string;
    email: string;
}

export interface GuestJoinResponse {
    success: boolean;
    data?: any;
    message?: string;
}

export const guestService = {
    async submitGuestJoin(data: GuestJoinData): Promise<GuestJoinResponse> {
        const response = await api.post('/guest/join', data);
        return response.data;
    },

    async getPublicSessionInfo(code: string): Promise<any> {
        const response = await api.get(`/guest/session/${code}`);
        return response.data;
    },

    async submitGuestQuestion(data: GuestQuestionData): Promise<any> {
        const response = await api.post('/guest/questions', data);
        return response.data;
    },

    async getGuestQuestions(sessionId: string): Promise<any> {
        const response = await api.get(`/guest/questions/${sessionId}`);
        return response.data;
    }
};
