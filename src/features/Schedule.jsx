import React from "react";

const Schedule = ({ schedule, totalPriority }) => {
  return (
    <div>
      <h3>Your Schedule</h3>
      <p>Here is your customized course schedule with the maximum priority:</p>
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
      <h5>Total Priority: {totalPriority}</h5>
    </div>
  );
};

export default Schedule;
