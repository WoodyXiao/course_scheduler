/** 
This component is responsible for displaying the list of selected courses.
*/

import React, { useState } from "react";
import SelectedCourseList from "../components/SelectedCourseList";

const SelectedCourses = ({
  setSelectedCourses,
  courses,
  onRemoveCourse,
  assosiateNum,
  onGenerateSchedule,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handlePriorityChange = (courseIndex, newPriority) => {
    const updatedCourses = courses.map((course, index) => {
      if (index === courseIndex) {
        return {
          ...course,
          priority: newPriority
        };
      }
      return course;
    });
    setSelectedCourses(updatedCourses);
  };

  const handleSortCourses = () => {
    const sortedCourses = [...courses].sort((a, b) => {
      // 首先按优先级从高到低排序
      if (b.priority !== a.priority) {
        return b.priority - a.priority;
      }
      // 如果优先级相同，按课程名称排序
      const courseNameA = "1" in a ? a["1"].course : a["2"].course;
      const courseNameB = "1" in b ? b["1"].course : b["2"].course;
      return courseNameA.localeCompare(courseNameB);
    });
    setSelectedCourses(sortedCourses);
  };

  // 关闭手风琴的函数
  const closeAccordion = React.useCallback(() => {
    console.log('closeAccordion called, setting isExpanded to false');
    setIsExpanded(false);
  }, []);

  // 当GenerateSchedule被调用时，自动关闭手风琴
  React.useEffect(() => {
    if (onGenerateSchedule) {
      console.log('Setting accordionCloseCallback');
      onGenerateSchedule(closeAccordion);
    }
  }, []); // 只在组件挂载时执行一次

  const handleRemoveClick = (courseIndex) => {
    // Check if the course exists before accessing its properties
    if (!courses[courseIndex]) {
      console.error('Course not found at index:', courseIndex);
      return;
    }

    const course = courses[courseIndex];
    const courseName = "1" in course ? course["1"].course : course["2"].course;
    
    // Show confirmation dialog
    const isConfirmed = window.confirm(
      `Are you sure you want to remove ${courseName}?`
    );
    if (isConfirmed) {
      // Call the onRemoveCourse function passed from the parent component
      onRemoveCourse(courseIndex);
    }
  };

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className="space-y-4">
      {courses.length === 0 ? (
        <div>
          <h3 className="text-lg font-bold text-gray-800 mb-4">2. Courses you selected:</h3>
          <div className="text-center py-8 text-gray-500">
            <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <p>No courses selected yet...</p>
            <p className="text-sm mt-1">Search and add courses to get started</p>
          </div>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
          {/* Accordion Header */}
          <div
            className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors border-b border-gray-100"
            onClick={toggleExpanded}
          >
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <svg
                  className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${
                    isExpanded ? 'rotate-90' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
                <h3 className="text-lg font-bold text-gray-800">2. Courses you selected:</h3>
              </div>
              <div className="flex items-center space-x-2">
                <span className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full">
                  {courses.length} course{courses.length !== 1 ? 's' : ''}
                </span>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                className="flex items-center space-x-1 px-3 py-1 text-sm bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors rounded"
                onClick={(e) => {
                  e.stopPropagation();
                  handleSortCourses();
                }}
                title="Sort courses by priority (high to low), then by name"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12"
                  />
                </svg>
                <span>Sorting</span>
              </button>
              <button
                className="flex items-center space-x-1 px-3 py-1 text-sm bg-red-100 text-red-700 hover:bg-red-200 transition-colors rounded"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedCourses([]);
                }}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
                <span>Remove All</span>
              </button>
            </div>
          </div>

          {/* Accordion Content */}
          <div
            className={`transition-all duration-300 ease-in-out ${
              isExpanded ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'
            } overflow-hidden`}
          >
            <div className="p-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                <div className="flex items-center space-x-2">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <p className="text-sm text-blue-800 font-medium">
                      {courses.length} course{courses.length !== 1 ? 's' : ''} selected
                    </p>
                    <p className="text-xs text-blue-600">
                      Click on any course to view details or remove it
                    </p>
                  </div>
                </div>
              </div>
              
              <SelectedCourseList
                courses={courses}
                handleRemoveClick={handleRemoveClick}
                isSimpleList={true}
                onPriorityChange={handlePriorityChange}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SelectedCourses;
