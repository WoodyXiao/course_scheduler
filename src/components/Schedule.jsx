import React from "react";
import Calendar from "./Calendar";

const Schedule = ({ schedule, totalMaxPriority }) => {
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
          {schedule.map((course) => (
            <div key={course.courseName} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-2">
                <h5 className="text-lg font-semibold text-gray-800">
                  {course.courseName}
                </h5>
                <span className="bg-sfu-light-red text-white px-3 py-1 rounded-full text-sm font-medium">
                  Priority: {course.priority}
                </span>
              </div>
              
              <div className="space-y-2">
                <div>
                  <strong className="text-gray-700">Lecture:</strong> 
                  <span className="ml-2 text-gray-600">{course.lecture}</span>
                </div>
                
                {course.scheduleEntries.map((entry, index) => (
                  <div key={index} className="bg-gray-50 p-3 rounded">
                    <p className="text-sm">
                      <span className="font-medium text-gray-700">Type:</span> {entry.type} | 
                      <span className="font-medium text-gray-700 ml-2">Schedule:</span> {entry.days} {entry.startTime} - {entry.endTime}
                    </p>
                  </div>
                ))}
                
                {course.lab && (
                  <div>
                    <strong className="text-gray-700">Lab:</strong> 
                    <span className="ml-2 text-gray-600">{course.lab}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-6 p-4 bg-green-50 rounded-lg">
          <h5 className="text-lg font-semibold text-green-800">
            Total Maximum Priority: {totalMaxPriority}
          </h5>
          <p className="text-sm text-green-600 mt-1">
            This represents the sum of priorities for all selected courses in your optimized schedule.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Schedule;
