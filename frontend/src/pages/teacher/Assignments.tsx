import { useCallback, useEffect, useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import { useAuth } from "../../context/AuthContext";
import {
    createAssignmentRequest,
    getAssignmentsRequest,
    getSubmissionsByAssignmentRequest,
    type AssignmentItem,
    type SubmissionItem,
} from "../../lib/api";
import "./Assignments.css";

function toInputDateValue(date: Date): string {
    const pad = (value: number) => String(value).padStart(2, "0");
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function TeacherAssignments() {
    const { token } = useAuth();
    const navigate = useNavigate();

    const [assignments, setAssignments] = useState<AssignmentItem[]>([]);
    const [loadingAssignments, setLoadingAssignments] = useState(true);
    const [assignmentsError, setAssignmentsError] = useState<string | null>(null);

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [groupId, setGroupId] = useState("");
    const [referenceUrl, setReferenceUrl] = useState("");
    const [maxMarks, setMaxMarks] = useState("100");
    const [deadline, setDeadline] = useState(toInputDateValue(new Date(Date.now() + 24 * 60 * 60 * 1000)));
    const [creating, setCreating] = useState(false);
    const [createMessage, setCreateMessage] = useState<string | null>(null);

    const [selectedAssignmentId, setSelectedAssignmentId] = useState<string | null>(null);
    const [submissions, setSubmissions] = useState<SubmissionItem[]>([]);
    const [loadingSubmissions, setLoadingSubmissions] = useState(false);
    const [submissionsError, setSubmissionsError] = useState<string | null>(null);

    const fetchAssignments = useCallback(async () => {
        if (!token) {
            setAssignmentsError("Please login again to continue.");
            setLoadingAssignments(false);
            return;
        }

        try {
            setLoadingAssignments(true);
            const data = await getAssignmentsRequest(token);
            setAssignments(data);
            setAssignmentsError(null);
        } catch (err) {
            const message = err instanceof Error ? err.message : "Failed to load assignments";
            setAssignmentsError(message);
        } finally {
            setLoadingAssignments(false);
        }
    }, [token]);

    useEffect(() => {
        void fetchAssignments();
    }, [fetchAssignments]);

    const handleCreateAssignment = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!token) {
            setCreateMessage("Please login again to create assignment.");
            return;
        }

        if (!title.trim() || !description.trim() || !groupId.trim() || !maxMarks.trim() || !deadline) {
            setCreateMessage("All fields are required.");
            return;
        }

        const parsedMarks = Number(maxMarks);
        if (!Number.isFinite(parsedMarks) || parsedMarks <= 0) {
            setCreateMessage("Max marks must be a positive number.");
            return;
        }

        setCreating(true);
        setCreateMessage(null);

        try {
            await createAssignmentRequest(
                {
                    title: title.trim(),
                    description: description.trim(),
                    groupId: groupId.trim().toUpperCase(),
                    referenceUrl: referenceUrl.trim() || undefined,
                    maxMarks: parsedMarks,
                    deadline: new Date(deadline).toISOString(),
                },
                token
            );

            setCreateMessage("Assignment created successfully.");
            setTitle("");
            setDescription("");
            setGroupId("");
            setReferenceUrl("");
            setMaxMarks("100");
            setDeadline(toInputDateValue(new Date(Date.now() + 24 * 60 * 60 * 1000)));
            await fetchAssignments();
        } catch (err) {
            const message = err instanceof Error ? err.message : "Failed to create assignment";
            setCreateMessage(message);
        } finally {
            setCreating(false);
        }
    };

    const handleViewSubmissions = async (assignmentId: string) => {
        if (!token) {
            setSubmissionsError("Please login again to continue.");
            return;
        }

        setSelectedAssignmentId(assignmentId);
        setLoadingSubmissions(true);
        setSubmissionsError(null);

        try {
            const data = await getSubmissionsByAssignmentRequest(assignmentId, token);
            setSubmissions(data);
        } catch (err) {
            const message = err instanceof Error ? err.message : "Failed to load submissions";
            setSubmissionsError(message);
            setSubmissions([]);
        } finally {
            setLoadingSubmissions(false);
        }
    };

    const selectedAssignment = assignments.find((item) => item._id === selectedAssignmentId) ?? null;

    return (
        <div className="teacher-assignments-page">
            <Navbar variant="teacher" />

            <div className="teacher-assignments-content">
                <div className="teacher-assignments-header vi-card vi-card-orange">
                    <div>
                        <h1>Assignments</h1>
                        <p>Create assignments and view student submissions.</p>
                    </div>
                    <button className="vi-btn vi-btn-outline" onClick={() => navigate("/teacher/dashboard")}>
                        Back to Dashboard
                    </button>
                </div>

                <div className="teacher-assignments-grid">
                    <section className="vi-card teacher-create-card">
                        <h2>Create Assignment</h2>
                        <form onSubmit={handleCreateAssignment} className="teacher-assignment-form">
                            <label htmlFor="assignment-title">Title</label>
                            <input
                                id="assignment-title"
                                className="vi-input"
                                type="text"
                                value={title}
                                onChange={(event) => setTitle(event.target.value)}
                                placeholder="Assignment title"
                                required
                            />

                            <label htmlFor="assignment-description">Description</label>
                            <textarea
                                id="assignment-description"
                                className="vi-input teacher-textarea"
                                value={description}
                                onChange={(event) => setDescription(event.target.value)}
                                placeholder="Assignment details"
                                required
                            />

                            <label htmlFor="assignment-group">Group ID</label>
                            <input
                                id="assignment-group"
                                className="vi-input"
                                type="text"
                                value={groupId}
                                onChange={(event) => setGroupId(event.target.value)}
                                placeholder="e.g. CSE-A1"
                                required
                            />

                            <label htmlFor="assignment-reference-url">Reference URL (optional)</label>
                            <input
                                id="assignment-reference-url"
                                className="vi-input"
                                type="url"
                                value={referenceUrl}
                                onChange={(event) => setReferenceUrl(event.target.value)}
                                placeholder="https://example.com/reference"
                            />

                            <label htmlFor="assignment-marks">Max Marks</label>
                            <input
                                id="assignment-marks"
                                className="vi-input"
                                type="number"
                                min={1}
                                value={maxMarks}
                                onChange={(event) => setMaxMarks(event.target.value)}
                                required
                            />

                            <label htmlFor="assignment-deadline">Deadline</label>
                            <input
                                id="assignment-deadline"
                                className="vi-input"
                                type="datetime-local"
                                value={deadline}
                                onChange={(event) => setDeadline(event.target.value)}
                                required
                            />

                            <button className="vi-btn vi-btn-primary" type="submit" disabled={creating}>
                                {creating ? "Creating..." : "Create Assignment"}
                            </button>
                            {createMessage && <p className="teacher-helper-text">{createMessage}</p>}
                        </form>
                    </section>

                    <section className="vi-card teacher-list-card">
                        <h2>Your Assignments</h2>
                        {loadingAssignments ? (
                            <p>Loading assignments...</p>
                        ) : assignmentsError ? (
                            <p>{assignmentsError}</p>
                        ) : assignments.length === 0 ? (
                            <p>No assignments yet. Create one to get started.</p>
                        ) : (
                            <div className="teacher-assignment-list">
                                {assignments.map((assignment) => (
                                    <article key={assignment._id} className="teacher-assignment-item">
                                        <div>
                                            <h3>{assignment.title}</h3>
                                            <p>{assignment.description}</p>
                                            <p>
                                                Max Marks: {assignment.maxMarks} | Deadline: {new Date(assignment.deadline).toLocaleString()}
                                            </p>
                                            <p>Group ID: {assignment.groupId}</p>
                                            {assignment.referenceUrl && (
                                                <p>
                                                    Reference: <a href={assignment.referenceUrl} target="_blank" rel="noreferrer">Open Link</a>
                                                </p>
                                            )}
                                        </div>
                                        <button
                                            className="vi-btn vi-btn-secondary"
                                            onClick={() => void handleViewSubmissions(assignment._id)}
                                        >
                                            View Submissions
                                        </button>
                                    </article>
                                ))}
                            </div>
                        )}
                    </section>
                </div>

                <section className="vi-card teacher-submissions-card">
                    <h2>
                        {selectedAssignment
                            ? `Submissions: ${selectedAssignment.title}`
                            : "Submissions"}
                    </h2>
                    {!selectedAssignmentId ? (
                        <p>Select an assignment and click View Submissions.</p>
                    ) : loadingSubmissions ? (
                        <p>Loading submissions...</p>
                    ) : submissionsError ? (
                        <p>{submissionsError}</p>
                    ) : submissions.length === 0 ? (
                        <p>No submissions yet for this assignment.</p>
                    ) : (
                        <div className="teacher-submissions-list">
                            {submissions.map((submission) => (
                                <article key={submission._id} className="teacher-submission-item">
                                    <h3>{submission.student?.name ?? "Student"}</h3>
                                    <p>{submission.student?.email ?? "No email"}</p>
                                    <p>Status: {submission.status}</p>
                                    <p>Late: {submission.isLate ? "Yes" : "No"}</p>
                                    <p>{submission.submissionText}</p>
                                    {submission.pdfUrl && (
                                        <a href={submission.pdfUrl} target="_blank" rel="noreferrer">
                                            Open PDF
                                        </a>
                                    )}
                                </article>
                            ))}
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
}

export default TeacherAssignments;
