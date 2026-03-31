import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import { useAuth } from "../../context/AuthContext";
import { getAssignmentsRequest, type AssignmentItem } from "../../lib/api";
import "./Student.css";

const GroupAssignments: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { token } = useAuth();

  const { title, groupId } = location.state || {};
  const [assignments, setAssignments] = useState<AssignmentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAssignments = async () => {
      if (!token || !groupId) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const response = await getAssignmentsRequest(token, groupId);
        setAssignments(response.data ?? []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to fetch assignments");
      } finally {
        setLoading(false);
      }
    };

    fetchAssignments();
  }, [groupId, token]);

  const handleOpenAssignment = (item: AssignmentItem) => {
    navigate("/student/assignments/detail", {
      state: item,
    });
  };

  return (
    <div className="student-assignment-page">
      <Navbar variant="student" />

      <div className="student-assignment-content">
        {/* MAIN CONTAINER */}
        <div className="student-assignment-container vi-card vi-card-orange">

          {/* Header */}
          <div className="student-assignment-header">
            <div>
              <h1>{title || "Group Assignment"}</h1>
              <p>Group ID: {groupId}</p>
            </div>

            <button
              className="vi-btn vi-btn-outline"
              onClick={() => navigate("/student/assignments")}
            >
              Back to Assignments
            </button>
          </div>

          {/* Assignment List */}
          <div className="student-assignment-list">
            {loading ? (
              <p>Loading assignments...</p>
            ) : error ? (
              <p>{error}</p>
            ) : assignments.length === 0 ? (
              <p>No assignments found for this group yet.</p>
            ) : (
              assignments.map((item) => (
                <div
                  className="student-assignment-card"
                  key={item._id}
                  onClick={() => handleOpenAssignment(item)}
                >

                  <div className="student-assignment-left">
                    <h3>{item.title}</h3>
                    <p>{item.description}</p>

                    <div className="student-assignment-info">
                      <span>Max Marks: {item.maxMarks}</span>
                      <span>Deadline: {new Date(item.deadline).toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="student-assignment-icon">
                    View
                  </div>
                </div>
              ))
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default GroupAssignments;