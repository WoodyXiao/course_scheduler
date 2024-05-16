import React, { useEffect } from "react";
import axios from "axios";

const SelectMultiCourses = ({
  courseList,
  fetchCourseData,
  setSelectedCourses,
}) => {
    
  const fetchDetails = async (courseName, courseNum, value) => {
    const url = `https://www.sfu.ca/bin/wcm/course-outlines?2024/summer/${courseName}/${courseNum}/${value}`;
    try {
      const response = await axios.get(url);
      return response.data;
    } catch (error) {
      console.error(`Error fetching details for ${value}:`, error);
      return {}; // Return an empty object in case of error
    }
  };

  return <div></div>;
};

export default SelectMultiCourses;
