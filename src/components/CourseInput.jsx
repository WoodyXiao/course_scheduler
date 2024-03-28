/**
 * This component will handle the course input field and search button.
 */

import React from "react";
import { extractCourseName, extractCourseNum } from "../utils/utils";

const CourseInput = ({
  onSearch,
  setCourseInput,
  courseInput,
  setDisplayCourseText,
}) => {
  const handleSearchClick = () => {
    const courseName = extractCourseName(courseInput);
    const courseNum = extractCourseNum(courseInput);
    if (!courseName || !courseNum) {
      alert("please enter the correct format of the course..");
      return;
    }
    onSearch(courseName, courseNum);
    setDisplayCourseText(courseName + courseNum);
    setCourseInput("");
  };

  return (
    <div>
      <h3>Course Search</h3>
      <input
        placeholder="Enter your course"
        value={courseInput}
        onChange={(e) => setCourseInput(e.target.value)}
      />
      <button onClick={handleSearchClick}>search</button>
    </div>
  );
};

export default CourseInput;
