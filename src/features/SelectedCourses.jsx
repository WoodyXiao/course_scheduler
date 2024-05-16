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
                <button onClick={() => handleRemoveClick(index)}>Remove</button>
              </li>
            ))}
          </ul>
          <button onClick={() => setSelectedCourses([])}>remove all</button>
        </>
      )}
    </div>
  );
};

export default SelectedCourses;
