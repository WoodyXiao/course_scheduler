/** 
This is the button that handle the event of generating the optimized course schedule by the weighted interval schedule algorithm
*/

import React from "react";

const GenerateSchedule = ({ selectedCourses }) => {
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
          const selectedCourses = simplifySelectedCourses(
            restructureSelectedCourses()
          );
          console.log("Selected Courses:", selectedCourses);
          const selectedSchedule = scheduleCourses(selectedCourses);
          console.log("selected schedule:", selectedSchedule);
        }}
      >
        Restructure Selected Courses
      </button>
    </div>
  );
};

export default GenerateSchedule;
