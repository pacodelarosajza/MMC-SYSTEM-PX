import React from "react";

import AppTable from "./ProjectsManagmentTable"; //Import projects table file
import AppForm from "./ProjectsManagmentNewProject"; //Import projects form file

function RefactoringProjectsManagment() {
  return (
    <>
      <div className="px-4 py-5 min-h-screen">
        <h1 className="text-2xl mt-5 px-10 font-bold text-right">
          Projects management
        </h1>
        <AppTable /> {/* Projects Table */}
        <AppForm /> {/* Projects Form */}
      </div>
    </>
  );
}

export default RefactoringProjectsManagment;
