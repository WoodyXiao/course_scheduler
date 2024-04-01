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

  // Function to simplify the selectedCourses structure
  const simplifySelectedCourses = (selectedCourses) => {
    return selectedCourses.map((courseObj) => {
      const courseEntries = Object.entries(courseObj).filter(
        ([key]) => key !== "priority"
      );
      const priority = courseObj.priority;

      const simplifiedCourse = courseEntries.map(([key, course]) => {
        const lecture = course.lecture
          ? {
              text: course.lecture.text,
              value: course.lecture.value,
              scheduleEntries: course.lecture.courseSchedule.map(
                (schedule) => ({
                  ...schedule,
                  type: "lecture", // Adding type to distinguish between lecture and lab
                })
              ),
            }
          : null;

        const labs =
          course.labs?.map((lab) => ({
            text: lab.text,
            value: lab.value,
            scheduleEntries: lab.courseSchedule.map((schedule) => ({
              ...schedule,
              type: "lab", // Adding type for labs
            })),
          })) ?? [];

        return {
          courseId: key,
          courseName: course.course,
          lecture,
          labs,
        };
      });

      return {
        courses: simplifiedCourse,
        priority,
      };
    });
  };
};
