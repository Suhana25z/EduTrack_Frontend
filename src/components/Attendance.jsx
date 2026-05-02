import React, { useState } from "react";

function Attendance() {
  const [year, setYear] = useState("");
  const [semester, setSemester] = useState("");
  const [showResult, setShowResult] = useState(false);

  const academicYears = [
    "2026-2027",
    "2025-2026",
    "2024-2025",
    "2023-2024",
    "2022-2023",
    "2021-2022",
    "2020-2021",
    "2019-2020"
  ];

  const handleSearch = () => {
    if (year && semester) {
      setShowResult(true);
    } else {
      alert("Please select Academic Year and Semester");
    }
  };

  const handleReset = () => {
    setYear("");
    setSemester("");
    setShowResult(false);
  };

  return (
    <div className="card">
      <h2>Attendance Register</h2>

      <div style={{ marginTop: "20px" }}>

        <select
          value={year}
          onChange={(e) => setYear(e.target.value)}
        >
          <option value="">Select Academic Year</option>
          {academicYears.map((y, index) => (
            <option key={index} value={y}>
              {y}
            </option>
          ))}
        </select>

        <select
          value={semester}
          onChange={(e) => setSemester(e.target.value)}
          style={{ marginLeft: "20px" }}
        >
          <option value="">Select Semester</option>
          <option value="Semester 1">Semester 1</option>
          <option value="Semester 2">Semester 2</option>
        </select>

        <button
          className="primary"
          style={{ marginLeft: "20px" }}
          onClick={handleSearch}
        >
          Search
        </button>

        <button
          style={{ marginLeft: "10px" }}
          onClick={handleReset}
        >
          Reset
        </button>
      </div>

      {showResult && (
        <div style={{ marginTop: "30px" }}>
          <h3>Selected Details:</h3>
          <p><strong>Academic Year:</strong> {year}</p>
          <p><strong>Semester:</strong> {semester}</p>
        </div>
      )}
    </div>
  );
}

export default Attendance;