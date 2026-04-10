import { IUser } from '../models/User';
import { IQuestion } from '../models/Question';
import { ISession } from '../models/Session';

// Singleton Mock Store
class MockStorage {
    private users: Map<string, any> = new Map();
    private sessions: Map<string, any> = new Map();
    private questions: Map<string, any> = new Map();

    constructor() {
        // Pre-populate with a default teacher for testing
        const defaultTeacher = {
            id: 'teacher-1',
            _id: 'teacher-1',
            name: 'Demo Teacher',
            email: 'teacher@example.com',
            passwordHash: '$2a$10$Xm7Bmqf.7jGf3.C/kP/RkuUo.v.X/X/X/X/X/X/X/X/X/X/X/X/X',
            role: 'teacher'
        };
        this.users.set(defaultTeacher.id, defaultTeacher);
        this.users.set(defaultTeacher.email, defaultTeacher); // Key by email too for convenience
    }

    // User Operations
    async findUserByEmail(email: string): Promise<any | null> {
        return this.users.get(email) || null;
    }

    async findUserById(id: string): Promise<any | null> {
        return this.users.get(id) || null;
    }

    async createUser(user: any): Promise<any> {
        const id = Math.random().toString(36).substr(2, 9);
        const newUser = { ...user, _id: id, id };
        this.users.set(id, newUser);
        this.users.set(newUser.email, newUser);
        return newUser;
    }

    // Session Operations
    async createSession(session: any): Promise<any> {
        const id = Math.random().toString(36).substr(2, 9);
        const newSession = { ...session, _id: id, id, sessionCode: session.sessionCode || id.toUpperCase() };
        this.sessions.set(newSession.sessionCode, newSession);
        return newSession;
    }

    async findSessionByCode(code: string): Promise<any | null> {
        return this.sessions.get(code) || null;
    }

    // Question Operations
    async createQuestion(question: any): Promise<any> {
        const id = Math.random().toString(36).substr(2, 9);
        const newQuestion = { ...question, _id: id, id, createdAt: new Date().toISOString() };
        this.questions.set(id, newQuestion);
        return newQuestion;
    }

    async findQuestionsBySession(sessionCode: string): Promise<any[]> {
        return Array.from(this.questions.values()).filter(q => q.sessionCode === sessionCode);
    }

    async updateQuestion(id: string, updates: any): Promise<any> {
        const question = this.questions.get(id) || Array.from(this.questions.values()).find(q => q._id === id);
        if (question) {
            const updated = { ...question, ...updates };
            this.questions.set(question.id, updated);
            return updated;
        }
        return null;
    }
}

export const mockStore = new MockStorage();
