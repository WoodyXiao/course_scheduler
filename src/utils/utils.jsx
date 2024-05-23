// Function to extract course number from a string
const extractCourseNum = (input) => {
  // Handle the case when the input course is writing course.
  if (input[input.length - 1] === "w") {
    return input.match(/\d+/g) ? input.match(/\d+/g).join("") + "w" : "";
  }

  return input.match(/\d+/g) ? input.match(/\d+/g).join("") : "";
};

// Function to extract course name from a string
const extractCourseName = (input) => {
  // Handle the case when input course is writing course.
  if (input[input.length - 1] === "w") {
    if (input.match(/[^\d]+/g)) {
      input = input
        .match(/[^\d]+/g)
        .join("")
        .trim();

      return input.substring(0, input.length - 1).trim();
    } else {
      return "";
    }
  }
  return input.match(/[^\d]+/g)
    ? input
        .match(/[^\d]+/g)
        .join("")
        .trim()
    : "";
};

// Function to restructure selectedCourse.
const restructureSelectedCourses = (selectedCourses) => {
  const newSelectedCourses = selectedCourses.map((courseObj) => {
    const newCourseObj = {};
    for (const key in courseObj) {
      if (!courseObj.hasOwnProperty(key) || key === "course") continue;

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

// Function to simplify the selectedCourses structure.
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
            scheduleEntries: course.lecture.courseSchedule.map((schedule) => ({
              ...schedule,
              type: "lecture", // Adding type to distinguish between lecture and lab
            })),
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

const COURSE_URL = `https://www.sfu.ca/students/calendar/2024/summer/courses/`;

export { extractCourseNum, extractCourseName, restructureSelectedCourses, simplifySelectedCourses, COURSE_URL };