const SuccessMessage = ({ message, action }) => {
  return (
    <div className="card max-w-md mx-auto text-center">
      <div className="text-green-500 text-5xl mb-4">✅</div>
      <h3 className="text-xl font-bold text-gray-800 mb-2">Success!</h3>
      <p className="text-gray-600 mb-4">{message}</p>
      {action && (
        <button onClick={action.onClick} className="btn-success">
          {action.label}
        </button>
      )}
    </div>
  );
};

export default SuccessMessage;