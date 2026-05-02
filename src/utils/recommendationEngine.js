// Recommendation Engine
// Generates personalized suggestions based on performance analysis
// Incorporates performance trends, peer comparisons, and adaptive learning paths

import { 
  identifyWeaknesses, 
  identifyStrengths,
  getPerformanceTrend,
  calculateMetrics
} from './performanceAnalytics';
import { normalizeSubjectName } from './subjects';

const improvementStrategies = {
  0: {
    subject: 'Mathematics',
    strategies: [
      'Focus on foundational concepts with regular practice',
      'Allocate 30-45 minutes daily for targeted study',
      'Use visual aids and worked examples to understand concepts',
      'Break complex topics into smaller, manageable parts'
    ]
  },
  1: {
    subject: 'Physics',
    strategies: [
      'Strengthen problem-solving skills with regular exercises',
      'Review previous year materials and common patterns',
      'Practice previous papers to understand question formats',
      'Seek clarification on challenging areas immediately'
    ]
  },
  2: {
    subject: 'Chemistry',
    strategies: [
      'Develop deeper understanding through active learning',
      'Use mind maps to organize and connect ideas',
      'Discuss complex ideas with peers and mentors',
      'Apply concepts to real-world examples and scenarios'
    ]
  },
  3: {
    subject: 'English',
    strategies: [
      'Create comprehensive notes with key points and formulas',
      'Practice regularly with increasing difficulty levels',
      'Review notes weekly to maintain retention',
      'Connect with teachers for additional support sessions'
    ]
  },
  4: {
    subject: 'Computer Science',
    strategies: [
      'Establish consistent study habits and routine',
      'Use active recall and spaced repetition techniques',
      'Complete assignments thoroughly and on time',
      'Analyze mistakes in assignments to prevent repetition'
    ]
  }
};

const overallRecommendations = {
  excellent: [
    'Maintain your current study approach as it is yielding excellent results',
    'Challenge yourself with advanced topics and competitive materials',
    'Consider mentoring peers in areas where you excel',
    'Explore additional resources to deepen your expertise'
  ],
  'very-good': [
    'Your performance is very strong - continue with your present strategy',
    'Focus on converting good marks to excellent marks in weaker subjects',
    'Review notes regularly to maintain knowledge retention',
    'Participate actively in class discussions and assignments'
  ],
  good: [
    'You have a solid foundation - consistent effort will lead to improvement',
    'Dedicate more time to weak areas while maintaining strength in others',
    'Create a structured study schedule and follow it consistently',
    'Regularly assess your progress and adjust strategies as needed'
  ],
  satisfactory: [
    'Significant improvement is possible with focused effort',
    'Increase daily study time, especially on challenging subjects',
    'Form study groups with strong performers to learn new approaches',
    'Regular revision and practice are crucial to overcome weak areas'
  ],
  improvement: [
    'Your performance requires immediate attention and increased effort',
    'Increase study hours and focus intently on weak subjects',
    'Seek help from teachers, tutors, or peers without hesitation',
    'Develop a clear action plan with specific short-term milestones'
  ]
};

export const generateStudentRecommendations = (student, classAverage) => {
  const metrics = calculateMetrics(student);
  const weaknesses = identifyWeaknesses(student);
  const strengths = identifyStrengths(student);
  const trend = getPerformanceTrend(student);

  let performanceCategory = 'improvement';
  if (metrics.average >= 90) performanceCategory = 'excellent';
  else if (metrics.average >= 80) performanceCategory = 'very-good';
  else if (metrics.average >= 70) performanceCategory = 'good';
  else if (metrics.average >= 60) performanceCategory = 'satisfactory';

  const recommendations = {
    overallSuggestions: [],
    subjectSpecific: [],
    trends: [],
    nextSteps: []
  };

  // Overall suggestions based on performance level
  recommendations.overallSuggestions = overallRecommendations[performanceCategory] || overallRecommendations.improvement;

  // Subject-specific recommendations for weak areas
  weaknesses.forEach(weakness => {
    if (improvementStrategies[weakness.subject]) {
      recommendations.subjectSpecific.push({
        subjectIndex: weakness.subject,
        subjectName: student.subjects?.[weakness.subject]?.subjectName || improvementStrategies[weakness.subject].subject,
        currentScore: weakness.score,
        gap: weakness.gap,
        strategies: improvementStrategies[weakness.subject].strategies
      });
    }
  });

  // Trend-based suggestions
  if (trend === 'declining') {
    recommendations.trends.push(
      'Your performance has been declining. Review study methods and increase focus on weaker subjects.',
      'Ensure you are maintaining consistent study schedules and not doing last-minute cramming.'
    );
  } else if (trend === 'improving') {
    recommendations.trends.push(
      'Great! Your performance shows a positive trend. Keep up your momentum with consistent effort.',
      'Continue with strategies that worked for you - they are clearly paying off.'
    );
  }

  // Comparison with class
  if (metrics.average < classAverage - 10) {
    recommendations.trends.push(
      `Your average (${metrics.average}) is significantly below the class average (${classAverage}). ` +
      'Consider studying with high performers and learning their techniques.'
    );
  }

  // Consistency feedback
  if (metrics.consistencyScore < 50) {
    recommendations.trends.push(
      'Your marks vary significantly across subjects. Try to develop a more balanced approach to all subjects.'
    );
  } else if (metrics.consistencyScore > 80) {
    recommendations.trends.push(
      'Excellent consistency across subjects! This shows balanced development and strong overall preparation.'
    );
  }

  // Strengths to leverage
  if (strengths.length > 0) {
    recommendations.nextSteps.push(
      `Your strongest areas are ${strengths.map(s => normalizeSubjectName(student.subjects?.[s.subject]?.subjectName, s.subject)).join(', ')}. ` +
      'Use your excellence in these areas to build confidence for other subjects.'
    );
  }

  // Actionable next steps
  if (weaknesses.length > 0) {
    const totalGap = weaknesses.reduce((sum, w) => sum + w.gap, 0);
    recommendations.nextSteps.push(
      `Focus on improving ${weaknesses.length} subject(s) with a combined gap of ${totalGap.toFixed(0)} points. ` +
      'Breaking this into weekly targets will make it achievable.'
    );
  }

  recommendations.nextSteps.push(
    'Set a specific goal for your next assessment and create a detailed study plan to achieve it.'
  );

  return recommendations;
};

export const generateTeacherRecommendations = (student, metrics, classAverage) => {
  const weaknesses = identifyWeaknesses(student);
  const trend = getPerformanceTrend(student);

  const recommendations = [];

  // Performance level assessment
  if (metrics.average >= 85) {
    recommendations.push(`${student.name} is a high performer. Consider providing advanced materials to challenge them further.`);
  } else if (metrics.average >= 70) {
    recommendations.push(`${student.name} shows solid understanding. Focus on converting good performance to excellent.`);
  } else if (metrics.average >= 60) {
    recommendations.push(`${student.name} needs targeted support in weaker areas to prevent further decline.`);
  } else {
    recommendations.push(`${student.name} requires immediate intervention and close monitoring.`);
  }

  // Trend analysis
  if (trend === 'declining') {
    recommendations.push(`⚠ Warning: ${student.name}'s performance is declining. Schedule a one-on-one discussion.`);
  }

  // Consistency check
  if (metrics.consistencyScore < 50) {
    recommendations.push(`${student.name} shows inconsistency across subjects. May need help developing balanced study habits.`);
  }

  // Weakness intervention
  if (weaknesses.length >= 3) {
    recommendations.push(`${student.name} is struggling in multiple areas. Consider extra tutoring or peer mentoring.`);
  }

  // Comparison with class
  const difference = metrics.average - classAverage;
  if (difference < -15) {
    recommendations.push(`${student.name} is significantly below class performance. May benefit from additional support.`);
  }

  return recommendations;
};

export const generateClassRecommendations = (students, classMetrics) => {
  const recommendations = [];

  // Overall class health
  if (classMetrics.passingPercentage < 70) {
    recommendations.push(
      '⚠ Class Alert: More than 30% of students are not passing. ' +
      'Review curriculum delivery and consider additional support sessions.'
    );
  }

  if (classMetrics.classConsistency < 40) {
    recommendations.push(
      'The class shows high variability in performance. ' +
      'Consider teaching methods that support diverse learning styles.'
    );
  }

  if (classMetrics.classAverage < 60) {
    recommendations.push(
      'Class average is below satisfactory. Schedule revision sessions and identify common problem areas.'
    );
  }

  // Top performers
  if (classMetrics.topStudents.length > 0) {
    recommendations.push(
      `Top performers: ${classMetrics.topStudents.slice(0, 3).map(s => s.name).join(', ')}. ` +
      'Consider peer mentoring or challenge them with advanced tasks.'
    );
  }

  // At-risk students
  const atRiskCount = classMetrics.bottomStudents.length;
  if (atRiskCount > 0) {
    recommendations.push(
      `${atRiskCount} students need intervention. Schedule individual meetings to understand challenges.`
    );
  }

  return recommendations;
};
