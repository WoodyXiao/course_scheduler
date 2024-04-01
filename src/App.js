import React, { useState, useEffect } from "react";
import "./App.css";
import { fetchCourseData } from "./utils/api";
import CourseInput from "./components/CourseInput";
import CourseResults from "./components/CourseResults";
import SelectedCourses from "./components/SelectedCourses";
import GenerateSchedule from "./components/GenerateSchedule";
import { extractCourseName, extractCourseNum } from "./utils/utils";

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

  // Function to handle selection of a course with priority
  const handleSelectWithPriority = (priority, selectedCourse) => {
    const newSelectedCourse = {
      ...selectedCourse,
      priority: priority, // Add priority to the course data
    };

    // Check if the course is already in the selected list
    if (
      selectedCourses.some(
        (course) => JSON.stringify(course) === JSON.stringify(newSelectedCourse)
      )
    ) {
      setFeedbackMessage("This course is already in the list.");
    } else {
      // Add course to the selected list and display success message
      setSelectedCourses([...selectedCourses, newSelectedCourse]);
      setFeedbackMessage(
        `Successfully added ${newSelectedCourse["1"].course} to the list.`
      );
      setCourseData(null);
    }
  };

  // Handler for removing a course
  const handleRemoveCourse = (courseIndex) => {
    setFeedbackMessage(
      `Successfully removed ${selectedCourses[courseIndex]["1"].course} to the list.`
    );
    setSelectedCourses(
      selectedCourses.filter((_, index) => index !== courseIndex)
    );
  };

  // Effect hook for logging the selected courses list
  useEffect(() => {
    console.log("Selected Courses:", selectedCourses);
  }, [selectedCourses]);

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

      {/* Display loading message while fetching data */}
      {isLoading && <p>Searching course...</p>}

      {/* Conditional rendering of course results if data is available */}
      {!isLoading && courseData && (
        <CourseResults
          courseData={courseData.data}
          courseName={extractCourseName(displayCourseText)}
          courseNum={extractCourseNum(displayCourseText)}
          onSelectCourse={handleSelectWithPriority}
        />
      )}

      {/* Displaying feedback messages */}
      {!isLoading && <p>{feedbackMessage}</p>}

      {/* Component for displaying selected courses */}
      <SelectedCourses
        courses={selectedCourses}
        onRemoveCourse={handleRemoveCourse}
      />

      {/* Component for generating the optimized courses schedule */}
      <GenerateSchedule selectedCourses={selectedCourses} />
    </main>
  );
}

export default App;
