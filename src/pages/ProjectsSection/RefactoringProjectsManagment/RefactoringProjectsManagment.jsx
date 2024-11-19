import React from "react";

import AppTable from "../RefactoringProjectsManagment/ProjectsManagmentTable"; 
import AppCreate from "../RefactoringProjectsManagment/Create";

function RefactoringProjectsManagment() {
  return (
    <>
      <div className="min-h-screen m-5 mt-10">
        <h1 className="text-3xl font-extrabold text-gray-500 mt-5 text-right">
          Projects management
        </h1>
        <div className="m-5 mt-10">
          <AppCreate />
        </div>
        <div className="px-5 py-3">
          <AppTable />
        </div>        
      </div>
    </>
  );
}

export default RefactoringProjectsManagment;