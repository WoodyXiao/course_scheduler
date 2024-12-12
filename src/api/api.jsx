/**
 *  this is for the sfu course api
 */
import axios from "axios";

const fetchCourseData = (courseName, courseNum, onSuccess, onError) => {
  const courseURL = `https://www.sfu.ca/bin/wcm/course-outlines?2025/spring/${courseName}/${courseNum}`;

  axios
    .get(courseURL)
    .then((data) => onSuccess(data.data))
    .catch((error) => onError(error));
};

// Function to fetch detailed course information from the API.
const fetchDetails = async (courseName, courseNum, value) => {
  const url = `https://www.sfu.ca/bin/wcm/course-outlines?2025/spring/${courseName}/${courseNum}/${value}`;

  try {
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error(`Error fetching details for ${value}:`, error);
    return {}; // Return an empty object in case of error
  }
};

export { fetchCourseData, fetchDetails };
