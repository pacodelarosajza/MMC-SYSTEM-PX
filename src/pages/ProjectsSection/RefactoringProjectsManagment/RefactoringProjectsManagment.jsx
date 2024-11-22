import React from "react";

import AppTable from "../RefactoringProjectsManagment/ProjectsManagmentTable"; 
import AppCreate from "../RefactoringProjectsManagment/Create";
import AppCostProjects from "../RefactoringProjectsManagment/CostProjects";

function RefactoringProjectsManagment() {
  return (
    <>
      <div className="min-h-screen m-5 mt-10">
        <h1 className="text-3xl font-extrabold text-gray-500 mt-5 text-right">
          Projects management
        </h1>
        <h2 className="text-xl text-blue-400 font-bold text-right">Projects In Development</h2>
        <div className="m-5">
          <AppCreate />
        </div>
        <div className="px-5">
          <AppTable />
        </div> 
        <div className="px-5">
          <AppCostProjects />
        </div>        
      </div>
    </>
  );
}

export default RefactoringProjectsManagment;
