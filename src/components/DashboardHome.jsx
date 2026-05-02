import React from "react";

function DashboardHome({ teacherName }) {
  return (
    <>
      <div className="card" style={{ marginBottom: "20px" }}>
        <h2>Welcome, {teacherName || "Teacher"}</h2>
        <p style={{ color: "#666" }}>Here's your class management snapshot</p>
      </div>

      <div className="card">
        <h2>Dashboard Overview</h2>
        <p style={{ color: "#666", marginBottom: "20px" }}>
          Welcome to the Student Performance Management System. Use the menu to explore various features:
        </p>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
          gap: "15px"
        }}>
          <div style={{
            padding: "15px",
            backgroundColor: "#f3f4f6",
            borderRadius: "8px",
            borderLeft: "3px solid #10b981"
          }}>
            <div style={{ fontWeight: "600", marginBottom: "5px" }}>Reports</div>
            <p style={{ fontSize: "0.85em", color: "#666", margin: 0 }}>Generate detailed performance reports</p>
          </div>

          <div style={{
            padding: "15px",
            backgroundColor: "#f3f4f6",
            borderRadius: "8px",
            borderLeft: "3px solid #f59e0b"
          }}>
            <div style={{ fontWeight: "600", marginBottom: "5px" }}>Students</div>
            <p style={{ fontSize: "0.85em", color: "#666", margin: 0 }}>Manage student data and profiles</p>
          </div>
        </div>
      </div>
    </>
  );
}

export default DashboardHome;
