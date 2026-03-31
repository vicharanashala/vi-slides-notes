import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import { useAuth } from "../../context/AuthContext";
import {
  getAssignmentByIdRequest,
  submitAssignmentRequest,
  type AssignmentItem,
} from "../../lib/api";
import "./Student.css";

const AssignmentDetail: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { token } = useAuth();
  const state = location.state as { assignmentId?: string; assignment?: AssignmentItem } | null;

  const [text, setText] = useState("");
  const [pdf, setPdf] = useState("");
  const [assignment, setAssignment] = useState<AssignmentItem | null>(state?.assignment ?? null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<string | null>(null);

  const assignmentId = useMemo(
    () => state?.assignmentId ?? state?.assignment?._id ?? null,
    [state]
  );

  useEffect(() => {
    async function fetchAssignment() {
      if (!assignmentId) {
        setError("Missing assignment id. Please open assignment from the list.");
        setLoading(false);
        return;
      }

      if (!token) {
        setError("Please login again to continue.");
        setLoading(false);
        return;
      }

      try {
        const data = await getAssignmentByIdRequest(assignmentId, token);
        setAssignment(data);
        setError(null);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to load assignment";
        setError(message);
      } finally {
        setLoading(false);
      }
    }

    void fetchAssignment();
  }, [assignmentId, token]);

  const handleSubmitAssignment = async () => {
    if (!assignmentId) {
      setSubmitMessage("Missing assignment id.");
      return;
    }

    if (!token) {
      setSubmitMessage("Please login again to submit.");
      return;
    }

    if (!text.trim()) {
      setSubmitMessage("Submission text is required.");
      return;
    }

    setSubmitting(true);
    setSubmitMessage(null);

    try {
      await submitAssignmentRequest(
        {
          assignmentId,
          submissionText: text.trim(),
          pdfUrl: pdf.trim() ? pdf.trim() : undefined,
        },
        token
      );
      setSubmitMessage("Assignment submitted successfully.");
      setText("");
      setPdf("");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to submit assignment";
      setSubmitMessage(message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <p style={{ padding: "20px" }}>Loading assignment...</p>;
  }

  if (error || !assignment) {
    return <p style={{ padding: "20px" }}>{error ?? "No assignment data"}</p>;
  }

  return (
    <div className="student-assignment-page">
      <Navbar variant="student" />

      <div className="student-assignment-content">
        <div className="student-assignment-container vi-card vi-card-teal">

          {/* HEADER WITH BACK BUTTON */}
          <div className="student-assignment-header-list">
            <button
              className="vi-btn vi-btn-outline"
              onClick={() => navigate(-1)}
            >
              Back to Assignments
            </button>
          </div>

          {/* TOP DETAILS */}
          <div className="student-assignment-detail-header">
            <h1>{assignment.title}</h1>
            <p>{assignment.description}</p>

            <div className="student-assignment-meta">
              <span>Max Marks: <b>{assignment.maxMarks}</b></span>
              <span>Group ID: <b>{assignment.groupId}</b></span>
              <span>Deadline: <b>{new Date(assignment.deadline).toLocaleString()}</b></span>
              <span>Teacher: <b>{assignment.teacher?.name ?? "Not available"}</b></span>
            </div>
            {assignment.referenceUrl && (
              <p>
                Reference: <a href={assignment.referenceUrl} target="_blank" rel="noreferrer">Open Link</a>
              </p>
            )}
          </div>

          {/* SUBMIT SECTION */}
          <div className="student-submit-box">
            <h2>Submit Assignment</h2>

            <label>Submission Text *</label>
            <textarea
              placeholder="Enter your assignment submission here..."
              value={text}
              onChange={(e) => setText(e.target.value)}
            />

            <label>PDF URL</label>
            <input
              type="text"
              placeholder="https://example.com/your-file.pdf"
              value={pdf}
              onChange={(e) => setPdf(e.target.value)}
            />

            <p className="student-hint">
              Upload your PDF to a cloud service (Google Drive, Dropbox) and paste the link here
            </p>

            <button
              className="vi-btn vi-btn-primary student-submit-btn"
              onClick={() => void handleSubmitAssignment()}
              disabled={submitting}
            >
              {submitting ? "Submitting..." : "Submit Assignment"}
            </button>
            {submitMessage && <p className="student-hint">{submitMessage}</p>}
          </div>

        </div>
      </div>
    </div>
  );
};

export default AssignmentDetail;