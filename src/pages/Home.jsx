import React, { useState, useEffect } from "react";
import { fetchCourseData } from "../api/api";
import CourseInput from "../features/CourseInput";
import CourseResults from "../features/CourseResults";
import SelectedCourses from "../features/SelectedCourses";
import GenerateSchedule from "../features/GenerateSchedule";
import SelectMultiCourses from "../features/SelectMultiCourses";
import { extractCourseName, extractCourseNum } from "../utils/utils";
import MessageNotification from "../components/MessageNotification";

function Home() {
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
  // State for display notification
  const [showNotification, setShowNotification] = useState(false);
  // ******State for assosiate number, this is for accessing a course data.
  const [assosiateNum, setAssosiateNum] = useState();
  console.log("courseData", courseData);
  console.log("associatedClass", assosiateNum);
  // Handler for successful data fetch from API
  const onFetchSuccess = (data, courseName, courseNum) => {
    setCourseData(null);

    // Ensuring courseName and courseNum are not undefined
    const safeCourseName = courseName ? courseName.toUpperCase() : "";
    const safeCourseNum = courseNum ? courseNum : "";

    // Updating state with fetched data and reset feedback message
    setCourseData({ data, name: safeCourseName, number: safeCourseNum });
    setAssosiateNum(data[0].associatedClass);
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
    setShowNotification(!showNotification);
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
      selectedCourses.some((course) => {
        if ("1" in course) {
          return course["1"].course === newSelectedCourse[assosiateNum].course;
        } else {
          return course["2"].course === newSelectedCourse[assosiateNum].course;
        }
      })
    ) {
      setFeedbackMessage("This course is already in the list.");
      setShowNotification(!showNotification);
    } else {
      // Add course to the selected list and display success message
      setSelectedCourses([...selectedCourses, newSelectedCourse]);
      setFeedbackMessage(
        `Successfully added ${newSelectedCourse[assosiateNum].course} to the list.`
      );
      setCourseData(null);
      setShowNotification(!showNotification);
    }
  };

  // Handler for displaying notification or not
  const toggleNotification = () => {
    setShowNotification(!showNotification);
  };

  // Handler for removing a course
  const handleRemoveCourse = (courseIndex) => {
    setFeedbackMessage(
      `Successfully removed ${selectedCourses[courseIndex][assosiateNum].course} to the list.`
    );
    setSelectedCourses(
      selectedCourses.filter((_, index) => index !== courseIndex)
    );
    setShowNotification(!showNotification);
  };

  // Effect hook for logging the selected courses list
  useEffect(() => {
    console.log("Selected Courses:", selectedCourses);
  }, [selectedCourses]);

  return (
    <main className="flex-grow mt-8 p-4 max-w-screen-xl mx-auto w-full">
      <h1 className="text-3xl font-bold">Welcome to SFU Courses Scheduler</h1>
      <p>
        (Select courses and set its priority, and we will create a scheduler for
        you.)
      </p>

      <div className="lg:flex items-center md:block">
        {/* Course input component */}
        <CourseInput
          onSearch={handleCourseSearch}
          setCourseInput={setCourseInput}
          courseInput={courseInput}
          setDisplayCourseText={setDisplayCourseText}
        />

        <div className="flex-auto h-full ">
          <p className="flex-auto">or</p>
        </div>

        {/* Component for select multi courses */}
        <SelectMultiCourses
          courseList={[
            { courseName: "STAT", courseNum: "270", priority: 7 },
            { courseName: "CMPT", courseNum: "433", priority: 8 },
            { courseName: "CMPT", courseNum: "431", priority: 6 },
            { courseName: "CMPT", courseNum: "105w", priority: 3 },
            { courseName: "MACM", courseNum: "316", priority: 9 },
            { courseName: "CMPT", courseNum: "225", priority: 1 },
            { courseName: "CMPT", courseNum: "376w", priority: 5 },
            { courseName: "IAT", courseNum: "265", priority: 3 },
            { courseName: "MATH", courseNum: "151", priority: 10 },
            { courseName: "CMPT", courseNum: "201", priority: 9 },
            { courseName: "CMPT", courseNum: "295", priority: 2 },
            { courseName: "CMPT", courseNum: "454", priority: 4 },
          ]}
          fetchCourseData={fetchCourseData}
          handleSelectWithPriority={handleSelectWithPriority}
          setSelectedCourses={setSelectedCourses}
        />
      </div>

      {/* Display loading message while fetching data */}
      {isLoading && (
        <span>
          <svg
            className="motion-reduce:hidden animate-spin ..."
            viewBox="0 0 24 24"
          ></svg>
          <p>Searching course...</p>
        </span>
      )}

      {/* Conditional rendering of course results if data is available */}
      {!isLoading && courseData && (
        <>
          <CourseResults
            courseData={courseData.data}
            setCourseData={setCourseData}
            courseName={extractCourseName(displayCourseText)}
            courseNum={extractCourseNum(displayCourseText)}
            onSelectCourse={handleSelectWithPriority}
          />
          <hr className="my-6 h-0.5 border-t-0 bg-neutral-100 dark:bg-white/10" />
        </>
      )}

      {/* Displaying feedback messages */}
      {!isLoading && showNotification && (
        <MessageNotification
          message={feedbackMessage}
          status={"success"}
          onClose={toggleNotification}
        />
      )}

      {/* Component for displaying selected courses */}
      <SelectedCourses
        setSelectedCourses={setSelectedCourses}
        courses={selectedCourses}
        onRemoveCourse={handleRemoveCourse}
        assosiateNum={assosiateNum}
      />

      {/* Component for generating the optimized courses schedule */}
      <GenerateSchedule selectedCourses={selectedCourses} />
    </main>
  );
}

export default Home;
