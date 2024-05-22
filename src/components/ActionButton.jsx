const ActionButton = ({ text, className, onClick }) => {
  return (
    <button
    className={`flex-shrink-0 bg-sfu-light-red hover:bg-sfu-dark-red border-sfu-light-red hover:border-sfu-dark-red text-sm border-4 text-white py-1 px-2 rounded ${className}`}
      onClick={onClick}
    >
      {text}
    </button>
  );
};

export default ActionButton;
