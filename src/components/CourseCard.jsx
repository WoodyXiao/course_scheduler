import React from "react";

const CourseCard = ({ courseID, title, description }) => {
  return (
    <div className="flex max-w-lg rounded overflow-hidden shadow-lg">
      <div className="flex items-center justify-center bg-blue-600 text-white text-xl font-bold p-4 w-26 h-24">
        {courseID}
      </div>
      <div className="px-6 py-4">
        <div className="font-bold text-xl mb-2">{title}</div>
        <p className="text-gray-700 text-base">{description}</p>
      </div>
    </div>
  );
};

export default CourseCard;
