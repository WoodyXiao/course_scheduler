/** 
This component is responsible for displaying the list of selected courses.
*/

import React from "react";

const SelectedCourses = ({ setSelectedCourses, courses, onRemoveCourse }) => {
  const handleRemoveClick = (courseIndex) => {
    // Show confirmation dialog
    const isConfirmed = window.confirm(
      `Are you sure you want to remove ${courses[courseIndex]["1"].course}?`
    );
    if (isConfirmed) {
      // Call the onRemoveCourse function passed from the parent component
      onRemoveCourse(courseIndex);
    }
  };

  return (
    <div>
      <h3>Selected Courses:</h3>
      {courses.length === 0 ? (
        <p>No courses selected.</p>
      ) : (
        <>
          <ul>
            {courses.map((course, index) => (
              <li key={index}>
                {course["1"].course} {course["1"].lecture.title} - Priority:{" "}
                {course.priority}
                <button
                  className="flex-shrink-0 bg-sfu-light-red hover:bg-sfu-dark-red border-sfu-light-red hover:border-sfu-dark-red text-sm border-4 text-white py-1 px-2 rounded"
                  onClick={() => handleRemoveClick(index)}
                >
                  <svg
                    className="fill-current w-4 h-4"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                  >
                    <path d="M14.348 14.849a1.2 1.2 0 1 1-1.697 1.697L10 12.697l-2.651 2.849a1.2 1.2 0 1 1-1.697-1.697L8.303 11l-2.651-2.651a1.2 1.2 0 1 1 1.697-1.697L10 9.303l2.651-2.651a1.2 1.2 0 1 1 1.697 1.697L11.697 11l2.651 2.651z" />
                  </svg>
                </button>
              </li>
            ))}
          </ul>
          <button
            className="flex-shrink-0 bg-sfu-light-red hover:bg-sfu-dark-red border-sfu-light-red hover:border-sfu-dark-red text-sm border-4 text-white py-1 px-2 rounded"
            onClick={() => setSelectedCourses([])}
          >
            Remove all
          </button>
        </>
      )}
    </div>
  );
};

export default SelectedCourses;
