/**
 *  this is for the sfu course api
 */
import axios from "axios";

const fetchCourseData = (courseName, courseNum, onSuccess, onError) => {
  const courseURL = `http://www.sfu.ca/bin/wcm/course-outlines?2024/summer/${courseName}/${courseNum}`;

  axios
    .get(courseURL)
    .then((data) => onSuccess(data.data))
    .catch((error) => onError(error));
};

export { fetchCourseData };
