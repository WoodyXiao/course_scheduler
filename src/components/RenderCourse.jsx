/**
 *  This component is responsible for rendering course information, including organizing and displaying lectures
 *  and labs, and handling the selection of a course.
 */

import React, { useState, useEffect } from "react";
import axios from "axios";
import CoursePrioritySlider from "./CoursePrioritySlider";

const RenderCourse = ({ courses, courseName, courseNum, onSelectCourse }) => {
  const [organizedCourses, setOrganizedCourses] = useState({});
  // State for the priority of the course
  const [priority, setPriority] = useState(0);
  // State for loading status
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isSubscribed = true; // Flag to control effect cleanup, preventing memory leaks

    // Asyn function to fetch and store detailed information for each course
    const fetchAndStoreDetails = async () => {
      const newOrganizedCourses = organizedCourses(courses);

      // Loop over each course to fetch additional details
      for (const key of Object.keys(newOrganizedCourses)) {
        // Fetch details for lectures
        if (newOrganizedCourses[key].lecture && isSubscribed) {
          newOrganizedCourses[key].lecture.details = await fetchDetails(
            newOrganizedCourses[key].lecture.value
          );
        }
        // Fetch details for labs
        for (const lab of newOrganizedCourses[key].labs) {
          if (isSubscribed) {
            lab.details = await fetchDetails(lab.value);
          }
        }
      }

      // Update state only if the component is still mounted.
      if (isSubscribed) {
        setOrganizedCourses(newOrganizedCourses);
        console.log("Organized Courses with Details: ", newOrganizedCourses);
        setIsLoading(false);
      }
    };

    // Execute the fetch operation if course data is available
    if (courses && courses.length > 0) {
      fetchAndStoreDetails();
    }

    // Cleanup function to set isSubscribed to false when component unmounts
    return () => {
      isSubscribed = false;
    };
  }, [courses]);// Dependency array to run effect when 'courses' changes

  // Function to fetch detailed course information from the API
  const fetchDetails = async (value) => {
    const url = `https://www.sfu.ca/bin/wcm/course-outlines?2024/summer/${courseName}/${courseNum}/${value}`;

    try {
      const response = await axios.get(url);
      return response.data;
    } catch (error) {
      console.error(`Error fetching details for ${value}:`, error);
      return {}; // Return an empty object in case of error
    }
  };

  // Function to organized courses into a structured format with lectures and labs
  const organizeCourses = (course) => {
    const organizedCourses = {};

    courses.forEach((course) => {
      const key = course.associatedClass[0];
      if (!organizedCourses[key]) {
        organizedCourses[key] = {
          course: courseName.toUpperCase() + " " + courseNum,
          lecture: null,
          labs: [],
        };
      }
      if (course.classType === "e") {
        organizedCourses[key].lecture = course;
      } else if (course.classType === "n") {
        organizedCourses[key].labs.push(course);
      }
    });

    return organizedCourses;
  };

  // Display a message if no courses are available
  if (!courses || !Array.isArray(courses) || courses.length === 0) {
    return <div>No courses available</div>;
  }

  // Render the organized courses with lecture and lab details
  return !isLoading ? (
    <div>
      {Object.entries(organizedCourses).map(([key, value]) => (
        <div key={key}>
          <h3>
            Lecture:{""}
            {value.lecture
              ? `${value.lecture.title} (${value.lecture.value})`
              : "No lecture available"}
          </h3>
          {value.labs.length > 0 && (
            <ul>
              {value.labs.map((lab) => (
                <li key={lab.value}>
                  {lab.title} ({lab.value})
                </li>
              ))}
            </ul>
          )}
        </div>
      ))}
      {/* Priority Slider */}
      <div>
        <p>Set Priority: </p>
        <CoursePrioritySlider
          priority={priority}
          onChange={(newPriority) => setPriority(newPriority)}
        />
      </div>
      {/* Select course button */}
      <button onClick={() => onSelectCourse(priority, organizedCourses)}>
        Select This Course
      </button>
    </div>
  ) : (
    <p>Loading course deatails...s</p>
  );
};

export default RenderCourse;
