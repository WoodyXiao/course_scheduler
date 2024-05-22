import React, { useEffect } from "react";
import { fetchDetails } from "../api/api";

const SelectMultiCourses = ({
  courseList,
  fetchCourseData,
  setSelectedCourses,
}) => {
  const processCourseList = async () => {
    for (const courseItem of courseList) {
      console.log("Processing course:", courseItem);
      fetchCourseData(
        courseItem.courseName,
        courseItem.courseNum,
        async (response) => {
          console.log(
            "Fetched data for:",
            courseItem.courseName,
            courseItem.courseNum,
            response
          );
          if (response) {
            const organizedCourses = await organizeCourses(
              response,
              courseItem.courseName,
              courseItem.courseNum
            );
            console.log("Organized courses:", organizedCourses);
            Object.values(organizedCourses).forEach((course) =>
              handleSelectWithPriority(courseItem.priority, course)
            );
          }
        },
        (error) => {
          console.error("Error fetching course data:", error);
        }
      );
    }
  };

  const handleSelectWithPriority = (priority, course) => {
    console.log(`Adding course with priority ${priority}:`, course);
    setSelectedCourses((prevCourses) => {
      // Check if current course existed or not.
      let found = false;
      const updatedCourses = prevCourses.map((c) => {
        if (c.course === course.course) {
          found = true;
          // Check its lecture session is same or not.
          let sessionExists = Object.values(c).some(
            (session) =>
              session.lecture && session.lecture.value === course.lecture.value
          );
          if (!sessionExists) {
            // If not, add it.
            const newSessionNumber =
              Object.keys(c).reduce(
                (max, key) =>
                  !isNaN(key) && parseInt(key) > max ? parseInt(key) : max,
                0
              ) + 1;
            c[newSessionNumber] = {
              course: course.course,
              lecture: course.lecture,
              labs: course.labs,
            };
          }
        }
        return c;
      });

      // If there is no such course, create one.
      if (!found) {
        const newCourse = {
          course: course.course,
          1: {
            course: course.course,
            lecture: course.lecture,
            labs: course.labs,
          },
          priority: priority,
        };
        updatedCourses.push(newCourse);
      }

      return updatedCourses;
    });
  };

  const organizeCourses = async (courses, courseName, courseNum) => {
    const organizedCourses = {};
    const fetchPromises = [];

    courses.forEach((course) => {
      const key = course.associatedClass;
      if (!organizedCourses[key]) {
        organizedCourses[key] = {
          course: `${courseName.toUpperCase()} ${courseNum}`,
          lecture: null,
          labs: [],
        };
      }
      if (course.classType === "e") {
        organizedCourses[key].lecture = course;
        fetchPromises.push(
          fetchDetails(courseName, courseNum, course.value).then((details) => {
            course.details = details;
          })
        );
      } else if (course.classType === "n") {
        organizedCourses[key].labs.push(course);
        fetchPromises.push(
          fetchDetails(courseName, courseNum, course.value).then((details) => {
            course.details = details;
          })
        );
      }
    });

    await Promise.all(fetchPromises);

    // Remove any group where the lecture is null to ensure each has a lecture
    Object.keys(organizedCourses).forEach((key) => {
      if (!organizedCourses[key].lecture) {
        delete organizedCourses[key];
      }
    });

    return organizedCourses;
  };

  return (
    <div>
      <div>
        <p>or</p>
        <h3 className="font-bold">Select multiple courses</h3>
        <button className="flex-shrink-0 bg-sfu-light-red hover:bg-sfu-dark-red border-sfu-light-red hover:border-sfu-dark-red text-sm border-4 text-white py-1 px-2 rounded" onClick={() => processCourseList()}>Fast select</button>
      </div>
    </div>
  );
};

export default SelectMultiCourses;
