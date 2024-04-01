/** 
This is the button that handle the event of generating the optimized course schedule by the weighted interval schedule algorithm
*/

import React from "react";

const GeneratSchedule = ({ selectedCourses }) => {
  // Function to restructure selectedCourses
  const restructureSelectedCourses = () => {
    const newSelectedCourses = selectedCourses.map((courseObj) => {
      const newCourseObj = {};
      for (const key in courseObj) {
        if (!courseObj.hasOwnProperty(key)) continue;

        const course = courseObj[key];
        newCourseObj[key] = {
          course: course.course,
          lecture: course.lecture
            ? {
                text: course.lecture.text,
                value: course.lecture.value,
                sectionCode: course.lecture.sectionCode,
                courseSchedule: course.lecture.details?.courseSchedule ?? [],
              }
            : null,
          labs:
            course.labs?.map((lab) => ({
              text: lab.text,
              value: lab.value,
              sectionCode: lab.sectionCode,
              courseSchedule: lab.details?.courseSchedule ?? [],
            })) ?? [],
        };
        newCourseObj.priority = courseObj.priority;
      }

      return newCourseObj;
    });

    console.log("Restructured Selected Courses:", newSelectedCourses);

    return newSelectedCourses;
  };
};
