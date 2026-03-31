import { useCallback, useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Link } from "react-router-dom";
import Navbar from "../../components/Navbar";
import { useAuth } from "../../context/AuthContext";
import {
    createAssignmentRequest,
    getAssignmentsRequest,
    getSubmissionsByAssignmentRequest,
} from "../../lib/api";
import type { AssignmentItem, TeacherSubmissionItem } from "../../lib/api";
import "./Assignments.css";

function Assignments() {
    const { token } = useAuth();
    const [assignments, setAssignments] = useState<AssignmentItem[]>([]);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [groupId, setGroupId] = useState("");
    const [maxMarks, setMaxMarks] = useState<number>(100);
    const [deadline, setDeadline] = useState("");
    const [attachmentUrl, setAttachmentUrl] = useState("");
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [expandedAssignmentId, setExpandedAssignmentId] = useState<string | null>(null);
    const [submissionLoadingByAssignment, setSubmissionLoadingByAssignment] = useState<Record<string, boolean>>({});
    const [submissionsByAssignment, setSubmissionsByAssignment] = useState<Record<string, TeacherSubmissionItem[]>>({});

    const fetchAssignments = useCallback(async () => {
        if (!token) return;

        setLoading(true);
        try {
            const response = await getAssignmentsRequest(token);
            setAssignments(response.data ?? []);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Unable to fetch assignments");
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => {
        fetchAssignments();
    }, [fetchAssignments]);

    const resetForm = () => {
        setTitle("");
        setDescription("");
        setGroupId("");
        setMaxMarks(100);
        setDeadline("");
        setAttachmentUrl("");
    };

    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault();

        if (!token) return;
        if (!title.trim() || !description.trim() || !groupId.trim() || !deadline) {
            setError("Title, description, group ID, and deadline are required");
            return;
        }

        setIsSubmitting(true);
        setError("");
        setSuccessMessage("");

        try {
            await createAssignmentRequest(
                {
                    title: title.trim(),
                    description: description.trim(),
                    groupId: groupId.trim().toUpperCase(),
                    maxMarks,
                    deadline,
                    attachmentUrl: attachmentUrl.trim(),
                },
                token,
            );

            setSuccessMessage("Assignment created successfully");
            resetForm();
            await fetchAssignments();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Unable to create assignment");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleToggleSubmissionList = async (assignmentId: string) => {
        if (!token) return;

        if (expandedAssignmentId === assignmentId) {
            setExpandedAssignmentId(null);
            return;
        }

        setExpandedAssignmentId(assignmentId);

        if (Object.prototype.hasOwnProperty.call(submissionsByAssignment, assignmentId)) {
            return;
        }

        setSubmissionLoadingByAssignment((prev) => ({ ...prev, [assignmentId]: true }));

        try {
            const response = await getSubmissionsByAssignmentRequest(assignmentId, token);
            setSubmissionsByAssignment((prev) => ({ ...prev, [assignmentId]: response.data ?? [] }));
        } catch (err) {
            setError(err instanceof Error ? err.message : "Unable to fetch assignment submissions");
            setSubmissionsByAssignment((prev) => ({ ...prev, [assignmentId]: [] }));
        } finally {
            setSubmissionLoadingByAssignment((prev) => ({ ...prev, [assignmentId]: false }));
        }
    };

    return (
        <div className="teacher-assignments-page">
            <Navbar variant="teacher" />

            <main className="teacher-assignments-content">
                <section className="vi-card vi-card-teal teacher-assignments-header">
                    <div className="teacher-assignments-header-top">
                        <h1>Assignments</h1>
                        <Link to="/teacher/dashboard" className="vi-btn vi-btn-outline teacher-back-link">
                            Back to Dashboard
                        </Link>
                    </div>
                    <p>Create assignments for your students and attach resource links.</p>
                </section>

                <section className="vi-card assignment-form-card">
                    <h2>Add Assignment</h2>

                    {error && <p className="assignment-alert assignment-alert-error">{error}</p>}
                    {successMessage && <p className="assignment-alert assignment-alert-success">{successMessage}</p>}

                    <form className="assignment-form" onSubmit={handleSubmit}>
                        <label>
                            Title
                            <input
                                className="vi-input"
                                type="text"
                                value={title}
                                onChange={(event) => setTitle(event.target.value)}
                                placeholder="e.g. React State Management"
                            />
                        </label>

                        <label>
                            Description
                            <textarea
                                className="vi-input"
                                value={description}
                                onChange={(event) => setDescription(event.target.value)}
                                rows={4}
                                placeholder="Describe the assignment instructions"
                            />
                        </label>

                        <label>
                            Group ID
                            <input
                                className="vi-input"
                                type="text"
                                value={groupId}
                                onChange={(event) => setGroupId(event.target.value.toUpperCase())}
                                placeholder="e.g. GRP123"
                            />
                        </label>

                        <div className="assignment-form-row">
                            <label>
                                Max Marks
                                <input
                                    className="vi-input"
                                    type="number"
                                    value={maxMarks}
                                    min={1}
                                    onChange={(event) => setMaxMarks(Number(event.target.value))}
                                />
                            </label>

                            <label>
                                Deadline
                                <input
                                    className="vi-input"
                                    type="datetime-local"
                                    value={deadline}
                                    onChange={(event) => setDeadline(event.target.value)}
                                />
                            </label>
                        </div>

                        <label>
                            Assignment URL (Optional)
                            <input
                                className="vi-input"
                                type="url"
                                value={attachmentUrl}
                                onChange={(event) => setAttachmentUrl(event.target.value)}
                                placeholder="https://drive.google.com/..."
                            />
                        </label>

                        <button className="vi-btn vi-btn-primary" type="submit" disabled={isSubmitting}>
                            {isSubmitting ? "Creating..." : "Create Assignment"}
                        </button>
                    </form>
                </section>

                <section className="vi-card assignment-list-card">
                    <h2>Your Assignments</h2>

                    {loading ? (
                        <p className="assignment-empty">Loading assignments...</p>
                    ) : assignments.length === 0 ? (
                        <p className="assignment-empty">No assignments created yet.</p>
                    ) : (
                        <div className="assignment-list">
                            {assignments.map((assignment) => (
                                <article key={assignment._id} className="assignment-item">
                                    <div>
                                        <h3>{assignment.title}</h3>
                                        <p>{assignment.description}</p>
                                        <div className="assignment-meta">
                                            <span>Group: {assignment.groupId}</span>
                                            <span>Marks: {assignment.maxMarks}</span>
                                            <span>Deadline: {new Date(assignment.deadline).toLocaleString()}</span>
                                            <span>Status: {assignment.status}</span>
                                        </div>
                                    </div>
                                    {assignment.attachmentUrl ? (
                                        <a
                                            className="assignment-file-link"
                                            href={assignment.attachmentUrl}
                                            target="_blank"
                                            rel="noreferrer"
                                        >
                                            Open Attachment
                                        </a>
                                    ) : (
                                        <span className="assignment-no-file">No attachment URL</span>
                                    )}

                                    <button
                                        className="vi-btn vi-btn-outline assignment-submission-toggle"
                                        type="button"
                                        onClick={() => handleToggleSubmissionList(assignment._id)}
                                    >
                                        {expandedAssignmentId === assignment._id ? "Hide Submissions" : "View Submissions"}
                                    </button>

                                    {expandedAssignmentId === assignment._id && (
                                        <div className="assignment-submission-panel">
                                            {submissionLoadingByAssignment[assignment._id] ? (
                                                <p className="assignment-empty">Loading submissions...</p>
                                            ) : (submissionsByAssignment[assignment._id]?.length ?? 0) > 0 ? (
                                                <div className="assignment-submission-list">
                                                    <h4>Submission Details</h4>
                                                    {submissionsByAssignment[assignment._id].map((submission) => (
                                                        <div key={submission._id} className="assignment-submission-details">
                                                            <p>
                                                                <strong>Student:</strong> {submission.student?.name ?? "Unknown"}
                                                            </p>
                                                            <p>
                                                                <strong>Email:</strong> {submission.student?.email ?? "N/A"}
                                                            </p>
                                                            <p>
                                                                <strong>Submitted At:</strong> {submission.submittedAt ? new Date(submission.submittedAt).toLocaleString() : "N/A"}
                                                            </p>
                                                            <p>
                                                                <strong>Status:</strong> {submission.status ?? "N/A"}
                                                                {submission.isLate ? " (Late)" : " (On time)"}
                                                            </p>
                                                            <p>
                                                                <strong>Submission Text:</strong> {submission.submissionText ?? "N/A"}
                                                            </p>
                                                            {submission.pdfUrl ? (
                                                                <p>
                                                                    <strong>PDF URL:</strong>{" "}
                                                                    <a
                                                                        className="assignment-file-link"
                                                                        href={submission.pdfUrl}
                                                                        target="_blank"
                                                                        rel="noreferrer"
                                                                    >
                                                                        Open Submitted File
                                                                    </a>
                                                                </p>
                                                            ) : null}
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <p className="assignment-empty">No submissions yet for this assignment.</p>
                                            )}
                                        </div>
                                    )}
                                </article>
                            ))}
                        </div>
                    )}
                </section>
            </main>
        </div>
    );
}

export default Assignments;
