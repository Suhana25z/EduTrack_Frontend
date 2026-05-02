import React, { useEffect, useMemo, useState } from "react";
import Sidebar from "./Sidebar";
import {
  calculateClassMetrics,
  calculateMetrics,
  identifyStrengths,
  identifyWeaknesses,
  getGradeColor,
  getPerformanceTrend,
  getComparisonWithClass
} from "../utils/performanceAnalytics";
import { generateStudentRecommendations } from "../utils/recommendationEngine";
import {
  getStudentAttendance,
  getStudentDashboard,
  getStudentRecommendations,
} from "../api";
import { normalizeSubjectName } from "../utils/subjects";

function StudentDashboard({ onLogout, session }) {
  const [activePage, setActivePage] = useState("dashboard");
  const [student, setStudent] = useState(null);
  const [attendance, setAttendance] = useState([]);
  const [serverRecommendations, setServerRecommendations] = useState(null);

  useEffect(() => {
    async function loadStudentData() {
      try {
        const [dashboardData, recommendationData, attendanceData] = await Promise.all([
          getStudentDashboard(session?.token),
          getStudentRecommendations(session?.token),
          getStudentAttendance(session?.token),
        ]);

        const normalizedStudent = {
          id: dashboardData.studentId,
          name: dashboardData.studentName,
          branch: dashboardData.branch,
          marks: (dashboardData.marks || []).map((item) => item.score),
          subjects: (dashboardData.marks || []).map((item, index) => ({
            ...item,
            subjectName: normalizeSubjectName(item.subjectName, index),
          })),
          classAverage: dashboardData.classAverage,
          trend: dashboardData.trend,
          performanceLevel: dashboardData.performanceLevel,
        };

        setStudent(normalizedStudent);
        setServerRecommendations(recommendationData);
        setAttendance(attendanceData || []);
      } catch (error) {
        alert(error.message || "Failed to load student data");
      }
    }

    if (session?.token) {
      loadStudentData();
    }
  }, [session]);

  const safeStudent = useMemo(
    () =>
      student || {
        id: "",
        name: "",
        branch: "",
        marks: [],
        subjects: [],
        classAverage: 0,
        trend: "stable",
        performanceLevel: "",
      },
    [student]
  );

  const metrics = useMemo(() => calculateMetrics(safeStudent), [safeStudent]);
  const classMetrics = useMemo(() => calculateClassMetrics(safeStudent.marks.length ? [safeStudent] : []), [safeStudent]);
  const strengths = useMemo(() => identifyStrengths(safeStudent), [safeStudent]);
  const weaknesses = useMemo(() => identifyWeaknesses(safeStudent), [safeStudent]);
  const trend = useMemo(() => safeStudent.trend || getPerformanceTrend(safeStudent), [safeStudent]);
  const classAverage = safeStudent.classAverage ?? classMetrics.classAverage;
  const classComparison = useMemo(
    () => getComparisonWithClass(metrics.average, classAverage),
    [metrics.average, classAverage]
  );
  const localRecommendations = useMemo(
    () => generateStudentRecommendations(safeStudent, classAverage),
    [safeStudent, classAverage]
  );
  const recommendations = serverRecommendations || localRecommendations;
  const subjectNameAt = (index) => normalizeSubjectName(safeStudent.subjects?.[index]?.subjectName, index);
  const cgpa = Math.min(10, Math.max(0, metrics.average / 10)).toFixed(2);
  const passCount = safeStudent.marks.filter((mark) => mark >= 40).length;
  const needsAttentionCount = safeStudent.marks.filter((mark) => mark < 60).length;

  const getGrade = (mark) => {
    if (mark >= 90) return "A";
    if (mark >= 80) return "B";
    if (mark >= 70) return "C";
    if (mark >= 60) return "D";
    return "F";
  };

  const getPerformanceLevel = () => safeStudent.performanceLevel || (() => {
    if (metrics.average >= 90) return "Excellent";
    if (metrics.average >= 80) return "Very Good";
    if (metrics.average >= 70) return "Good";
    if (metrics.average >= 60) return "Satisfactory";
    return "Needs Improvement";
  })();

  if (!student) {
    return (
      <div className="dashboard">
        <Sidebar setActivePage={setActivePage} role="student" />
        <div className="main">
          <div className="topbar">
            <button className="logout-btn" onClick={onLogout}>Logout</button>
          </div>
          <div className="card">Loading student dashboard...</div>
        </div>
      </div>
    );
  }

  const getTrendEmoji = () => {
    if (trend === "improving") return "📈";
    if (trend === "declining") return "📉";
    return "➡️";
  };

  const renderPage = () => {
    if (activePage === "dashboard") {
      return (
        <>
          <div className="card" style={{ marginBottom: "20px" }}>
            <h2>👋 Welcome, {student.name}</h2>
            {student.branch && <p style={{ color: "#4b5563", marginTop: 0 }}>{student.branch}</p>}
            <p style={{ color: "#666" }}>Here's your academic performance snapshot</p>
          </div>

          <div className="metrics-grid">
            <div className="metric-card">
              <div style={{ fontSize: "2em", marginBottom: "5px" }}>📊</div>
              <div style={{ color: "#666", fontSize: "0.85em" }}>Average Score</div>
              <div style={{ fontSize: "1.8em", fontWeight: "700", color: getGradeColor(metrics.average) }}>
                {metrics.average}%
              </div>
            </div>

            <div className="metric-card">
              <div style={{ fontSize: "2em", marginBottom: "5px" }}>🎯</div>
              <div style={{ color: "#666", fontSize: "0.85em" }}>Current Status</div>
              <div style={{ fontSize: "1.2em", fontWeight: "700", color: getGradeColor(metrics.average) }}>
                {getPerformanceLevel()}
              </div>
            </div>

            <div className="metric-card">
              <div style={{ fontSize: "2em", marginBottom: "5px" }}>🏆</div>
              <div style={{ color: "#666", fontSize: "0.85em" }}>Total Marks</div>
              <div style={{ fontSize: "1.8em", fontWeight: "700", color: "#3b82f6" }}>
                {metrics.total}
              </div>
            </div>

            <div className="metric-card">
              <div style={{ fontSize: "2em", marginBottom: "5px" }}>{getTrendEmoji()}</div>
              <div style={{ color: "#666", fontSize: "0.85em" }}>Performance Trend</div>
              <div style={{ fontSize: "1.2em", fontWeight: "700", color: trend === "improving" ? "#10b981" : trend === "declining" ? "#ef4444" : "#f59e0b" }}>
                {trend === "improving" ? "Improving" : trend === "declining" ? "Declining" : "Stable"}
              </div>
            </div>
          </div>

          <div className="card" style={{ marginTop: "20px" }}>
            <h3 style={{ marginTop: 0 }}>📍 Class Comparison</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
              <div style={{ backgroundColor: "#f3f4f6", padding: "12px", borderRadius: "6px" }}>
                <div style={{ fontSize: "0.85em", color: "#666", marginBottom: "5px" }}>Your Average</div>
                <div style={{ fontSize: "1.8em", fontWeight: "700", color: getGradeColor(metrics.average) }}>
                  {metrics.average}
                </div>
              </div>
              <div style={{ backgroundColor: "#f3f4f6", padding: "12px", borderRadius: "6px" }}>
                <div style={{ fontSize: "0.85em", color: "#666", marginBottom: "5px" }}>Class Average</div>
                <div style={{ fontSize: "1.8em", fontWeight: "700", color: "#6366f1" }}>
                  {classAverage}
                </div>
              </div>
            </div>
            <div style={{
              marginTop: "12px",
              padding: "12px",
              backgroundColor: classComparison.status.includes("above") ? "#f0fdf4" : "#fef2f2",
              borderLeft: `3px solid ${classComparison.color}`,
              borderRadius: "4px",
              color: "#666"
            }}>
              <strong style={{ color: classComparison.color }}>{classComparison.text}</strong>
              <div style={{ fontSize: "0.9em", marginTop: "5px" }}>
                Difference: <span style={{ color: classComparison.color }}>
                  {(metrics.average - classAverage).toFixed(1)} points
                </span>
              </div>
            </div>
          </div>
        </>
      );
    }

    if (activePage === "marks") {
      return (
        <div className="card">
          <h3>📚 My Marks by Subject</h3>
          <div style={{ marginTop: "20px" }}>
            {student.marks.map((m, i) => (
              <div key={i} style={{ marginBottom: "15px", padding: "12px", backgroundColor: "#f9fafb", borderRadius: "6px", border: "1px solid #e5e7eb" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                  <div style={{ fontWeight: "600" }}>{subjectNameAt(i)}</div>
                  <div style={{ fontSize: "1.5em", fontWeight: "700", color: getGradeColor(m) }}>
                    {m}
                  </div>
                </div>
                <div style={{ height: "8px", backgroundColor: "#e5e7eb", borderRadius: "4px", overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${m}%`, backgroundColor: getGradeColor(m), transition: "width 0.3s ease" }} />
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: "6px", fontSize: "0.85em", color: "#666" }}>
                  <span>{m}/100</span>
                  <span className="grade-badge" style={{ backgroundColor: getGradeColor(m), color: "white", padding: "2px 8px", borderRadius: "4px", fontSize: "0.8em", fontWeight: "600" }}>
                    {getGrade(m)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (activePage === "grades") {
      return (
        <div className="card">
          <h3>My Grades</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(100px, 1fr))", gap: "12px", marginTop: "20px" }}>
            {student.marks.map((m, i) => (
              <div key={i} style={{ padding: "15px", backgroundColor: getGradeColor(m), color: "white", borderRadius: "8px", textAlign: "center" }}>
                <div style={{ fontSize: "0.9em", opacity: 0.9 }}>{subjectNameAt(i)}</div>
                <div style={{ fontSize: "2.5em", fontWeight: "700", margin: "5px 0" }}>
                  {getGrade(m)}
                </div>
                <div style={{ fontSize: "0.85em", opacity: 0.9 }}>{m}/100</div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (activePage === "cgpa") {
      return (
        <div className="card">
          <h3>My CGPA</h3>
          <div className="cgpa-display">
            <div className="cgpa-circle" style={{ background: `conic-gradient(#2563eb ${Number(cgpa) * 10}%, #e5e7eb 0)` }}>
              <div style={{ width: "160px", height: "160px", borderRadius: "50%", backgroundColor: "white", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                <div className="cgpa-value">{cgpa}</div>
                <div className="cgpa-label">out of 10</div>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "12px", width: "100%", marginTop: "10px" }}>
              <div className="metric-card">
                <div className="metric-label">Average Score</div>
                <div className="metric-value" style={{ color: getGradeColor(metrics.average) }}>{metrics.average}%</div>
              </div>
              <div className="metric-card">
                <div className="metric-label">Subjects Passed</div>
                <div className="metric-value" style={{ color: "#10b981" }}>{passCount}/{student.marks.length}</div>
              </div>
              <div className="metric-card">
                <div className="metric-label">Performance Level</div>
                <div className="metric-value" style={{ fontSize: "1.3em", color: getGradeColor(metrics.average) }}>{getPerformanceLevel()}</div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (activePage === "analysis") {
      return (
        <>
          <div className="card" style={{ marginBottom: "20px" }}>
            <h3 style={{ marginTop: 0 }}>📈 Detailed Performance Analysis</h3>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "12px", marginBottom: "20px" }}>
              <div style={{ padding: "15px", border: "1px solid #e5e7eb", borderRadius: "6px", textAlign: "center" }}>
                <div style={{ color: "#666", fontSize: "0.85em", marginBottom: "5px" }}>Highest Mark</div>
                <div style={{ fontSize: "2em", fontWeight: "700", color: "#10b981" }}>{metrics.highest}</div>
              </div>
              <div style={{ padding: "15px", border: "1px solid #e5e7eb", borderRadius: "6px", textAlign: "center" }}>
                <div style={{ color: "#666", fontSize: "0.85em", marginBottom: "5px" }}>Lowest Mark</div>
                <div style={{ fontSize: "2em", fontWeight: "700", color: "#ef4444" }}>{metrics.lowest}</div>
              </div>
              <div style={{ padding: "15px", border: "1px solid #e5e7eb", borderRadius: "6px", textAlign: "center" }}>
                <div style={{ color: "#666", fontSize: "0.85em", marginBottom: "5px" }}>Score Range</div>
                <div style={{ fontSize: "2em", fontWeight: "700", color: "#3b82f6" }}>{metrics.highest - metrics.lowest}</div>
              </div>
              <div style={{ padding: "15px", border: "1px solid #e5e7eb", borderRadius: "6px", textAlign: "center" }}>
                <div style={{ color: "#666", fontSize: "0.85em", marginBottom: "5px" }}>Consistency</div>
                <div style={{ fontSize: "2em", fontWeight: "700", color: "#f59e0b" }}>{metrics.consistencyScore}%</div>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "12px", marginBottom: "20px" }}>
              <div style={{ padding: "15px", backgroundColor: "#eff6ff", borderLeft: "3px solid #3b82f6", borderRadius: "6px" }}>
                <div style={{ color: "#666", fontSize: "0.85em", marginBottom: "5px" }}>CGPA Estimate</div>
                <div style={{ fontSize: "1.8em", fontWeight: "700", color: "#2563eb" }}>{cgpa}</div>
              </div>
              <div style={{ padding: "15px", backgroundColor: "#f0fdf4", borderLeft: "3px solid #10b981", borderRadius: "6px" }}>
                <div style={{ color: "#666", fontSize: "0.85em", marginBottom: "5px" }}>Passed Subjects</div>
                <div style={{ fontSize: "1.8em", fontWeight: "700", color: "#10b981" }}>{passCount}/{student.marks.length}</div>
              </div>
              <div style={{ padding: "15px", backgroundColor: needsAttentionCount ? "#fef2f2" : "#f9fafb", borderLeft: `3px solid ${needsAttentionCount ? "#ef4444" : "#9ca3af"}`, borderRadius: "6px" }}>
                <div style={{ color: "#666", fontSize: "0.85em", marginBottom: "5px" }}>Needs Attention</div>
                <div style={{ fontSize: "1.8em", fontWeight: "700", color: needsAttentionCount ? "#ef4444" : "#4b5563" }}>{needsAttentionCount}</div>
              </div>
            </div>

            <div style={{ marginBottom: "20px" }}>
              <h4 style={{ color: "#1f2d3d", marginBottom: "10px" }}>Subject Balance</h4>
              <div style={{ display: "grid", gap: "10px" }}>
                {student.marks.map((mark, index) => (
                  <div key={index} style={{ display: "grid", gridTemplateColumns: "140px 1fr 55px", gap: "10px", alignItems: "center" }}>
                    <div style={{ fontWeight: "600", color: "#1f2d3d" }}>{subjectNameAt(index)}</div>
                    <div style={{ height: "8px", backgroundColor: "#e5e7eb", borderRadius: "4px", overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${mark}%`, backgroundColor: getGradeColor(mark) }} />
                    </div>
                    <div style={{ fontWeight: "700", color: getGradeColor(mark), textAlign: "right" }}>{mark}</div>
                  </div>
                ))}
              </div>
            </div>

            {strengths.length > 0 && (
              <div style={{ marginBottom: "20px" }}>
                <h4 style={{ color: "#10b981", marginBottom: "10px" }}>✅ Your Strengths</h4>
                <div style={{ display: "grid", gap: "8px" }}>
                  {strengths.map((s, idx) => (
                    <div key={idx} style={{ padding: "10px", backgroundColor: "#f0fdf4", borderLeft: "3px solid #10b981", borderRadius: "4px" }}>
                      <div style={{ fontWeight: "600", marginBottom: "3px" }}>{subjectNameAt(s.subject)}</div>
                      <div style={{ fontSize: "0.9em", color: "#666" }}>
                        Score: {s.score} | {s.difference.toFixed(1)} points above your average
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {weaknesses.length > 0 && (
              <div>
                <h4 style={{ color: "#ef4444", marginBottom: "10px" }}>📌 Areas for Improvement</h4>
                <div style={{ display: "grid", gap: "8px" }}>
                  {weaknesses.map((w, idx) => (
                    <div key={idx} style={{ padding: "10px", backgroundColor: "#fef2f2", borderLeft: "3px solid #ef4444", borderRadius: "4px" }}>
                      <div style={{ fontWeight: "600", marginBottom: "3px" }}>{subjectNameAt(w.subject)}</div>
                      <div style={{ fontSize: "0.9em", color: "#666" }}>
                        Score: {w.score} | {w.gap.toFixed(1)} points below your average
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </>
      );
    }

    if (activePage === "reports") {
      return (
        <>
          <div className="card" style={{ marginBottom: "20px" }}>
            <h3 style={{ marginTop: 0 }}>📋 Personalized Recommendations</h3>

            {recommendations.overallSuggestions?.length > 0 && (
              <div style={{ marginBottom: "25px" }}>
                <h4 style={{ color: "#3b82f6", marginBottom: "12px" }}>🎯 Overall Suggestions</h4>
                <ul style={{ margin: "0", paddingLeft: "20px", color: "#4b5563" }}>
                  {recommendations.overallSuggestions.map((sug, idx) => (
                    <li key={idx} style={{ marginBottom: "8px", lineHeight: "1.5" }}>{sug}</li>
                  ))}
                </ul>
              </div>
            )}

            {recommendations.subjectSpecific?.length > 0 && (
              <div style={{ marginBottom: "25px" }}>
                <h4 style={{ color: "#ef4444", marginBottom: "12px" }}>📚 Subject-Specific Strategies</h4>
                {recommendations.subjectSpecific.map((subject, idx) => (
                  <div key={idx} style={{ marginBottom: "15px", padding: "12px", backgroundColor: "#fef2f2", borderLeft: "3px solid #ef4444", borderRadius: "6px" }}>
                    <div style={{ fontWeight: "600", marginBottom: "8px" }}>
                      {subject.subjectName} (Score: {subject.currentScore}/100)
                    </div>
                    <ul style={{ margin: "0", paddingLeft: "20px", fontSize: "0.95em", color: "#4b5563" }}>
                      {subject.strategies.map((strategy, sidx) => (
                        <li key={sidx} style={{ marginBottom: "6px" }}>{strategy}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}

            {recommendations.trends?.length > 0 && (
              <div style={{ marginBottom: "25px" }}>
                <h4 style={{ color: "#f59e0b", marginBottom: "12px" }}>📊 Performance Insights</h4>
                <ul style={{ margin: "0", paddingLeft: "20px", color: "#4b5563" }}>
                  {recommendations.trends.map((item, idx) => (
                    <li key={idx} style={{ marginBottom: "8px", lineHeight: "1.5" }}>{item}</li>
                  ))}
                </ul>
              </div>
            )}

            {recommendations.nextSteps?.length > 0 && (
              <div style={{ padding: "12px", backgroundColor: "#f0fdf4", borderLeft: "3px solid #10b981", borderRadius: "6px" }}>
                <h4 style={{ marginTop: 0, color: "#10b981" }}>✅ Next Steps</h4>
                <ul style={{ margin: "0", paddingLeft: "20px", color: "#4b5563" }}>
                  {recommendations.nextSteps.map((step, idx) => (
                    <li key={idx} style={{ marginBottom: "8px", lineHeight: "1.5" }}>{step}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </>
      );
    }

    if (activePage === "attendance") {
      return (
        <div className="card">
          <h3>📋 Attendance Register</h3>
          {attendance.length === 0 ? (
            <p style={{ color: "#666", marginTop: "20px" }}>No attendance records available yet.</p>
          ) : (
            <div style={{ marginTop: "20px", overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ backgroundColor: "#f3f4f6", borderBottom: "2px solid #d1d5db" }}>
                    <th style={{ padding: "10px", textAlign: "left" }}>Date</th>
                    <th style={{ padding: "10px", textAlign: "left" }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {attendance.map((record) => (
                    <tr key={record.id} style={{ borderBottom: "1px solid #e5e7eb" }}>
                      <td style={{ padding: "10px" }}>{record.attendanceDate}</td>
                      <td style={{ padding: "10px" }}>{record.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      );
    }

    return (
      <div className="card">
        <h2>Welcome, {student.name}</h2>
        <p>Use the sidebar to explore your performance data and get personalized recommendations.</p>
      </div>
    );
  };

  return (
    <div className="dashboard">
      <Sidebar setActivePage={setActivePage} role="student" />
      <div className="main">
        <div className="topbar">
          <button className="logout-btn" onClick={onLogout}>Logout</button>
        </div>
        {renderPage()}
      </div>
    </div>
  );
}

export default StudentDashboard;
