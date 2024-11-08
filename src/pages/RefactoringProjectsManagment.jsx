import React from "react";

import AppTable from "./ProjectsManagmentTable"; 
import AppForm from "./ProjectsManagmentNewProject";

function RefactoringProjectsManagment() {
  return (
    <>
      <div className="px-4 py-5 min-h-screen">
        <h1 className="text-3xl font-extrabold text-gray-500 mt-5 px-10 text-right">
          Projects management
        </h1>
        <AppTable />
        <AppForm /> 
      </div>
    </>
  );
}

export default RefactoringProjectsManagment;
