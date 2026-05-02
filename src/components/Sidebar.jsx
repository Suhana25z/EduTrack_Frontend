import React from "react";

function Sidebar({ setActivePage, role }) {
  return (
    <div className="sidebar">
      <h2>SPAS</h2>
      <ul>
        <li onClick={() => setActivePage("dashboard")}>Dashboard</li>

        {role === "teacher" && (
          <>
            <li onClick={() => setActivePage("addStudent")}>Add Student</li>
            <li onClick={() => setActivePage("reports")}>Reports</li>
            <li onClick={() => setActivePage("attendance")}>Attendance Register</li>

            <li onClick={() => setActivePage("addSubject")}>Add Subject</li>
            <li onClick={() => setActivePage("updateMarks")}>Update Student</li>
            <li onClick={() => setActivePage("deleteStudent")}>Delete Student</li>
          </>
        )}

        {role === "student" && (
          <>
            <li onClick={() => setActivePage("reports")}>Reports</li>
            <li onClick={() => setActivePage("attendance")}>Attendance Register</li>
            <li onClick={() => setActivePage("marks")}>My Marks</li>
            <li onClick={() => setActivePage("cgpa")}>My CGPA</li>
            <li onClick={() => setActivePage("grades")}>My Grades</li>
            <li onClick={() => setActivePage("analysis")}>My Analysis</li>
          </>
        )}
      </ul>
    </div>
  );
}

export default Sidebar;
