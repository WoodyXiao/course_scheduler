import React from "react";
import Calendar from "./Calendar";

const Schedule = ({ schedule, totalMaxPriority }) => {
  return (
    <>
      <div>
        <h3>Your Schedule</h3>
        <p>
          Here is your customized course schedule with the maximum priority:
        </p>

        {/* new calendar */}
        <Calendar courseSchedule={schedule} />

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
    </>
  );
};

export default Schedule;
