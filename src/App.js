import React, { useState, useEffect } from "react";
import "./App.css";
import { fetchCourseData } from "./utils/api";
import CourseInput from "./components/CourseInput";

function App() {
  // State for managing course input by user
  const [courseInput, setCourseInput] = useState("");
  // State for storing fetched course data
  const [courseData, setCourseData] = useState(null);
  // State for managing list of selected courses
  const [selectedCourses, setSelectedCourses] = useState([]);
  // State for displaying feedback messages to the user
  const [feedbackMessage, setFeedbackMessage] = useState("");
  // State for storing the display text of the course (name and number)
  const [displayCourseText, setDisplayCourseText] = useState("");
  // State for loading status
  const [isLoading, setIsLoading] = useState(false);

  // Handler for successful data fetch from API
  const onFetchSuccess = (data, courseName, courseNum) => {
    setCourseData(null);

    // Ensuring courseName and courseNum are not undefined
    const safeCourseName = courseName ? courseName.toUpperCase() : "";
    const safeCourseNum = courseNum ? courseNum : "";

    // Updating state with fetched data and reset feedback message
    setCourseData({ data, name: safeCourseName, number: safeCourseNum });
    setFeedbackMessage("");
  };

  // Handler for errors during data fetch
  const onFetchError = (error) => {
    // Default error message
    let errorMessage = "An error occurred while fetching courses";
    // Specific error message for 404 status
    if (error.response && error.response.status === 404) {
      errorMessage = "No courses available";
    }
    // Updating state to reflect the error
    setCourseData(null);
    setFeedbackMessage(errorMessage);
  };

  // Handler for searching a course
  const handleCourseSearch = (courseName, courseNum) => {
    setIsLoading(true); // Set loading to true when search status
    fetchCourseData(
      courseName,
      courseNum,
      (data) => {
        onFetchSuccess(data, courseName, courseNum);
        setIsLoading(false); // Set loading to false when data is fetched
      },
      (error) => {
        onFetchError(error);
        setIsLoading(false);
      }
    );
  };

  return (
    <main>
      {/* Header */}
      <h1>SFU Courses Scheduler</h1>
      <p>
        (Select courses and set its priority, and we will create a scheduler for
        you.)
      </p>

      {/* Course input component */}
      <CourseInput
        onSearch={handleCourseSearch}
        setCourseInput={setCourseInput}
        courseInput={courseInput}
        setDisplayCourseText={setDisplayCourseText}
      />
    </main>
  );
}

export default App;
