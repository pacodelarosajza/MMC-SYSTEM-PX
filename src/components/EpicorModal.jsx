import React from "react";

const EpicorModal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed z-10 inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white dark:bg-gray-800 rounded shadow-lg w-11/12 max-w-7xl p-6 relative z-10">
        <div className="p-4 flex flex-col justify-center">
          <h2 className="text-3xl font-medium mb-4 text-green-500">{title}</h2>
          <div className="overflow-auto max-h-[75vh] w-full">
            <p className="text-lg text-gray-900 dark:text-gray-100">
              {children}
            </p>
          </div>
        </div>
        <div className="px-8 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1 border border-red-500 bg-red-900 text-red-300 hover:border-red-400 hover:bg-red-700 hover:text-red-200 rounded"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default EpicorModal;