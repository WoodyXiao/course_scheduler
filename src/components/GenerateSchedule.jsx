/** 
This is the button that handle the event of generating the optimized course schedule by the weighted interval schedule algorithm
*/

import React from "react";
import {restructureSelectedCourses, simplifySelectedCourses} from "../utils/utils.jsx";

const GenerateSchedule = ({ selectedCourses }) => {

  // ---------------- Weighted Interval Scheduling Algorithm Implementation ---------------------

  // Main Function for Course Scheduling
  const scheduleCourses = (simplifiedCourses) => {
    let finalSchedule = [];
    let totalMaxPriority = 0;

    // Function to check if two sessions overlap
    const doSessionsOverlap = (session1, session2) => {
      const days1 = session1.days.split(", ");
      const days2 = session2.days.split(", ");
      const timeOverlap = !(
        Date.parse(`01/01/2000 ${session1.endTime}`) <=
          Date.parse(`01/01/2000 ${session2.startTime}`) ||
        Date.parse(`01/01/2000 ${session2.endTime}`) <=
          Date.parse(`01/01/2000 ${session1.startTime}`)
      );
      return days1.some((day) => days2.includes(day)) && timeOverlap;
    };

    // Create a copy of the courses sorted by priority
    const courseOptions = [...simplifiedCourses].sort(
      (a, b) => b.priority - a.priority
    );

    // Function to check for global conflicts
    const isGloballyConflicting = (scheduleEntry) => {
      return finalSchedule.some((scheduledCourse) =>
        scheduledCourse.scheduleEntries.some((scheduledSession) =>
          doSessionsOverlap(scheduleEntry, scheduledSession)
        )
      );
    };

    // Iterate over each course group
    courseOptions.forEach((courseGroup) => {
      let chosenCourse = null;
      let maxPriority = -1;

      // Evaluate each course in the group
      courseGroup.courses.forEach((course) => {
        const { lecture, labs } = course;

        // Check if the lecture session conflicts
        if (!lecture.scheduleEntries.some(isGloballyConflicting)) {
          // Find a non-conflicting lab session, if labs are available
          let availableLab = null;
          if (labs.length > 0) {
            availableLab = labs.find(
              (lab) => !lab.scheduleEntries.some(isGloballyConflicting)
            );
            if (!availableLab) return; // No suitable lab found, skip this course
          }

          // If a non-conflicting lab is found, or there are no labs
          if (availableLab || labs.length === 0) {
            if (courseGroup.priority > maxPriority) {
              chosenCourse = {
                ...course,
                chosenLab: availableLab ? availableLab.text : null,
              };
              maxPriority = courseGroup.priority;
            }
          }
        }
      });

      // If a course was chosen, add it to the final schedule
      if (chosenCourse) {
        finalSchedule.push({
          courseId: chosenCourse.courseId,
          courseName: chosenCourse.courseName,
          lecture: chosenCourse.lecture.text,
          lab: chosenCourse.chosenLab,
          scheduleEntries: [
            ...chosenCourse.lecture.scheduleEntries,
            ...(chosenCourse.chosenLab
              ? chosenCourse.labs.find(
                  (lab) => lab.text === chosenCourse.chosenLab
                ).scheduleEntries
              : []),
          ],
          priority: courseGroup.priority,
        });
        totalMaxPriority += parseInt(courseGroup.priority, 10);
      }
    });

    return { schedule: finalSchedule, totalMaxPriority };
  };

  return (
    <div>
      <button
        onClick={() => {
          const finalSelectedCourses = simplifySelectedCourses(
            restructureSelectedCourses(selectedCourses)
          );
          console.log("Selected Courses:", finalSelectedCourses);
          const selectedSchedule = scheduleCourses(finalSelectedCourses);
          console.log("selected schedule:", selectedSchedule);
        }}
      >
        Restructure Selected Courses
      </button>
    </div>
  );
};

export default GenerateSchedule;
