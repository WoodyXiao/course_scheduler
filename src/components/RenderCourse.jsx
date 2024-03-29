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
