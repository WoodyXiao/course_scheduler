/** 
This is the button that handle the event of generating the optimized course schedule by the weighted interval schedule algorithm
*/

import React, { useState } from "react";
import {
  restructureSelectedCourses,
  simplifySelectedCourses,
} from "../utils/utils.jsx";
import Schedule from "../components/Schedule.jsx";
import ActionButton from "../components/ActionButton.jsx";

const GenerateSchedule = ({ selectedCourses }) => {
  const [selectedSchedule, setSelectedSchedule] = useState({
    schedule: [],
    totalPriority: 0,
  });

  // ---------------- Weighted Interval Scheduling Algorithm Implementation ---------------------

  // // Function to check if two sessions overlap
  // const doSessionsOverlap = (session1, session2) => {
  //   const days1 = session1.days.split(", ");
  //   const days2 = session2.days.split(", ");
  //   const timeOverlap = !(
  //     Date.parse(`01/01/2000 ${session1.endTime}`) <=
  //       Date.parse(`01/01/2000 ${session2.startTime}`) ||
  //     Date.parse(`01/01/2000 ${session2.endTime}`) <=
  //       Date.parse(`01/01/2000 ${session1.startTime}`)
  //   );
  //   return days1.some((day) => days2.includes(day)) && timeOverlap;
  // };

  // // Simplefies the handling of multiple days for a single lecture or lab session
  // const expandScheduleEntries = (scheduleEntries) => {
  //   return scheduleEntries.flatMap((entry) => {
  //     return entry.days.split(", ").map((day) => ({
  //       ...entry,
  //       day, // Override the days field with the single day for comparision
  //     }));
  //   });
  // };

  // // Main Function for Course Scheduling
  // const scheduleCourses = (simplifiedCourses) => {
  //   let bestSchedule = [];
  //   let maxPriority = 0;

  //   const buildSchedule = (currentIndex, currentSchedule, currentPriority) => {
  //     if (currentIndex === simplifiedCourses.length) {
  //       if (currentPriority > maxPriority) {
  //         bestSchedule = currentSchedule;
  //         maxPriority = currentPriority;
  //       }
  //       return;
  //     }

  //     const courseGroup = simplifiedCourses[currentIndex];
  //     const groupPriority = parseInt(courseGroup.priority, 10);

  //     courseGroup.courses.forEach((course) => {
  //       // 获取课程的所有 lecture 和 lab 的时间段
  //       const lectureEntries = expandScheduleEntries(
  //         course.lecture.scheduleEntries
  //       );
  //       const labOptions =
  //         course.labs.length > 0
  //           ? course.labs.map((lab) =>
  //               expandScheduleEntries(lab.scheduleEntries)
  //             )
  //           : [[]];

  //       labOptions.forEach((labEntries) => {
  //         const allEntries = [...lectureEntries, ...labEntries.flat()];

  //         const hasAnyConflict = allEntries.some((entry) =>
  //           currentSchedule.some((scheduleCourse) =>
  //             scheduleCourse.scheduleEntries.some((scheduledSession) =>
  //               doSessionsOverlap(entry, scheduledSession)
  //             )
  //           )
  //         );

  //         if (!hasAnyConflict) {
  //           const newPriority = currentPriority + groupPriority;
  //           const newSchedule = [
  //             ...currentSchedule,
  //             {
  //               courseId: course.courseId,
  //               courseName: course.courseName,
  //               lecture: course.lecture.text,
  //               lab: labEntries.length > 0 ? labEntries[0].text : "",
  //               scheduleEntries: allEntries,
  //               priority: groupPriority,
  //             },
  //           ];
  //           buildSchedule(currentIndex + 1, newSchedule, newPriority);
  //         }
  //       });
  //     });

  //     // Skip this courseGroup and check the next one.
  //     buildSchedule(currentIndex + 1, currentSchedule, currentPriority);
  //   };

  //   // Initialize recursive scheduling an empty schedule and zero total priority.
  //   buildSchedule(0, [], 0);

  //   return { schedule: bestSchedule, totalMaxPriority: maxPriority };
  // };

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
    let dp = new Array(simplifiedCourses.length + 1);
    for (let i = 0; i < dp.length; i++) {
      dp[i] = [];
    }
    dp[0] = [{ schedule: [], totalPriority: 0 }];

    for (let i = 1; i <= simplifiedCourses.length; i++) {
      const courseGroup = simplifiedCourses[i - 1];
      dp[i] = [...dp[i - 1]]; // Start with all previous possibilities

      courseGroup.courses.forEach((course) => {
        const lectureEntries = expandScheduleEntries(
          course.lecture.scheduleEntries
        );
        const labOptions = course.labs.length > 0 ? course.labs : [null]; // Ensure that lab options are considered even if there are no labs

        dp[i - 1].forEach((previousSchedule) => {
          labOptions.forEach((lab) => {
            const labEntries = lab
              ? expandScheduleEntries(lab.scheduleEntries)
              : [];
            const allEntries = [...lectureEntries, ...labEntries]; // Include both lecture and lab entries

            const hasAnyConflict = allEntries.some((entry) =>
              previousSchedule.schedule.some((scheduledCourse) =>
                scheduledCourse.scheduleEntries.some((scheduledSession) =>
                  doSessionsOverlap(entry, scheduledSession)
                )
              )
            );

            if (!hasAnyConflict) {
              const newSchedule = {
                schedule: [
                  ...previousSchedule.schedule,
                  {
                    courseId: course.courseId,
                    courseName: course.courseName,
                    lecture: course.lecture.text,
                    lab: lab ? lab.text : "", // Properly display the lab text if it exists
                    scheduleEntries: allEntries, // Include all schedule entries
                    priority: parseInt(courseGroup.priority, 10),
                  },
                ],
                totalPriority:
                  previousSchedule.totalPriority +
                  parseInt(courseGroup.priority, 10),
              };

              dp[i].push(newSchedule);
            }
          });
        });
      });
    }

    // Select the schedule with the highest total priority
    let bestSchedule = dp[simplifiedCourses.length].reduce(
      (best, current) => {
        return current.totalPriority > best.totalPriority ? current : best;
      },
      { schedule: [], totalPriority: 0 }
    );

    return bestSchedule;
  };

  return (
    <div>
      <h3 className="font-bold">3.Now generate a schedule</h3>
      <ActionButton
        text={"Generate Schedule"}
        onClick={() => {
          const finalSelectedCourses = simplifySelectedCourses(
            restructureSelectedCourses(selectedCourses)
          );
          console.log("Selected Courses:", finalSelectedCourses);
          const newSelectedSchedule = scheduleCourses(finalSelectedCourses);
          console.log("Selected Schedule:", newSelectedSchedule);
          setSelectedSchedule(newSelectedSchedule);
        }}
      />
      {selectedSchedule.schedule.length !== 0 && (
        <>
          <ActionButton
            text={"clear"}
            onClick={() =>
              setSelectedSchedule({
                schedule: [],
                totalPriority: 0,
              })
            }
          />
          <Schedule
            schedule={selectedSchedule.schedule}
            totalMaxPriority={selectedSchedule.totalPriority}
          />
        </>
      )}
    </div>
  );
};

export default GenerateSchedule;
