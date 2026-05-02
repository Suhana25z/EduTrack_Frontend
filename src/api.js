import { normalizeSubjectName } from "./utils/subjects";

const API_BASE = "http://localhost:8080/api";

const TOKEN_KEY = "edutrackToken";
const ROLE_KEY = "edutrackRole";
const USER_KEY = "edutrackUser";

function parseJsonSafely(text) {
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, options);
  const text = await response.text();
  const data = parseJsonSafely(text);

  if (!response.ok) {
    throw new Error(data?.message || data?.error || `Request failed with status ${response.status}`);
  }

  return data;
}

function getHeaders(token, hasBody = false) {
  return {
    ...(hasBody ? { "Content-Type": "application/json" } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export function saveSession(session) {
  localStorage.setItem(TOKEN_KEY, session.token);
  localStorage.setItem(ROLE_KEY, session.role);
  localStorage.setItem(USER_KEY, JSON.stringify(session));
}

export function getSession() {
  const token = localStorage.getItem(TOKEN_KEY);
  const role = localStorage.getItem(ROLE_KEY);
  const user = parseJsonSafely(localStorage.getItem(USER_KEY));

  if (!token || !role || !user) {
    return null;
  }

  return { ...user, token, role };
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(ROLE_KEY);
  localStorage.removeItem(USER_KEY);
}

export function normalizeStudent(student) {
  return {
    backendId: student.id,
    id: student.studentId,
    name: student.name,
    branch: student.branch,
    email: student.email,
    average: student.average ?? 0,
    total: student.total ?? 0,
    joinedAt: student.joinedAt,
    marks: (student.marks || []).map((item) => item.score),
    subjects: (student.marks || []).map((item, index) => ({
      subjectName: normalizeSubjectName(item.subjectName, index),
      score: item.score,
      grade: item.grade,
    })),
  };
}

export async function login(payload) {
  return request("/auth/login", {
    method: "POST",
    headers: getHeaders(null, true),
    body: JSON.stringify(payload),
  });
}

export async function getTeacherStudents(token) {
  const data = await request("/teacher/students", {
    headers: getHeaders(token),
  });
  return data.map(normalizeStudent);
}

export async function getTeacherSubjects(token) {
  return request("/teacher/subjects", {
    headers: getHeaders(token),
  });
}

export async function addTeacherSubject(token, name) {
  return request("/teacher/subjects", {
    method: "POST",
    headers: getHeaders(token, true),
    body: JSON.stringify({ name }),
  });
}

export async function removeTeacherSubject(token, subjectId) {
  return request(`/teacher/subjects/${subjectId}`, {
    method: "DELETE",
    headers: getHeaders(token),
  });
}

export async function createStudent(token, payload) {
  const data = await request("/teacher/students", {
    method: "POST",
    headers: getHeaders(token, true),
    body: JSON.stringify(payload),
  });
  return normalizeStudent(data);
}

export async function updateStudentMarks(token, studentId, payload) {
  const data = await request(`/teacher/students/${studentId}/marks`, {
    method: "PUT",
    headers: getHeaders(token, true),
    body: JSON.stringify(payload),
  });
  return normalizeStudent(data);
}

export async function updateStudentProfile(token, studentId, payload) {
  const data = await request(`/teacher/students/${studentId}/profile`, {
    method: "PUT",
    headers: getHeaders(token, true),
    body: JSON.stringify(payload),
  });
  return normalizeStudent(data);
}

export async function addStudentSubject(token, studentId, payload) {
  const data = await request(`/teacher/students/${studentId}/subjects`, {
    method: "POST",
    headers: getHeaders(token, true),
    body: JSON.stringify(payload),
  });
  return normalizeStudent(data);
}

export async function removeStudentSubject(token, studentId, subjectOrder) {
  const data = await request(`/teacher/students/${studentId}/subjects/${subjectOrder}`, {
    method: "DELETE",
    headers: getHeaders(token),
  });
  return normalizeStudent(data);
}

export async function deleteStudent(token, studentId) {
  return request(`/teacher/students/${studentId}`, {
    method: "DELETE",
    headers: getHeaders(token),
  });
}

export async function getStudentDashboard(token) {
  return request("/student/dashboard", {
    headers: getHeaders(token),
  });
}

export async function getStudentRecommendations(token) {
  return request("/student/recommendations", {
    headers: getHeaders(token),
  });
}

export async function getStudentAttendance(token) {
  return request("/student/attendance", {
    headers: getHeaders(token),
  });
}

export async function markAttendance(token, payload) {
  return request("/teacher/attendance", {
    method: "POST",
    headers: getHeaders(token, true),
    body: JSON.stringify(payload),
  });
}
