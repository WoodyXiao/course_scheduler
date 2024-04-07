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

export { extractCourseNum, extractCourseName };
