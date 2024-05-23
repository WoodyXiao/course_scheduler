const CourseCard = ({ courseID, setCourseData, title, description, url }) => {

  const handleClose = () => {
    setCourseData(null);
  };

  return (
    <div className="relative flex max-w-lg rounded overflow-hidden shadow-lg">
      <button onClick={handleClose} className="absolute top-0 right-0 p-2">
        <svg
          className="h-6 w-6 text-gray-600 hover:text-gray-800"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path d="M6 18L18 6M6 6l12 12"></path>
        </svg>
      </button>
      <div className="flex items-center justify-center bg-blue-600 text-white text-xl font-bold p-4 w-26 h-24">
        {courseID}
      </div>
      <a href={url} target="_blank" rel="noreferrer">
        <div className="px-6 py-4 flex-grow">
          <div className="font-bold text-xl mb-2">{title}</div>
          <p className="text-gray-700 text-base">{description}</p>
        </div>
      </a>
    </div>
  );
};

export default CourseCard;
