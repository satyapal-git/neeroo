const ErrorMessage = ({ message, onRetry }) => {
  return (
    <div className="card max-w-md mx-auto text-center">
      <div className="text-red-500 text-5xl mb-4">⚠️</div>
      <h3 className="text-xl font-bold text-gray-800 mb-2">Oops! Something went wrong</h3>
      <p className="text-gray-600 mb-4">{message || 'An unexpected error occurred'}</p>
      {onRetry && (
        <button onClick={onRetry} className="btn-primary">
          Try Again
        </button>
      )}
    </div>
  );
};

export default ErrorMessage;