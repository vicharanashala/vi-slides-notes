import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import "./Student.css";

const GroupAssignments: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const { title, groupId } = location.state || {};

  // Dummy assignments (you can replace with API later)
  const assignments = [
    {
      name: "Assignment-1",
      desc: "About the First Chapter of ML",
      marks: 100,
      time: "2d 1h left",
    },
  ];

  const handleOpenAssignment = (item: any) => {
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
            {assignments.map((item, index) => (
              <div
                className="student-assignment-card"
                key={index}
                onClick={() => handleOpenAssignment(item)}
              >
                
                <div className="student-assignment-left">
                  <h3>{item.name}</h3>
                  <p>{item.desc}</p>

                  <div className="student-assignment-info">
                    <span>Max Marks: {item.marks}</span>
                    <span>{item.time}</span>
                  </div>
                </div>

                <div className="student-assignment-icon">
                  View
                </div>

              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
};

export default GroupAssignments;