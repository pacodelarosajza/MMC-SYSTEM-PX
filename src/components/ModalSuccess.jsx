
import React from "react";

const ModalSuccess = ({ isOpen, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed z-10 inset-0 flex items-center justify-center bg-black bg-opacity-60 transition-opacity duration-300">
      <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-2xl transform scale-100 transition-transform duration-200 w-full max-w-md">
        <div className="p-5 flex flex-col justify-center items-center">
          <h2 className="text-2xl font-bold mb-4 text-green-600">{title}</h2>
          <div className="text-center text-gray-700 dark:text-gray-300">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModalSuccess;