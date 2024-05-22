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
      <h3 className="font-bold">Course Search</h3>
      <input
        className="appearance bg-transparent border text-gray-700 mr-3 py-1 px-2 leading-tight rounded"
        placeholder="Enter your course"
        value={courseInput}
        onChange={(e) => setCourseInput(e.target.value)}
      />
      <button className="flex-shrink-0 bg-sfu-light-red hover:bg-sfu-dark-red border-sfu-light-red hover:border-sfu-dark-red text-sm border-4 text-white py-1 px-2 rounded" onClick={handleSearchClick}>search</button>
    </div>
  );
};

export default CourseInput;
