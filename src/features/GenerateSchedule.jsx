/** 
This is the button that handle the event of generating the optimized course schedule by the weighted interval schedule algorithm
*/

import React, { useState } from "react";
import {
  restructureSelectedCourses,
  simplifySelectedCourses,
} from "../utils/utils.jsx";
import Schedule from "./Schedule.jsx";

const GenerateSchedule = ({ selectedCourses }) => {
  const [selectedSchedule, setSelectedSchedule] = useState({
    schedule: [],
    totalMaxPriority: 0,
  });

  // ---------------- Weighted Interval Scheduling Algorithm Implementation ---------------------

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

  // Simplefies the handling of multiple days for a single lecture or lab session
  const expandScheduleEntries = (scheduleEntries) => {
    return scheduleEntries.flatMap((entry) => {
      return entry.days.split(", ").map((day) => ({
        ...entry,
        day, // Override the days field with the single day for comparision
      }));
    });
  };

  // Main Function for Course Scheduling
  const scheduleCourses = (simplifiedCourses) => {
    let bestSchedule = [];
    let maxPriority = 0;

    const buildSchedule = (currentIndex, currentSchedule, currentPriority) => {
      if (currentIndex === simplifiedCourses.length) {
        if (currentPriority > maxPriority) {
          bestSchedule = currentSchedule;
          maxPriority = currentPriority;
        }
        return;
      }

      const courseGroup = simplifiedCourses[currentIndex];
      const groupPriority = parseInt(courseGroup.priority, 10); // Convert priority to integer.

      courseGroup.courses.forEach((course) => {
        const lectureEntries = expandScheduleEntries(
          course.lecture.scheduleEntries
        );
        const labOptions = [null, ...course.labs];

        labOptions.forEach((lab) => {
          const labEntries = lab
            ? expandScheduleEntries(lab.scheduleEntries)
            : [];
          const allEntries = [...lectureEntries, ...labEntries];

          const hasAnyConflict = allEntries.some((entry) =>
            currentSchedule.some((scheduleCourse) =>
              scheduleCourse.scheduleEntries.some((scheduledSession) =>
                doSessionsOverlap(entry, scheduledSession)
              )
            )
          );

          if (!hasAnyConflict) {
            const newPriority = currentPriority + groupPriority;
            const newSchedule = [
              ...currentSchedule,
              {
                courseId: course.courseId,
                courseName: course.courseName,
                lecture: course.lecture.text,
                lab: lab ? lab.text : "",
                scheduleEntries: allEntries,
                priority: groupPriority,
              },
            ];
            buildSchedule(currentIndex + 1, newSchedule, newPriority);
          }
        });
      });

      // Skip this courseGroup and check the next one.
      buildSchedule(currentIndex + 1, currentSchedule, currentPriority);
    };

    // Initialize recursive scheduling an empty schedule and zero total priority.
    buildSchedule(0, [], 0);

    return { schedule: bestSchedule, totalMaxPriority: maxPriority };
  };

  return (
    <div>
      <button
        className="flex-shrink-0 bg-sfu-light-red hover:bg-sfu-dark-red border-sfu-light-red hover:border-sfu-dark-red text-sm border-4 text-white py-1 px-2 rounded"
        onClick={() => {
          const finalSelectedCourses = simplifySelectedCourses(
            restructureSelectedCourses(selectedCourses)
          );
          console.log("Selected Courses:", finalSelectedCourses);
          const newSelectedSchedule = scheduleCourses(finalSelectedCourses);
          console.log("Selected Schedule:", newSelectedSchedule);
          setSelectedSchedule(newSelectedSchedule);
        }}
      >
        Generate Schedule
      </button>
      {selectedSchedule.schedule.length !== 0 && (
        <>
          <button
            className="flex-shrink-0 bg-sfu-light-red hover:bg-sfu-dark-red border-sfu-light-red hover:border-sfu-dark-red text-sm border-4 text-white py-1 px-2 rounded"
            onClick={() =>
              setSelectedSchedule({
                schedule: [],
                totalPriority: 0,
              })
            }
          >
            clear
          </button>
          <Schedule
            schedule={selectedSchedule.schedule}
            totalMaxPriority={selectedSchedule.totalMaxPriority}
          />
        </>
      )}
    </div>
  );
};

export default GenerateSchedule;
