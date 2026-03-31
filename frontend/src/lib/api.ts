import type { AuthResponse, AuthUser, DashboardResponse, UserRole } from "../types/auth";

const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL ??
    import.meta.env.VITE_API_URL ??
    (import.meta.env.DEV ? "http://localhost:5001/api" : "/api");

interface ApiRequestOptions extends RequestInit {
    token?: string | null;
}

async function apiRequest<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
    const { token, headers, ...rest } = options;

    const response = await fetch(`${API_BASE_URL}${path}`, {
        ...rest,
        headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...headers
        }
    });

    const payload = await response.json().catch(() => ({}));

    if (!response.ok) {
        const validationMessage = Array.isArray(payload.errors) ? payload.errors[0]?.msg : undefined;
        throw new Error(payload.message ?? validationMessage ?? "Request failed");
    }

    return payload as T;
}

export function registerRequest(input: {
    name: string;
    email: string;
    password: string;
    role: UserRole;
}): Promise<AuthResponse> {
    return apiRequest<AuthResponse>("/auth/register", {
        method: "POST",
        body: JSON.stringify(input)
    });
}

export function loginRequest(input: { email: string; password: string }): Promise<AuthResponse> {
    return apiRequest<AuthResponse>("/auth/login", {
        method: "POST",
        body: JSON.stringify(input)
    });
}

export function forgotPasswordCheckEmailRequest(input: { email: string }): Promise<{ success: boolean; message: string }> {
    return apiRequest<{ success: boolean; message: string }>("/auth/forgot-password/check-email", {
        method: "POST",
        body: JSON.stringify(input)
    });
}

export function forgotPasswordResetRequest(input: { email: string; newPassword: string }): Promise<{ success: boolean; message: string }> {
    return apiRequest<{ success: boolean; message: string }>("/auth/forgot-password/reset", {
        method: "POST",
        body: JSON.stringify(input)
    });
}

export async function meRequest(token: string): Promise<AuthUser> {
    const response = await apiRequest<{ user: AuthUser }>("/auth/me", { token });
    return response.user;
}

export function dashboardRequest(role: UserRole, token: string): Promise<DashboardResponse> {
    return apiRequest<DashboardResponse>(`/dashboard/${role}`, { token });
}

export interface AssignmentItem {
    _id: string;
    title: string;
    description: string;
    groupId: string;
    maxMarks: number;
    deadline: string;
    status: "active" | "closed";
    attachmentUrl?: string | null;
    attachmentName?: string | null;
    createdAt: string;
}

export function getAssignmentsRequest(token: string, groupId?: string): Promise<{ success: boolean; data: AssignmentItem[] }> {
    const normalizedGroupId = groupId?.trim().toUpperCase();
    const query = normalizedGroupId ? `?groupId=${encodeURIComponent(normalizedGroupId)}` : "";
    return apiRequest<{ success: boolean; data: AssignmentItem[] }>(`/assignments${query}`, { token });
}

export function createAssignmentRequest(input: {
    title: string;
    description: string;
    groupId: string;
    maxMarks: number;
    deadline: string;
    attachmentUrl?: string;
}, token: string): Promise<{ success: boolean; data: AssignmentItem }> {
    return apiRequest<{ success: boolean; data: AssignmentItem }>("/assignments", {
        method: "POST",
        body: JSON.stringify(input),
        token
    });
}

export interface AssignmentGroupItem {
    groupId: string;
    joinedAt: string;
}

export interface SubmissionItem {
    _id: string;
    assignment: string;
    student: string;
    submissionText: string;
    pdfUrl?: string | null;
    status: "pending" | "submitted" | "graded";
    isLate: boolean;
    submittedAt: string;
    createdAt: string;
    updatedAt: string;
}

export interface TeacherSubmissionItem {
    _id: string;
    assignment: {
        _id: string;
        title: string;
        groupId: string;
        maxMarks: number;
        deadline: string;
    };
    student: {
        _id: string;
        name: string;
        email: string;
    };
    submissionText: string;
    pdfUrl?: string | null;
    status: "pending" | "submitted" | "graded";
    isLate: boolean;
    marksObtained?: number | null;
    feedback?: string | null;
    submittedAt: string;
    createdAt: string;
    updatedAt: string;
}

export function joinAssignmentGroupRequest(
    groupId: string,
    token: string
): Promise<{ success: boolean; message?: string; data: AssignmentGroupItem }> {
    return apiRequest<{ success: boolean; message?: string; data: AssignmentGroupItem }>("/assignment-groups/join", {
        method: "POST",
        body: JSON.stringify({ groupId }),
        token
    });
}

export function getMyAssignmentGroupsRequest(
    token: string
): Promise<{ success: boolean; data: AssignmentGroupItem[] }> {
    return apiRequest<{ success: boolean; data: AssignmentGroupItem[] }>("/assignment-groups/my", { token });
}

export function submitAssignmentRequest(input: {
    assignmentId: string;
    submissionText: string;
    pdfUrl?: string;
}, token: string): Promise<{ success: boolean; data: SubmissionItem }> {
    return apiRequest<{ success: boolean; data: SubmissionItem }>("/submissions", {
        method: "POST",
        body: JSON.stringify(input),
        token
    });
}

export function getTeacherRecentSubmissionsRequest(
    token: string,
    limit = 10
): Promise<{ success: boolean; data: TeacherSubmissionItem[] }> {
    const safeLimit = Number.isFinite(limit) && limit > 0 ? Math.min(Math.floor(limit), 50) : 10;
    return apiRequest<{ success: boolean; data: TeacherSubmissionItem[] }>(
        `/submissions/teacher/recent?limit=${safeLimit}`,
        { token }
    );
}

export function getSubmissionsByAssignmentRequest(
    assignmentId: string,
    token: string
): Promise<{ success: boolean; data: TeacherSubmissionItem[] }> {
    return apiRequest<{ success: boolean; data: TeacherSubmissionItem[] }>(
        `/submissions/assignment/${assignmentId}`,
        { token }
    );
}
