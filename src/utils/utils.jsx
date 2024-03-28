// Function to extract course number from a string
const extractCourseNum = (input) => {
  return input.match(/\d+/g) ? input.match(/\d+/g).join("") : "";
};

// Function to extract course name from a string
const extractCourseName = (input) => {
  return input.match(/[^\d]+/g)
    ? input
        .match(/[^\d]+/g)
        .join("")
        .trim()
    : "";
};

export { extractCourseNum, extractCourseName };
