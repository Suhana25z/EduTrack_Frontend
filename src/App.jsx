import React, { useEffect, useState } from "react";
import TeacherDashboard from "./components/TeacherDashboard";
import StudentDashboard from "./components/StudentDashboard";
import { clearSession, getSession, login, saveSession } from "./api";
import "./App.css";

function App() {
  const [page, setPage] = useState("role");
  const [role, setRole] = useState(null);
  const [session, setSession] = useState(null);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const existingSession = getSession();
    if (existingSession) {
      setSession(existingSession);
      setRole(existingSession.role?.toLowerCase() || null);
      setPage("dashboard");
    }
  }, []);

  const resetFields = () => {
    setUsername("");
    setPassword("");
    setLoading(false);
  };

  const startSession = (authData) => {
    const nextSession = {
      token: authData.token,
      role: authData.role,
      username: authData.username,
      email: authData.email,
      studentId: authData.studentId || null,
    };

    saveSession(nextSession);
    setSession(nextSession);
    setRole(authData.role.toLowerCase());
    setPage("dashboard");
    resetFields();
  };

  const handleTeacherLogin = async () => {
    const teacherRegex = /^[A-Za-z]+[0-9]{5}$/;

    if (!teacherRegex.test(username)) {
      alert("Teacher username must be Name + 5 digit ID.\nExample: Ramesh12345");
      return;
    }

    if (!password) {
      alert("Enter Password");
      return;
    }

    try {
      setLoading(true);
      const authData = await login({ login: username, password });
      if (authData.role !== "TEACHER") {
        alert("This account is not a teacher account");
        return;
      }
      startSession(authData);
    } catch (error) {
      alert(error.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleStudentLogin = async () => {
    if (!username) {
      alert("Enter your student ID");
      return;
    }

    if (!password) {
      alert("Enter Password");
      return;
    }

    try {
      setLoading(true);
      const authData = await login({ login: username, password });
      if (authData.role !== "STUDENT") {
        alert("This account is not a student account");
        return;
      }
      startSession(authData);
    } catch (error) {
      alert(error.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    clearSession();
    setSession(null);
    setRole(null);
    setPage("role");
    resetFields();
  };

  if (page === "role") {
    return (
      <div className="login-container">
        <div className="login-header">
          <h1>Student Performance<br/>Management System</h1>
          <p className="subtitle">Track, Review & Improve Student Performance</p>
        </div>
        <div className="role-selection">
          <div className="role-card" onClick={() => setPage("teacherLogin")}>
            <div className="role-icon">👨‍🏫</div>
            <h3>Teacher</h3>
            <p>Manage student performance & create reports</p>
            <button className="role-btn">Teacher Login</button>
          </div>

          <div className="role-card" onClick={() => setPage("studentLogin")}>
            <div className="role-icon">👨‍🎓</div>
            <h3>Student</h3>
            <p>View your grades & performance analysis</p>
            <button className="role-btn">Student Login</button>
          </div>
        </div>
      </div>
    );
  }

  if (page === "teacherLogin") {
    return (
      <div className="login-container">
        <div className="login-header">
          <h2>👨‍🏫 Teacher Login</h2>
          <p className="subtitle">Enter your credentials to continue</p>
        </div>
        <div className="login-box">
          <div className="input-group">
            <label>Username</label>
            <input
              type="text"
              placeholder="Name + 5 digit ID (e.g., Ramesh12345)"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="login-input"
            />
          </div>

          <div className="input-group">
            <label>Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="login-input"
            />
          </div>

          <button className="btn btn-primary" onClick={handleTeacherLogin} disabled={loading}>
            {loading ? "Logging in..." : "🔐 Login"}
          </button>

          <button
            className="btn btn-secondary"
            onClick={() => setPage("role")}
          >
            ← Back
          </button>
        </div>
      </div>
    );
  }

  if (page === "studentLogin") {
    return (
      <div className="login-container">
        <div className="login-header">
          <h2>👨‍🎓 Student Login</h2>
          <p className="subtitle">Access your academic performance dashboard</p>
        </div>
        <div className="login-box">
          <div className="input-group">
            <label>Student ID</label>
            <input
              type="text"
              placeholder="Enter your student ID"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="login-input"
            />
          </div>

          <div className="input-group">
            <label>Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="login-input"
            />
          </div>

          <button className="btn btn-primary" onClick={handleStudentLogin} disabled={loading}>
            {loading ? "Logging in..." : "🔐 Login"}
          </button>

          <button
            className="btn btn-secondary"
            onClick={() => setPage("role")}
          >
            ← Back
          </button>
        </div>
      </div>
    );
  }

  if (role === "teacher") {
    return <TeacherDashboard onLogout={handleLogout} session={session} />;
  }

  return <StudentDashboard onLogout={handleLogout} session={session} />;
}

export default App;
