import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import { submitAssignmentRequest, type AssignmentItem } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";
import "./Student.css";

const AssignmentDetail: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { token } = useAuth();
  const data = location.state as AssignmentItem | undefined;

  const [text, setText] = useState("");
  const [pdf, setPdf] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleSubmit = async () => {
    if (!data?._id || !token) {
      setError("Unable to submit right now. Please sign in again.");
      return;
    }

    if (!text.trim()) {
      setError("Submission text is required");
      setSuccessMessage("");
      return;
    }

    setSubmitting(true);
    setError("");
    setSuccessMessage("");

    try {
      await submitAssignmentRequest(
        {
          assignmentId: data._id,
          submissionText: text.trim(),
          pdfUrl: pdf.trim() || undefined,
        },
        token
      );

      setSuccessMessage("Assignment submitted successfully");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit assignment");
    } finally {
      setSubmitting(false);
    }
  };

  if (!data) {
    return <p style={{ padding: "20px" }}>No assignment data</p>;
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
            <h1>{data.title}</h1>
            <p>{data.description}</p>

            <div className="student-assignment-meta">
              <span>Max Marks: <b>{data.maxMarks}</b></span>
              <span>Deadline: <b>{new Date(data.deadline).toLocaleString()}</b></span>
              <span>Group ID: <b>{data.groupId}</b></span>
            </div>
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

            {error && <p className="error-text">{error}</p>}
            {successMessage && <p className="success-text">{successMessage}</p>}

            <button
              className="vi-btn vi-btn-primary student-submit-btn"
              onClick={handleSubmit}
              disabled={submitting}
            >
              {submitting ? "Submitting..." : "Submit Assignment"}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default AssignmentDetail;