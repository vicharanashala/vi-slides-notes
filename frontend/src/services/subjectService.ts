import api from './api';

export interface Subject {
    _id: string;
    name: string;
    description?: string;
    teacher: { _id: string; name: string; email: string };
    enrolledStudents?: any[];
    pendingRequests?: any[];
    enrolledCount?: number;
    status?: 'enrolled' | 'pending' | 'not_joined';
    ongoingSession?: { _id: string; title: string; code: string; status: string } | null;
    createdAt: string;
}

export const subjectService = {
    createSubject: async (data: { name: string; description?: string }) => {
        const response = await api.post('/subjects', data);
        return response.data;
    },

    getAllSubjects: async (): Promise<{ success: boolean; data: Subject[] }> => {
        const response = await api.get('/subjects');
        return response.data;
    },

    getEnrolledSubjects: async (): Promise<{ success: boolean; data: Subject[] }> => {
        const response = await api.get('/subjects/enrolled');
        return response.data;
    },

    getSubjectById: async (id: string): Promise<{ success: boolean; data: Subject }> => {
        const response = await api.get(`/subjects/${id}`);
        return response.data;
    },

    updateSubject: async (id: string, data: { name?: string; description?: string }) => {
        const response = await api.patch(`/subjects/${id}`, data);
        return response.data;
    },

    deleteSubject: async (id: string) => {
        const response = await api.delete(`/subjects/${id}`);
        return response.data;
    },

    requestToJoin: async (id: string) => {
        const response = await api.post(`/subjects/${id}/request-join`);
        return response.data;
    },

    approveStudent: async (subjectId: string, studentId: string) => {
        const response = await api.patch(`/subjects/${subjectId}/approve/${studentId}`);
        return response.data;
    },

    rejectStudent: async (subjectId: string, studentId: string) => {
        const response = await api.patch(`/subjects/${subjectId}/reject/${studentId}`);
        return response.data;
    },

    removeStudent: async (subjectId: string, studentId: string) => {
        const response = await api.delete(`/subjects/${subjectId}/students/${studentId}`);
        return response.data;
    },

    getSubjectSessions: async (id: string) => {
        const response = await api.get(`/subjects/${id}/sessions`);
        return response.data;
    },

    getSubjectAssignments: async (id: string) => {
        const response = await api.get(`/subjects/${id}/assignments`);
        return response.data;
    }
};
