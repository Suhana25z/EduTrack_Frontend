import React, { useState, useMemo } from "react";
import { 
  calculateMetrics, 
  identifyStrengths, 
  identifyWeaknesses,
  calculateClassMetrics,
  getGradeColor
} from "../utils/performanceAnalytics";
import { generateTeacherRecommendations } from "../utils/recommendationEngine";
import { normalizeSubjectName } from "../utils/subjects";

function Report({ students }) {
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [viewType, setViewType] = useState("overview"); // overview, detailed, comparison

  const classMetrics = useMemo(() => calculateClassMetrics(students), [students]);

  const selectedStudent = useMemo(() => 
    students.find(s => s.id === selectedStudentId), 
    [students, selectedStudentId]
  );

  const studentMetrics = useMemo(() => 
    selectedStudent ? calculateMetrics(selectedStudent) : null,
    [selectedStudent]
  );

  const strengths = useMemo(() => 
    selectedStudent ? identifyStrengths(selectedStudent) : [],
    [selectedStudent]
  );

  const weaknesses = useMemo(() => 
    selectedStudent ? identifyWeaknesses(selectedStudent) : [],
    [selectedStudent]
  );

  const recommendations = useMemo(() => 
    selectedStudent && studentMetrics 
      ? generateTeacherRecommendations(selectedStudent, studentMetrics, classMetrics.classAverage)
      : [],
    [selectedStudent, studentMetrics, classMetrics.classAverage]
  );
  const subjectNameAt = (index) => normalizeSubjectName(selectedStudent?.subjects?.[index]?.subjectName, index);

  if (students.length === 0) {
    return (
      <div className="card">
        <h2>📋 Performance Reports</h2>
        <p style={{ color: '#666', marginTop: '20px' }}>No student data available.</p>
      </div>
    );
  }

  return (
    <div className="card">
      <h2>📋 Detailed Performance Reports</h2>

      {/* Student Selection */}
      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
          Select Student
        </label>
        <select 
          value={selectedStudentId} 
          onChange={(e) => setSelectedStudentId(e.target.value)}
          style={{
            width: '100%',
            padding: '10px',
            borderRadius: '6px',
            border: '1px solid #d1d5db',
            fontSize: '1em'
          }}
        >
          <option value="">-- Choose a student --</option>
          {students.map(s => (
            <option key={s.id} value={s.id}>{s.name} ({s.id})</option>
          ))}
        </select>
      </div>

      {!selectedStudent ? (
        <div style={{ textAlign: 'center', color: '#999', padding: '30px 0' }}>
          👆 Select a student to view detailed report
        </div>
      ) : (
        <>
          {/* View Type Selector */}
          <div style={{ 
            display: 'flex', 
            gap: '10px', 
            marginBottom: '20px',
            borderBottom: '1px solid #e5e7eb',
            paddingBottom: '15px'
          }}>
            {['overview', 'detailed', 'comparison'].map(type => (
              <button
                key={type}
                onClick={() => setViewType(type)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '6px',
                  border: 'none',
                  backgroundColor: viewType === type ? '#3b82f6' : '#f3f4f6',
                  color: viewType === type ? '#fff' : '#374151',
                  cursor: 'pointer',
                  fontWeight: viewType === type ? '600' : '500',
                  transition: 'all 0.2s'
                }}
              >
                {type === 'overview' && '📊 Overview'}
                {type === 'detailed' && '📈 Detailed'}
                {type === 'comparison' && '📉 Comparison'}
              </button>
            ))}
          </div>

          {/* Overview Tab */}
          {viewType === 'overview' && (
            <>
              {/* Header with Basic Info */}
              <div style={{
                backgroundColor: '#f3f4f6',
                padding: '15px',
                borderRadius: '8px',
                marginBottom: '20px'
              }}>
                <h3 style={{ marginTop: 0, marginBottom: '10px' }}>{selectedStudent.name}</h3>
                <p style={{ margin: '5px 0', fontSize: '0.95em', color: '#666' }}>
                  <strong>Student ID:</strong> {selectedStudent.id}
                </p>
              </div>

              {/* Key Metrics Grid */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                gap: '12px',
                marginBottom: '25px'
              }}>
                <div style={{
                  padding: '12px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '0.85em', color: '#666', marginBottom: '5px' }}>
                    Average Score
                  </div>
                  <div style={{
                    fontSize: '1.8em',
                    fontWeight: '700',
                    color: getGradeColor(studentMetrics.average)
                  }}>
                    {studentMetrics.average}
                  </div>
                </div>

                <div style={{
                  padding: '12px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '0.85em', color: '#666', marginBottom: '5px' }}>
                    Total Marks
                  </div>
                  <div style={{
                    fontSize: '1.8em',
                    fontWeight: '700',
                    color: '#3b82f6'
                  }}>
                    {studentMetrics.total}
                  </div>
                </div>

                <div style={{
                  padding: '12px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '0.85em', color: '#666', marginBottom: '5px' }}>
                    Highest Mark
                  </div>
                  <div style={{
                    fontSize: '1.8em',
                    fontWeight: '700',
                    color: '#10b981'
                  }}>
                    {studentMetrics.highest}
                  </div>
                </div>

                <div style={{
                  padding: '12px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '0.85em', color: '#666', marginBottom: '5px' }}>
                    Consistency
                  </div>
                  <div style={{
                    fontSize: '1.8em',
                    fontWeight: '700',
                    color: '#f59e0b'
                  }}>
                    {studentMetrics.consistencyScore}%
                  </div>
                </div>
              </div>

              {/* Strengths and Weaknesses */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                {strengths.length > 0 && (
                  <div>
                    <h4 style={{ color: '#10b981', marginBottom: '10px' }}>✅ Strengths</h4>
                    {strengths.map((s, idx) => (
                      <div key={idx} style={{
                        padding: '8px',
                        backgroundColor: '#f0fdf4',
                        borderLeft: '3px solid #10b981',
                        marginBottom: '8px',
                        borderRadius: '4px'
                      }}>
                        <div style={{ fontWeight: '500' }}>{subjectNameAt(s.subject)}</div>
                        <div style={{ fontSize: '0.9em', color: '#666' }}>
                          Score: {s.score} | {s.difference.toFixed(1)} above avg
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {weaknesses.length > 0 && (
                  <div>
                    <h4 style={{ color: '#ef4444', marginBottom: '10px' }}>⚠️ Areas for Improvement</h4>
                    {weaknesses.map((w, idx) => (
                      <div key={idx} style={{
                        padding: '8px',
                        backgroundColor: '#fef2f2',
                        borderLeft: '3px solid #ef4444',
                        marginBottom: '8px',
                        borderRadius: '4px'
                      }}>
                        <div style={{ fontWeight: '500' }}>{subjectNameAt(w.subject)}</div>
                        <div style={{ fontSize: '0.9em', color: '#666' }}>
                          Score: {w.score} | {w.gap.toFixed(1)} below avg
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          {/* Detailed Tab */}
          {viewType === 'detailed' && (
            <>
              <h3 style={{ marginBottom: '15px' }}>Subject-wise Breakdown</h3>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
                gap: '12px',
                marginBottom: '20px'
              }}>
                {selectedStudent.marks.map((mark, idx) => (
                  <div key={idx} style={{
                    padding: '12px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '6px',
                    textAlign: 'center',
                    backgroundColor: '#fafafa'
                  }}>
                    <div style={{ fontSize: '0.85em', color: '#666', marginBottom: '8px' }}>
                      {subjectNameAt(idx)}
                    </div>
                    <div style={{
                      fontSize: '2em',
                      fontWeight: '700',
                      color: getGradeColor(mark),
                      marginBottom: '4px'
                    }}>
                      {mark}
                    </div>
                    <div style={{
                      fontSize: '0.8em',
                      color: '#999',
                      marginBottom: '4px'
                    }}>
                      {mark >= studentMetrics.average ? '📈 Above' : '📉 Below'} avg
                    </div>
                  </div>
                ))}
              </div>

              {/* Statistical Analysis */}
              <div style={{
                backgroundColor: '#f9fafb',
                padding: '15px',
                borderRadius: '8px',
                marginBottom: '20px'
              }}>
                <h4 style={{ marginTop: 0 }}>Statistical Analysis</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                  <div>
                    <p style={{ margin: '5px 0', color: '#666' }}>
                      <strong>Standard Deviation:</strong> {studentMetrics.stdDeviation}
                    </p>
                    <p style={{ margin: '5px 0', color: '#666' }}>
                      <strong>Range:</strong> {studentMetrics.highest - studentMetrics.lowest} points
                    </p>
                  </div>
                  <div>
                    <p style={{ margin: '5px 0', color: '#666' }}>
                      <strong>Consistency Rating:</strong> {studentMetrics.consistencyScore > 70 ? 'Excellent' : studentMetrics.consistencyScore > 50 ? 'Good' : 'Needs Improvement'}
                    </p>
                    <p style={{ margin: '5px 0', color: '#666' }}>
                      <strong>Performance Variance:</strong> {studentMetrics.variance.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Comparison Tab */}
          {viewType === 'comparison' && (
            <>
              <h3 style={{ marginBottom: '15px' }}>Performance Comparison</h3>
              <div style={{
                backgroundColor: '#f3f4f6',
                padding: '15px',
                borderRadius: '8px',
                marginBottom: '20px'
              }}>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '20px'
                }}>
                  <div>
                    <div style={{ fontSize: '0.9em', color: '#666', marginBottom: '5px' }}>
                      Student Average
                    </div>
                    <div style={{
                      fontSize: '2.5em',
                      fontWeight: '700',
                      color: getGradeColor(studentMetrics.average)
                    }}>
                      {studentMetrics.average}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.9em', color: '#666', marginBottom: '5px' }}>
                      Class Average
                    </div>
                    <div style={{
                      fontSize: '2.5em',
                      fontWeight: '700',
                      color: '#6366f1'
                    }}>
                      {classMetrics.classAverage}
                    </div>
                  </div>
                </div>
                <div style={{ marginTop: '15px', paddingTop: '15px', borderTop: '1px solid #d1d5db' }}>
                  <p style={{ margin: '5px 0', color: '#666' }}>
                    <strong>Difference:</strong>{' '}
                    <span style={{
                      color: studentMetrics.average >= classMetrics.classAverage ? '#10b981' : '#ef4444'
                    }}>
                      {studentMetrics.average >= classMetrics.classAverage ? '+' : ''}
                      {(studentMetrics.average - classMetrics.classAverage).toFixed(2)} points
                    </span>
                  </p>
                  <p style={{ margin: '5px 0', fontSize: '0.9em', color: '#999' }}>
                    {studentMetrics.average >= classMetrics.classAverage
                      ? 'Student is performing above class average'
                      : 'Student is performing below class average'}
                  </p>
                </div>
              </div>

              {/* Rank Information */}
              <div style={{
                backgroundColor: '#fafafa',
                padding: '15px',
                borderRadius: '8px',
                marginBottom: '20px'
              }}>
                <h4 style={{ marginTop: 0 }}>Class Ranking</h4>
                {(() => {
                  const sortedStudents = [...students].sort((a, b) => {
                    const avgA = a.marks.reduce((sum, m) => sum + m, 0) / a.marks.length;
                    const avgB = b.marks.reduce((sum, m) => sum + m, 0) / b.marks.length;
                    return avgB - avgA;
                  });
                  const rank = sortedStudents.findIndex(s => s.id === selectedStudentId) + 1;
                  return (
                    <p style={{ margin: '10px 0', color: '#666' }}>
                      Rank <strong>#{rank}</strong> out of <strong>{students.length}</strong> students
                    </p>
                  );
                })()}
              </div>
            </>
          )}

          {/* Teacher Recommendations */}
          {recommendations.length > 0 && (
            <div style={{
              backgroundColor: '#fef3c7',
              borderLeft: '4px solid #f59e0b',
              padding: '15px',
              borderRadius: '6px',
              marginTop: '25px'
            }}>
              <h4 style={{ marginTop: 0, color: '#92400e' }}>💡 Teacher Recommendations</h4>
              <ul style={{ margin: '10px 0 0 0', paddingLeft: '20px', color: '#78350f' }}>
                {recommendations.map((rec, idx) => (
                  <li key={idx} style={{ marginBottom: '8px', lineHeight: '1.5' }}>
                    {rec}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default Report;
