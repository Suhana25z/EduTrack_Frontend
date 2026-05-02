export const DEFAULT_SUBJECTS = [
  "Mathematics",
  "Physics",
  "Chemistry",
  "English",
  "Computer Science",
];

export function normalizeSubjectName(name, index) {
  const fallback = DEFAULT_SUBJECTS[index] || `Elective ${index - DEFAULT_SUBJECTS.length + 1}`;
  if (!name) return fallback;

  const genericMatch = /^subject\s*(\d+)$/i.exec(String(name).trim());
  if (genericMatch) {
    return DEFAULT_SUBJECTS[Number(genericMatch[1]) - 1] || fallback;
  }

  return name;
}
