import LoadingSpinner from './LoadingSpinner';

const ActionButton = ({ text, className, onClick, isLoading = false, disabled = false }) => {
  return (
    <button
      className={`flex-shrink-0 bg-sfu-light-red hover:bg-sfu-dark-red border-sfu-light-red hover:border-sfu-dark-red text-sm border-4 text-white py-1 px-2 rounded flex items-center justify-center space-x-2 ${disabled || isLoading ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
      onClick={onClick}
      disabled={disabled || isLoading}
    >
      {isLoading && <LoadingSpinner size="small" color="white" />}
      <span>{text}</span>
    </button>
  );
};

export default ActionButton;
