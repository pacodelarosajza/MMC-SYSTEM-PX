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
            className="w-15 px-4 py-2 font-medium hover:bg-blue-600 text-sm bg-pageBackground rounded"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default Modal;
