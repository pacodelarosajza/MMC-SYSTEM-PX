// Modal.js
import React from "react";

const Modal = ({ isOpen, onClose, title, children }) => {
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
        <div className="pt-10 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1 border border-blue-500 bg-blue-900 text-blue-300 hover:border-blue-400 hover:bg-blue-700 hover:text-blue-200 rounded"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default Modal;
