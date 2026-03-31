import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import { useAuth } from "../../context/AuthContext";
import {
  getMyAssignmentGroupsRequest,
  joinAssignmentGroupRequest,
  type AssignmentGroupItem,
} from "../../lib/api";
import "./Student.css";

const Assignments: React.FC = () => {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [showBox, setShowBox] = useState(false);
  const [code, setCode] = useState("");
  const [groups, setGroups] = useState<AssignmentGroupItem[]>([]);
  const [loadingGroups, setLoadingGroups] = useState(true);
  const [joiningGroup, setJoiningGroup] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleOpenGroup = (groupId: string) => {
    navigate("/student/assignments/group", {
      state: { title: `Group ${groupId}`, groupId },
    });
  };

  const fetchGroups = useCallback(async () => {
    if (!token) return;

    setLoadingGroups(true);
    try {
      const response = await getMyAssignmentGroupsRequest(token);
      setGroups(response.data ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load joined groups");
    } finally {
      setLoadingGroups(false);
    }
  }, [token]);

  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  const handleJoinGroup = async () => {
    if (!token) return;

    const normalizedCode = code.trim().toUpperCase();
    if (!normalizedCode) {
      setError("Please enter a group ID");
      return;
    }

    setJoiningGroup(true);
    setError("");
    setSuccessMessage("");

    try {
      const response = await joinAssignmentGroupRequest(normalizedCode, token);
      setSuccessMessage(response.message ?? "Joined group successfully");
      setCode("");
      await fetchGroups();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to join group");
    } finally {
      setJoiningGroup(false);
    }
  };

  return (
    <div className="student-assignment-page">
      <Navbar variant="student" />

      <div className="student-assignment-content">
        {/* MAIN CONTAINER */}
        <div className="student-assignment-container vi-card vi-card-orange">

          <div className="student-assignment-header">
            <div className="student-left-section">
              <h1>Assignments</h1>
              <p>View and submit your assignments</p>
            </div>

            <div className="student-right-section">
              <button
                className="vi-btn vi-btn-secondary"
                onClick={() => setShowBox(!showBox)}
              >
                Join Assignment Group
              </button>

              <button
                className="vi-btn vi-btn-outline"
                onClick={() => navigate("/student/dashboard")}
              >
                Back to Dashboard
              </button>
            </div>
          </div>

          {/* Input Box */}
          {showBox && (
            <div className="student-join-box">
              <input
                type="text"
                className="vi-input"
                placeholder="Enter Group Code"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
              />
              <button
                className="vi-btn vi-btn-primary"
                onClick={handleJoinGroup}
                disabled={joiningGroup}
              >
                {joiningGroup ? "Joining..." : "Join"}
              </button>
            </div>
          )}

          {error && <p className="error-text">{error}</p>}
          {successMessage && <p className="success-text">{successMessage}</p>}
        </div>

        {/* GROUP CONTAINER */}
        <div className="student-group-section">
          <h2 className="section-title">Your Groups</h2>

          <div className="student-group-cards">
            {loadingGroups ? (
              <p>Loading groups...</p>
            ) : groups.length === 0 ? (
              <p>You have not joined any assignment groups yet.</p>
            ) : (
              groups.map((group) => (
                <div
                  className="student-group-card vi-card vi-card-teal"
                  key={group.groupId}
                  onClick={() => handleOpenGroup(group.groupId)}
                >
                  <h3>Assignment Group</h3>

                  <p className="student-group-id">
                    Group ID: {group.groupId}
                  </p>
                </div>
              ))
            )}

          </div>
        </div>
      </div>

    </div>
  );
};

export default Assignments;