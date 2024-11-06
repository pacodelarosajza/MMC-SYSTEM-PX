import React, { useState } from "react";
import AppForm from "./ProjectsManagmentForm";

const ProjectsManagmentForm = () => {
  // NEW PROJECT "CARD" OPERATIONS
  const [showCard, setShowCard] = useState(false);
  const handleButtonClick = () => {
    setShowCard(!showCard);
  };

  return (
    <div className=" py-10 pb-20">
      <button
        onClick={handleButtonClick}
        className="w-full bg-gray-900 border border-blue-500 text-blue-400 font-bold shadow-lg px-5 py-2 my-2 hover:border hover:bg-blue-900 hover:border-blue-500 hover:text-blue-300 rounded"
      >
        Register a new project
      </button>

      {showCard && (
        <div className="bg-gray-800 px-5 rounded-lg shadow-lg mb-5">
          <div className="pt-5 pb-3 text-sm text-gray-200">
            <h5 className=" pb-1 ">
              Complete the following information to register a project. Remember
              that, although you can edit the data later, once uploaded, all
              users will be able to see the project information.
              <strong>
                {" "}
                Fields marked with <span className="text-red-500">*</span> are
                required.
              </strong>
            </h5>
          </div>
          <AppForm />
        </div>
      )}
    </div>
  );
};

export default ProjectsManagmentForm;
