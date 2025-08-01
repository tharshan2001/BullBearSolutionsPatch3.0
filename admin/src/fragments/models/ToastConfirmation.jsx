import React, { useEffect } from 'react';

const ToastConfirmation = ({ show, message, onConfirm, onCancel }) => {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        onCancel();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [show, onCancel]);

  if (!show) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-4 max-w-xs">
        <div className="flex items-start">
          <div className="flex-1">
            <p className="text-sm text-gray-700">{message}</p>
          </div>
          <button 
            onClick={onCancel}
            className="ml-2 text-gray-400 hover:text-gray-500"
          >
            &times;
          </button>
        </div>
        <div className="mt-3 flex justify-end space-x-2">
          <button
            onClick={onCancel}
            className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-3 py-1 text-sm bg-blue-600 text-white hover:bg-blue-700 rounded"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

export default ToastConfirmation;