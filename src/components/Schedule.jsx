import React from "react";
import {extractCourseNum} from "../utils/utils";

const Schedule = ({ schedule, totalMaxPriority }) => {
  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 8; hour < 19; hour++) {
      for (let minute = 0; minute < 60; minute += 10) {
        slots.push(`${hour}:${minute.toString().padStart(2, "0")}`);
      }
    }
    return slots;
  };

  const timeSlots = generateTimeSlots();
  const days = ["Mo", "Tu", "We", "Th", "Fr"];

  const timeToMinutes = (time) => {
    const [hours, minutes] = time.split(":").map(Number);
    return hours * 60 + minutes;
  };

  const findCourseStartAtTime = (day, time) => {
    return schedule.flatMap((course) =>
      course.scheduleEntries
        .filter((entry) => entry.day === day && entry.startTime === time)
        .map((entry) => ({
          ...course,
          rowSpan:
            Math.floor(
              (timeToMinutes(entry.endTime) - timeToMinutes(entry.startTime)) /
                10
            ) + 1,
          ...entry,
        }))
    );
  };

  const getColor = (courseId) => {
    const baseColors = [
      "red",
      "green",
      "blue",
      "navy",
      "teal",
      "pink",
      "indigo",
      "grey",
      "orange",
      "beige",
      "aqua",
      "teal",
      "yellow",
      "brown",
      "purple",
    ];
    console.log("tt", courseId);
    return `${baseColors[parseInt(courseId) % baseColors.length]}`;
  };

  return (
    <>
      <div>
        <h3>Your Schedule</h3>
        <p>
          Here is your customized course schedule with the maximum priority:
        </p>
        <ul>
          {schedule.map((course) => (
            <li key={course.courseName}>
              <h4>
                {course.courseName} (Priority: {course.priority})
              </h4>
              <div>
                <strong>Lecture:</strong> {course.lecture}
                {course.scheduleEntries.map((entry, index) => (
                  <div key={index}>
                    <p>
                      Type: {entry.type} - {entry.days} {entry.startTime} to{" "}
                      {entry.endTime}
                    </p>
                  </div>
                ))}
                {course.lab && (
                  <div>
                    <strong>Lab:</strong> {course.lab}
                  </div>
                )}
              </div>
            </li>
          ))}
        </ul>
        <h5>Total Max Priority: {totalMaxPriority}</h5>
      </div>

      <div className="container mx-auto mt-4">
        <div className="overflow-x-auto">
          <table className="min-w-full table-auto border-collapse border border-gray-400 text-xs">
            <thead>
              <tr>
                <th className="border border-gray-300 bg-gray-200 p-1 w-12">
                  Time
                </th>
                {days.map((day) => (
                  <th
                    key={day}
                    className="border border-gray-300 bg-gray-200 p-1 w-1/5"
                  >
                    {day}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {timeSlots.map((time) => (
                <tr key={time}>
                  <td className="border border-gray-300 p-1 text-center w-12">
                    {time}
                  </td>
                  {days.map((day) => {
                    const coursesAtThisTime = findCourseStartAtTime(day, time);
                    if (coursesAtThisTime.length > 0) {
                      return coursesAtThisTime.map((course) => (
                        <td
                        style={{background:`${getColor(extractCourseNum(course.courseName))}`}}
                          key={course.courseId}
                          rowSpan={course.rowSpan}
                          className={`border border-gray-300 p-1 ${getColor(
                            course.courseId
                          )}`}
                        >
                          {`${course.courseName} (${course.sectionCode}) - ${course.campus} (${course.startTime}-${course.endTime})`}
                        </td>
                      ));
                    } else {
                      return (
                        <td
                          key={day}
                          className="border border-gray-300 p-1"
                        ></td>
                      );
                    }
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default Schedule;
