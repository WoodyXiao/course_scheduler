import React, { useMemo } from "react";
import Calendar from "./Calendar";

const Schedule = ({ schedule, totalMaxPriority }) => {

  const getCourseColor = useMemo(() => {
    const softColors = [
      '#6B73FF', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', 
      '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE',
      '#85C1E9', '#F8C471', '#82E0AA', '#F1948A', '#85C1E9', '#D2B4DE'
    ];
    
    const courseColorMap = new Map();
    let colorIndex = 0;
    
    schedule.forEach((course) => {
      if (!courseColorMap.has(course.courseName)) {
        const assignedColor = softColors[colorIndex % softColors.length];
        courseColorMap.set(course.courseName, assignedColor);
        colorIndex++;
      }
    });
    
    return courseColorMap;
  }, [schedule]);
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-2xl font-bold text-gray-800 mb-2">Your Schedule</h3>
        <p className="text-gray-600 mb-4">
          Here is your customized course schedule with the maximum priority:
        </p>
        <div className="bg-blue-50 p-3 rounded-lg mb-4">
          <p className="text-sm text-blue-800">
            💡 <strong>Tip:</strong> Click on any course block to view detailed information
          </p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-4 overflow-hidden">
        <h4 className="text-lg font-semibold mb-4 text-gray-800">Weekly Schedule</h4>
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <Calendar courseSchedule={schedule} />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6">
        <h4 className="text-xl font-semibold mb-4 text-gray-800">Course Details</h4>
        <div className="space-y-4">
          {schedule.map((course) => {
            const courseColor = getCourseColor.get(course.courseName) || '#6B73FF';
            return (
              <div 
                key={course.courseName} 
                className="rounded-lg p-4 hover:shadow-lg transition-all duration-200 border-0"
                style={{
                  backgroundColor: courseColor,
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
                }}
              >
                <div className="flex justify-between items-start mb-3">
                  <h5 className="text-lg font-semibold text-white">
                    {course.courseName}
                  </h5>
                  <div className="flex items-center space-x-2">
                    <span 
                      className="bg-white bg-opacity-20 text-white px-3 py-1 rounded-full text-sm font-medium"
                    >
                      Priority: {course.priority}
                    </span>
                    <div className="flex space-x-1">
                      {[...Array(10)].map((_, i) => (
                        <div
                          key={i}
                          className={`w-2 h-2 rounded-full ${
                            i < course.priority
                              ? 'bg-white'
                              : 'bg-white bg-opacity-30'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                    <div>
                      <span className="text-white font-medium">Lecture:</span> 
                      <span className="ml-2 text-white text-opacity-90">{course.lecture}</span>
                    </div>
                  </div>
                  
                  {course.scheduleEntries.map((entry, index) => (
                    <div key={index} className="bg-white bg-opacity-20 p-3 rounded-lg">
                      <div className="flex items-center space-x-2 mb-2">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-white font-medium text-sm">{entry.type}</span>
                      </div>
                      <p className="text-white text-sm text-opacity-90">
                        <span className="font-medium">Schedule:</span> {entry.days} {entry.startTime} - {entry.endTime}
                      </p>
                    </div>
                  ))}
                  
                  {course.lab && (
                    <div className="flex items-center space-x-2">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                      </svg>
                      <div>
                        <span className="text-white font-medium">Lab:</span> 
                        <span className="ml-2 text-white text-opacity-90">{course.lab}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="mt-6 p-6 rounded-lg" style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
        }}>
          <div className="flex items-center justify-between">
            <div>
              <h5 className="text-xl font-bold text-white">
                Total Maximum Priority: {totalMaxPriority}
              </h5>
              <p className="text-sm text-white text-opacity-90 mt-1">
                This represents the sum of priorities for all selected courses in your optimized schedule.
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-white font-bold text-2xl">{totalMaxPriority}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Schedule;
