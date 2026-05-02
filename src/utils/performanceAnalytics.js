// Performance Analytics Engine
// Calculates detailed metrics and insights for student performance

export const calculateMetrics = (student) => {
  const marks = student.marks || [];
  
  if (marks.length === 0) {
    return {
      average: 0,
      total: 0,
      highest: 0,
      lowest: 0,
      variance: 0,
      consistencyScore: 0
    };
  }

  const total = marks.reduce((a, b) => a + b, 0);
  const average = total / marks.length;
  const highest = Math.max(...marks);
  const lowest = Math.min(...marks);
  
  // Calculate variance and standard deviation for consistency metrics
  const variance = marks.reduce((acc, mark) => {
    return acc + Math.pow(mark - average, 2);
  }, 0) / marks.length;
  
  const stdDeviation = Math.sqrt(variance);
  
  // Consistency score: lower std dev = higher consistency (measures reliable performance)
  const consistencyScore = Math.max(0, 100 - (stdDeviation * 2));

  return {
    average: parseFloat(average.toFixed(2)),
    total,
    highest,
    lowest,
    variance: parseFloat(variance.toFixed(2)),
    stdDeviation: parseFloat(stdDeviation.toFixed(2)),
    consistencyScore: parseFloat(consistencyScore.toFixed(1))
  };
};

export const calculateGrade = (mark) => {
  if (mark >= 90) return { grade: 'A', label: 'Excellent' };
  if (mark >= 80) return { grade: 'B', label: 'Very Good' };
  if (mark >= 70) return { grade: 'C', label: 'Good' };
  if (mark >= 60) return { grade: 'D', label: 'Satisfactory' };
  return { grade: 'F', label: 'Needs Improvement' };
};

export const getGradeColor = (mark) => {
  if (mark >= 90) return '#10b981'; // Emerald
  if (mark >= 80) return '#3b82f6'; // Blue
  if (mark >= 70) return '#f59e0b'; // Amber
  if (mark >= 60) return '#ef5350'; // Red
  return '#d32f2f'; // Deep Red
};

export const identifyStrengths = (student) => {
  const marks = student.marks || [];
  if (marks.length === 0) return [];
  
  const average = marks.reduce((a, b) => a + b, 0) / marks.length;
  const strengths = [];
  
  marks.forEach((mark, idx) => {
    if (mark >= average + 10) {
      strengths.push({
        subject: idx,
        score: mark,
        difference: mark - average
      });
    }
  });
  
  return strengths.sort((a, b) => b.score - a.score);
};

export const identifyWeaknesses = (student) => {
  const marks = student.marks || [];
  if (marks.length === 0) return [];
  
  const average = marks.reduce((a, b) => a + b, 0) / marks.length;
  const weaknesses = [];
  
  marks.forEach((mark, idx) => {
    if (mark < average - 10) {
      weaknesses.push({
        subject: idx,
        score: mark,
        difference: average - mark,
        gap: average - mark
      });
    }
  });
  
  return weaknesses.sort((a, b) => b.gap - a.gap);
};

export const calculateClassMetrics = (students) => {
  if (students.length === 0) {
    return {
      classAverage: 0,
      topStudents: [],
      bottomStudents: [],
      classConsistency: 0,
      passingPercentage: 0
    };
  }

  const allMarks = [];
  const studentMetrics = students.map(student => {
    const metrics = calculateMetrics(student);
    allMarks.push(...student.marks);
    return { ...student, metrics };
  });

  const classAverage = parseFloat((allMarks.reduce((a, b) => a + b, 0) / allMarks.length).toFixed(2));
  const classVariance = allMarks.reduce((acc, mark) => {
    return acc + Math.pow(mark - classAverage, 2);
  }, 0) / allMarks.length;
  const classConsistency = Math.max(0, 100 - (Math.sqrt(classVariance) * 2));

  const topStudents = studentMetrics
    .sort((a, b) => b.metrics.average - a.metrics.average)
    .slice(0, 5)
    .map(s => ({ id: s.id, name: s.name, average: s.metrics.average }));

  const bottomStudents = studentMetrics
    .sort((a, b) => a.metrics.average - b.metrics.average)
    .slice(0, 5)
    .map(s => ({ id: s.id, name: s.name, average: s.metrics.average }));

  const passingStudents = students.filter(s => {
    const avg = s.marks.reduce((a, b) => a + b, 0) / s.marks.length;
    return avg >= 60;
  }).length;

  const passingPercentage = parseFloat(((passingStudents / students.length) * 100).toFixed(1));

  return {
    classAverage,
    topStudents,
    bottomStudents,
    classConsistency: parseFloat(classConsistency.toFixed(1)),
    passingPercentage,
    totalStudents: students.length
  };
};

export const getPerformanceTrend = (student) => {
  const marks = student.marks || [];
  if (marks.length < 2) return 'insufficient-data';
  
  // Use recent marks to determine trend
  const recent = marks.slice(-Math.ceil(marks.length / 2));
  const older = marks.slice(0, Math.floor(marks.length / 2));
  
  const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
  const olderAvg = older.length > 0 ? older.reduce((a, b) => a + b, 0) / older.length : recentAvg;
  
  const difference = recentAvg - olderAvg;
  
  if (difference > 5) return 'improving';
  if (difference < -5) return 'declining';
  return 'stable';
};

export const getComparisonWithClass = (studentAverage, classAverage) => {
  const difference = studentAverage - classAverage;
  
  if (difference > 10) return { status: 'above', text: 'Above Class Average', color: '#10b981' };
  if (difference > 0) return { status: 'slightly-above', text: 'Slightly Above Average', color: '#3b82f6' };
  if (difference > -10) return { status: 'slightly-below', text: 'Slightly Below Average', color: '#f59e0b' };
  return { status: 'below', text: 'Below Class Average', color: '#ef4444' };
};
