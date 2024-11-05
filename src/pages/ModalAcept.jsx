import React from "react";

const ModalAcept = ({ isOpen, onClose, onContinue, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed z-10 inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="p-5 bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-md">
        <div className="p-5 flex flex-col justify-center items-center">
          <h2 className="text-4xl font-semibold mb-6 text-blue-500">{title}</h2>
          <p className="text-xl text-gray-900 dark:text-gray-100">
            {children}
          </p>
        </div>
        <div className="pt-10 flex justify-end space-x-4">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1 border border-red-500 bg-red-900 text-red-300 hover:border-red-400 hover:bg-red-700 hover:text-red-200 rounded"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onContinue}
            className="px-3 py-1 border border-green-500 bg-green-900 text-green-300 hover:border-green-400 hover:bg-green-700 hover:text-green-200 rounded"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalAcept;