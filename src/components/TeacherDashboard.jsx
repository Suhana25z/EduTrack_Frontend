import React, { useEffect, useMemo, useState } from "react";
import Sidebar from "./Sidebar";
import Report from "./Report";
import DashboardHome from "./DashboardHome";
import {
  addTeacherSubject,
  addStudentSubject,
  createStudent,
  deleteStudent,
  getTeacherSubjects,
  getTeacherStudents,
  markAttendance,
  removeStudentSubject,
  removeTeacherSubject,
  updateStudentProfile,
  updateStudentMarks,
} from "../api";
import { DEFAULT_SUBJECTS } from "../utils/subjects";

const BTECH_BRANCHES = [
  "Computer Science Engineering",
  "Information Technology",
  "Electronics and Communication Engineering",
  "Electrical and Electronics Engineering",
  "Mechanical Engineering",
  "Civil Engineering",
  "Artificial Intelligence and Data Science",
];

function TeacherDashboard({ onLogout, session }) {
  const [students, setStudents] = useState([]);
  const [activePage, setActivePage] = useState("dashboard");
  const [name, setName] = useState("");
  const [studentId, setStudentId] = useState("");
  const [branch, setBranch] = useState(BTECH_BRANCHES[0]);
  const [email, setEmail] = useState("");
  const [studentPassword, setStudentPassword] = useState("");
  const [subjectItems, setSubjectItems] = useState(DEFAULT_SUBJECTS.map((name, index) => ({ id: null, name, subjectOrder: index + 1 })));
  const [subjectDraft, setSubjectDraft] = useState("");
  const [marks, setMarks] = useState(DEFAULT_SUBJECTS.map(() => ""));
  const [selectedId, setSelectedId] = useState("");
  const [selectedBranch, setSelectedBranch] = useState(BTECH_BRANCHES[0]);
  const [newMarks, setNewMarks] = useState(DEFAULT_SUBJECTS.map(() => ""));
  const [commonSubjectStudentId, setCommonSubjectStudentId] = useState("");
  const [subjectStudentId, setSubjectStudentId] = useState("");
  const [studentSubjectDraft, setStudentSubjectDraft] = useState("");
  const [studentSubjectScore, setStudentSubjectScore] = useState("");
  const [attendanceStudentId, setAttendanceStudentId] = useState("");
  const [attendanceDate, setAttendanceDate] = useState("");
  const [attendanceStatus, setAttendanceStatus] = useState("PRESENT");

  useEffect(() => {
    async function loadStudents() {
      try {
        const [studentData, subjectData] = await Promise.all([
          getTeacherStudents(session?.token),
          getTeacherSubjects(session?.token),
        ]);
        setStudents(studentData);
        setSubjectItems(subjectData);
      } catch (error) {
        alert(error.message || "Failed to load students");
      }
    }

    if (session?.token) {
      loadStudents();
    }
  }, [session]);

  const subjectNames = useMemo(() => subjectItems.map((subject) => subject.name), [subjectItems]);
  const selectedStudent = useMemo(
    () => students.find((student) => student.id === selectedId),
    [students, selectedId]
  );
  const selectedSubjectStudent = useMemo(
    () => students.find((student) => student.id === subjectStudentId),
    [students, subjectStudentId]
  );
  const selectedCommonSubjectStudent = useMemo(
    () => students.find((student) => student.id === commonSubjectStudentId),
    [students, commonSubjectStudentId]
  );
  const selectedStudentSubjectNames = useMemo(
    () => selectedStudent?.subjects?.map((subject) => subject.subjectName) || subjectNames,
    [selectedStudent, subjectNames]
  );

  useEffect(() => {
    setMarks((prev) => subjectNames.map((_, index) => prev[index] ?? ""));
    setNewMarks((prev) => subjectNames.map((_, index) => prev[index] ?? ""));
  }, [subjectNames]);

  useEffect(() => {
    if (!selectedStudent) {
      return;
    }

    setNewMarks(
      (selectedStudent.subjects || []).map((subject, index) => subject.score ?? selectedStudent.marks?.[index] ?? "")
    );
    setSelectedBranch(selectedStudent.branch || BTECH_BRANCHES[0]);
  }, [selectedStudent]);

  const subjectPayloadFrom = (values, names = subjectNames) =>
    values.map((value, index) => ({
      subjectName: names[index],
      score: Number(value) || 0,
    }));

  const refreshTeacherData = async () => {
    const [studentData, subjectData] = await Promise.all([
      getTeacherStudents(session.token),
      getTeacherSubjects(session.token),
    ]);
    setStudents(studentData);
    setSubjectItems(subjectData);
  };

  const addSubject = async () => {
    const cleanName = subjectDraft.trim();
    if (!cleanName) {
      alert("Enter a subject name");
      return;
    }

    if (subjectNames.some((subject) => subject.toLowerCase() === cleanName.toLowerCase())) {
      alert("This subject already exists");
      return;
    }

    try {
      await addTeacherSubject(session.token, cleanName);
      await refreshTeacherData();
      setSubjectDraft("");
      alert("Subject added successfully!");
    } catch (error) {
      alert(error.message || "Failed to add subject");
    }
  };

  const removeSubject = async (index) => {
    const subject = subjectItems[index];
    if (subjectItems.length === 1) {
      alert("At least one subject is required");
      return;
    }

    if (!window.confirm(`Remove common subject ${subject.name} from every student?`)) {
      return;
    }

    try {
      await removeTeacherSubject(session.token, subject.id);
      await refreshTeacherData();
      alert("Subject removed successfully!");
    } catch (error) {
      alert(error.message || "Failed to remove subject");
    }
  };

  const removeCommonSubjectForStudent = async (index) => {
    if (!selectedCommonSubjectStudent) {
      alert("Select a student");
      return;
    }

    const subject = subjectItems[index];
    const studentSubject = selectedCommonSubjectStudent.subjects?.[index];
    if (!studentSubject || studentSubject.subjectName !== subject.name) {
      alert(`${subject.name} is not available as a common subject for this student`);
      return;
    }

    if (!window.confirm(`Remove ${subject.name} from ${selectedCommonSubjectStudent.name}?`)) {
      return;
    }

    try {
      const updated = await removeStudentSubject(session.token, selectedCommonSubjectStudent.id, index + 1);
      setStudents((prev) => prev.map((student) => (student.id === selectedCommonSubjectStudent.id ? updated : student)));
      alert("Common subject removed for selected student!");
    } catch (error) {
      alert(error.message || "Failed to remove subject for selected student");
    }
  };

  const addSubjectForStudent = async () => {
    if (!subjectStudentId) {
      alert("Select a student");
      return;
    }
    const cleanName = studentSubjectDraft.trim();
    if (!cleanName) {
      alert("Enter a subject name");
      return;
    }

    try {
      const updated = await addStudentSubject(session.token, subjectStudentId, {
        subjectName: cleanName,
        score: Number(studentSubjectScore) || 0,
      });
      setStudents((prev) => prev.map((student) => (student.id === subjectStudentId ? updated : student)));
      setStudentSubjectDraft("");
      setStudentSubjectScore("");
      alert("Subject added for selected student!");
    } catch (error) {
      alert(error.message || "Failed to add subject for student");
    }
  };

  const removeSubjectForStudent = async (subjectIndex) => {
    if (!selectedSubjectStudent) {
      alert("Select a student");
      return;
    }

    const subject = selectedSubjectStudent.subjects?.[subjectIndex];
    if (!subject) {
      return;
    }

    if (!window.confirm(`Remove ${subject.subjectName} from ${selectedSubjectStudent.name}?`)) {
      return;
    }

    try {
      const updated = await removeStudentSubject(session.token, selectedSubjectStudent.id, subjectIndex + 1);
      setStudents((prev) => prev.map((student) => (student.id === selectedSubjectStudent.id ? updated : student)));
      alert("Subject removed for selected student!");
    } catch (error) {
      alert(error.message || "Failed to remove subject for student");
    }
  };

  const addStudent = async () => {
    if (!name || !studentId || !branch || !email || !studentPassword) {
      alert("Enter Name, ID, Branch, Email and Password");
      return;
    }

    try {
      const created = await createStudent(session.token, {
        name,
        studentId,
        branch,
        email,
        password: studentPassword,
        marks: subjectPayloadFrom(marks),
      });
      setStudents((prev) => [...prev, created]);
      setName("");
      setStudentId("");
      setBranch(BTECH_BRANCHES[0]);
      setEmail("");
      setStudentPassword("");
      setMarks(subjectNames.map(() => ""));
      alert("Student added successfully!");
    } catch (error) {
      alert(error.message || "Failed to add student");
    }
  };

  const updateMarks = async () => {
    if (!selectedId) {
      alert("Select a student");
      return;
    }

    try {
      const updated = await updateStudentMarks(session.token, selectedId, {
        marks: subjectPayloadFrom(newMarks, selectedStudentSubjectNames),
      });
      const profileUpdated = await updateStudentProfile(session.token, selectedId, {
        branch: selectedBranch,
      });
      setStudents((prev) => prev.map((student) => (student.id === selectedId ? { ...updated, branch: profileUpdated.branch } : student)));
      setNewMarks(subjectNames.map(() => ""));
      setSelectedId("");
      alert("Marks updated successfully!");
    } catch (error) {
      alert(error.message || "Failed to update marks");
    }
  };

  const handleDeleteStudent = async (id) => {
    if (!window.confirm("Are you sure you want to delete this student?")) {
      return;
    }

    try {
      await deleteStudent(session.token, id);
      setStudents((prev) => prev.filter((student) => student.id !== id));
      alert("Student deleted successfully!");
    } catch (error) {
      alert(error.message || "Failed to delete student");
    }
  };

  const submitAttendance = async () => {
    if (!attendanceStudentId || !attendanceDate) {
      alert("Select student and attendance date");
      return;
    }

    try {
      await markAttendance(session.token, {
        studentId: attendanceStudentId,
        attendanceDate,
        status: attendanceStatus,
      });
      setAttendanceStudentId("");
      setAttendanceDate("");
      setAttendanceStatus("PRESENT");
      alert("Attendance recorded successfully!");
    } catch (error) {
      alert(error.message || "Failed to record attendance");
    }
  };

  const renderPage = () => {
    if (activePage === "dashboard") {
      return <DashboardHome teacherName={session?.username || session?.user?.username} />;
    }

    if (activePage === "addStudent") {
      return (
        <div className="card">
          <h3>➕ Add New Student</h3>
          <div style={{ marginTop: "20px" }}>
            <div style={{ marginBottom: "15px" }}>
              <label style={{ display: "block", marginBottom: "5px", fontWeight: "500" }}>Student Name</label>
              <input
                placeholder="Enter student name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #d1d5db", fontSize: "1em" }}
              />
            </div>

            <div style={{ marginBottom: "15px" }}>
              <label style={{ display: "block", marginBottom: "5px", fontWeight: "500" }}>Student ID</label>
              <input
                placeholder="Unique identifier"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #d1d5db", fontSize: "1em" }}
              />
            </div>

            <div style={{ marginBottom: "15px" }}>
              <label style={{ display: "block", marginBottom: "5px", fontWeight: "500" }}>Email</label>
              <input
                placeholder="student@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #d1d5db", fontSize: "1em" }}
              />
            </div>

            <div style={{ marginBottom: "15px" }}>
              <label style={{ display: "block", marginBottom: "5px", fontWeight: "500" }}>B.Tech Branch</label>
              <select
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #d1d5db", fontSize: "1em" }}
              >
                {BTECH_BRANCHES.map((item) => (
                  <option key={item} value={item}>{item}</option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: "15px" }}>
              <label style={{ display: "block", marginBottom: "5px", fontWeight: "500" }}>Password</label>
              <input
                type="password"
                placeholder="Enter login password for student"
                value={studentPassword}
                onChange={(e) => setStudentPassword(e.target.value)}
                style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #d1d5db", fontSize: "1em" }}
              />
            </div>

            <h4 style={{ marginTop: "20px", marginBottom: "10px" }}>Subject Marks ({subjectNames.length} Subjects)</h4>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(100px, 1fr))", gap: "10px", marginBottom: "15px" }}>
              {marks.map((m, i) => (
                <div key={i}>
                  <label style={{ display: "block", marginBottom: "5px", fontSize: "0.9em", color: "#666" }}>
                    {subjectNames[i]}
                  </label>
                  <input
                    type="number"
                    placeholder="0-100"
                    value={m}
                    onChange={(e) => {
                      const copy = [...marks];
                      copy[i] = e.target.value;
                      setMarks(copy);
                    }}
                    min="0"
                    max="100"
                    style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #d1d5db", fontSize: "1em" }}
                  />
                </div>
              ))}
            </div>

            <button
              onClick={addStudent}
              style={{ padding: "10px 20px", backgroundColor: "#10b981", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "1em", fontWeight: "600" }}
            >
              ✅ Add Student
            </button>
          </div>
        </div>
      );
    }

    if (activePage === "updateMarks") {
      return (
        <div className="card">
          <h3>Update Student</h3>
          <div style={{ marginTop: "20px" }}>
            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", marginBottom: "8px", fontWeight: "500" }}>Select Student</label>
              <select
                value={selectedId}
                onChange={(e) => setSelectedId(e.target.value)}
                style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #d1d5db", fontSize: "1em" }}
              >
                <option value="">-- Choose a student --</option>
                {students.map((s) => (
                  <option key={s.id} value={s.id}>{s.name} ({s.id})</option>
                ))}
              </select>
            </div>

            {selectedId && (
              <>
                <h4 style={{ marginBottom: "10px" }}>Student Profile</h4>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "10px", marginBottom: "20px" }}>
                  <div style={{ padding: "12px", backgroundColor: "#f9fafb", borderRadius: "6px", border: "1px solid #e5e7eb" }}>
                    <div style={{ fontSize: "0.85em", color: "#666", marginBottom: "5px" }}>Student</div>
                    <div style={{ fontWeight: "700", color: "#1f2d3d" }}>{selectedStudent?.name} ({selectedStudent?.id})</div>
                  </div>
                  <div>
                    <label style={{ display: "block", marginBottom: "5px", fontSize: "0.9em", color: "#666" }}>B.Tech Branch</label>
                    <select
                      value={selectedBranch}
                      onChange={(e) => setSelectedBranch(e.target.value)}
                      style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #d1d5db", fontSize: "1em" }}
                    >
                      {BTECH_BRANCHES.map((item) => (
                        <option key={item} value={item}>{item}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <h4 style={{ marginBottom: "10px" }}>Existing Marks</h4>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: "10px", marginBottom: "20px" }}>
                  {selectedStudentSubjectNames.map((subjectName, i) => {
                    const currentMark = selectedStudent?.subjects?.[i]?.score ?? selectedStudent?.marks?.[i] ?? 0;
                    return (
                      <div key={subjectName} style={{ padding: "12px", backgroundColor: "#f9fafb", borderRadius: "6px", border: "1px solid #e5e7eb" }}>
                        <div style={{ fontSize: "0.85em", color: "#666", marginBottom: "5px" }}>{subjectName}</div>
                        <div style={{ fontSize: "1.4em", fontWeight: "700", color: "#1f2d3d" }}>{currentMark}/100</div>
                      </div>
                    );
                  })}
                </div>

                <h4 style={{ marginBottom: "10px" }}>New Marks</h4>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(100px, 1fr))", gap: "10px", marginBottom: "15px" }}>
                  {newMarks.map((m, i) => (
                    <div key={i}>
                      <label style={{ display: "block", marginBottom: "5px", fontSize: "0.9em", color: "#666" }}>
                        {selectedStudentSubjectNames[i]}
                      </label>
                      <input
                        type="number"
                        placeholder="0-100"
                        value={m}
                        onChange={(e) => {
                          const copy = [...newMarks];
                          copy[i] = e.target.value;
                          setNewMarks(copy);
                        }}
                        min="0"
                        max="100"
                        style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #d1d5db", fontSize: "1em" }}
                      />
                    </div>
                  ))}
                </div>
              </>
            )}

            <button
              onClick={updateMarks}
              style={{ padding: "10px 20px", backgroundColor: "#3b82f6", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "1em", fontWeight: "600" }}
            >
              Update Student
            </button>
          </div>
        </div>
      );
    }

    if (activePage === "listStudents" || activePage === "deleteStudent") {
      return (
        <div className="card">
          <h3>👥 All Students ({students.length})</h3>
          {students.length === 0 ? (
            <p style={{ color: "#999", marginTop: "20px" }}>No students added yet.</p>
          ) : (
            <div style={{ marginTop: "20px", overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ backgroundColor: "#f3f4f6", borderBottom: "2px solid #d1d5db" }}>
                    <th style={{ padding: "10px", textAlign: "left", fontWeight: "600" }}>Name</th>
                    <th style={{ padding: "10px", textAlign: "left", fontWeight: "600" }}>ID</th>
                    <th style={{ padding: "10px", textAlign: "left", fontWeight: "600" }}>Branch</th>
                    <th style={{ padding: "10px", textAlign: "left", fontWeight: "600" }}>Average</th>
                    <th style={{ padding: "10px", textAlign: "center", fontWeight: "600" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((s) => (
                    <tr key={s.id} style={{ borderBottom: "1px solid #e5e7eb" }}>
                      <td style={{ padding: "10px" }}>{s.name}</td>
                      <td style={{ padding: "10px" }}>{s.id}</td>
                      <td style={{ padding: "10px" }}>{s.branch || "Not set"}</td>
                      <td style={{ padding: "10px", fontWeight: "600" }}>{(s.average ?? 0).toFixed(2)}</td>
                      <td style={{ padding: "10px", textAlign: "center" }}>
                        <button
                          onClick={() => handleDeleteStudent(s.id)}
                          style={{ padding: "6px 12px", backgroundColor: "#ef4444", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "0.9em" }}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      );
    }


    if (activePage === "reports") {
      return <Report students={students} />;
    }

    if (activePage === "attendance") {
      return (
        <div className="card">
          <h3>📋 Attendance Register</h3>
          <div style={{ marginTop: "20px" }}>
            <div style={{ marginBottom: "15px" }}>
              <label style={{ display: "block", marginBottom: "8px", fontWeight: "500" }}>Select Student</label>
              <select
                value={attendanceStudentId}
                onChange={(e) => setAttendanceStudentId(e.target.value)}
                style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #d1d5db", fontSize: "1em" }}
              >
                <option value="">-- Choose a student --</option>
                {students.map((s) => (
                  <option key={s.id} value={s.id}>{s.name} ({s.id})</option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: "15px" }}>
              <label style={{ display: "block", marginBottom: "8px", fontWeight: "500" }}>Date</label>
              <input
                type="date"
                value={attendanceDate}
                onChange={(e) => setAttendanceDate(e.target.value)}
                style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #d1d5db", fontSize: "1em" }}
              />
            </div>

            <div style={{ marginBottom: "15px" }}>
              <label style={{ display: "block", marginBottom: "8px", fontWeight: "500" }}>Status</label>
              <select
                value={attendanceStatus}
                onChange={(e) => setAttendanceStatus(e.target.value)}
                style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #d1d5db", fontSize: "1em" }}
              >
                <option value="PRESENT">Present</option>
                <option value="ABSENT">Absent</option>
                <option value="LATE">Late</option>
              </select>
            </div>

            <button
              onClick={submitAttendance}
              style={{ padding: "10px 20px", backgroundColor: "#10b981", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "1em", fontWeight: "600" }}
            >
              ✅ Save Attendance
            </button>
          </div>
        </div>
      );
    }

    if (activePage === "addSubject") {
      return (
        <div className="card">
          <h3>Subject Management</h3>

          <div style={{ marginTop: "20px", paddingBottom: "22px", borderBottom: "1px solid #e5e7eb" }}>
            <h4 style={{ marginTop: 0, marginBottom: "10px", color: "#1f2d3d" }}>Common Subjects</h4>
            <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
              <input
                placeholder="Enter common subject name"
                value={subjectDraft}
                onChange={(e) => setSubjectDraft(e.target.value)}
                style={{ flex: 1, padding: "10px", borderRadius: "6px", border: "1px solid #d1d5db", fontSize: "1em" }}
              />
              <button
                onClick={addSubject}
                style={{ padding: "10px 18px", backgroundColor: "#10b981", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "600" }}
              >
                Add Common Subject
              </button>
            </div>

            <div style={{ marginBottom: "12px" }}>
              <label style={{ display: "block", marginBottom: "5px", fontSize: "0.9em", color: "#666" }}>
                Remove a common subject from one student
              </label>
              <select
                value={commonSubjectStudentId}
                onChange={(e) => setCommonSubjectStudentId(e.target.value)}
                style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #d1d5db", fontSize: "1em" }}
              >
                <option value="">-- Choose a student --</option>
                {students.map((student) => (
                  <option key={student.id} value={student.id}>{student.name} ({student.id})</option>
                ))}
              </select>
            </div>

            <div style={{ display: "grid", gap: "10px" }}>
              {subjectNames.map((subjectName, index) => (
                <div key={subjectName} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px", backgroundColor: "#f9fafb", borderRadius: "6px", border: "1px solid #e5e7eb" }}>
                  <span style={{ fontWeight: "600", color: "#1f2d3d" }}>{subjectName}</span>
                  <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", justifyContent: "flex-end" }}>
                    <button
                      onClick={() => removeCommonSubjectForStudent(index)}
                      style={{ padding: "7px 12px", backgroundColor: "#3b82f6", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "600" }}
                    >
                      Remove From Student
                    </button>
                    <button
                      onClick={() => removeSubject(index)}
                      style={{ padding: "7px 12px", backgroundColor: "#ef4444", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "600" }}
                    >
                      Remove From All
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ marginTop: "22px" }}>
            <h4 style={{ marginTop: 0, marginBottom: "10px", color: "#1f2d3d" }}>Student-Specific Subjects</h4>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "10px", marginBottom: "15px" }}>
              <select
                value={subjectStudentId}
                onChange={(e) => setSubjectStudentId(e.target.value)}
                style={{ padding: "10px", borderRadius: "6px", border: "1px solid #d1d5db", fontSize: "1em" }}
              >
                <option value="">-- Choose a student --</option>
                {students.map((student) => (
                  <option key={student.id} value={student.id}>{student.name} ({student.id})</option>
                ))}
              </select>
              <input
                placeholder="Subject for selected student"
                value={studentSubjectDraft}
                onChange={(e) => setStudentSubjectDraft(e.target.value)}
                style={{ padding: "10px", borderRadius: "6px", border: "1px solid #d1d5db", fontSize: "1em" }}
              />
              <input
                type="number"
                min="0"
                max="100"
                placeholder="Initial mark"
                value={studentSubjectScore}
                onChange={(e) => setStudentSubjectScore(e.target.value)}
                style={{ padding: "10px", borderRadius: "6px", border: "1px solid #d1d5db", fontSize: "1em" }}
              />
              <button
                onClick={addSubjectForStudent}
                style={{ padding: "10px 18px", backgroundColor: "#3b82f6", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "600" }}
              >
                Add To Student
              </button>
            </div>

            {selectedSubjectStudent && (
              <div style={{ display: "grid", gap: "10px" }}>
                {selectedSubjectStudent.subjects?.map((subject, index) => (
                  <div key={subject.subjectName + "-" + index} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px", backgroundColor: "#f9fafb", borderRadius: "6px", border: "1px solid #e5e7eb" }}>
                    <span style={{ fontWeight: "600", color: "#1f2d3d" }}>{subject.subjectName} <span style={{ color: "#666", fontWeight: "400" }}>({subject.score}/100)</span></span>
                    <button
                      onClick={() => removeSubjectForStudent(index)}
                      style={{ padding: "7px 12px", backgroundColor: "#ef4444", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "600" }}
                    >
                      Remove From Student
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="dashboard">
      <Sidebar setActivePage={setActivePage} role="teacher" />
      <div className="main">
        <div className="topbar">
          <button className="logout-btn" onClick={onLogout}>Logout</button>
        </div>
        {renderPage()}
      </div>
    </div>
  );
}

export default TeacherDashboard;
