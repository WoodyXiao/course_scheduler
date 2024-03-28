/**
 * This component displays the search results and handles the selection of courses.
 */

import React from "react";
import RenderCourse from "./RenderCourse";

const CourseResults = ({
  courseData,
  courseName,
  courseNum,
  onSelectCourse,
}) => {
  return (
    <div>
      <p>
        Result for: {courseName.toUpperCase()} {courseNum}
      </p>
      <RenderCourse
        courses={courseData}
        courseName={courseName}
        courseNum={courseNum}
        onSelectCourse={onSelectCourse}
      />
    </div>
  );
};

export default CourseResults;
